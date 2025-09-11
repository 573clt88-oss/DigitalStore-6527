from fastapi import FastAPI, APIRouter, UploadFile, File, HTTPException, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import aiofiles
import ast
import re
import json
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="AI Code Debugger", description="AI-powered code error detection and debugging")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Initialize LLM Chat
llm_key = os.environ.get('EMERGENT_LLM_KEY')

# Define Models
class CodeAnalysisRequest(BaseModel):
    code: str
    language: str
    analysis_type: str = "full"  # full, syntax, runtime, security

class URLAnalysisRequest(BaseModel):
    url: str
    analysis_type: str = "full"

class ErrorReport(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_type: str  # file, paste, url
    language: str
    error_category: str
    severity: str  # low, medium, high, critical
    error_message: str
    line_number: Optional[int] = None
    suggested_fix: str
    explanation: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class AnalysisResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_type: str
    language: str
    total_errors: int
    errors: List[ErrorReport]
    overall_score: int  # 0-100, higher is better
    suggestions: List[str]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class DebuggingStep(BaseModel):
    step_number: int
    title: str
    description: str
    code_example: Optional[str] = None
    expected_outcome: str

class DebuggingWizard(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    analysis_id: str
    error_id: str
    steps: List[DebuggingStep]
    estimated_time: str
    difficulty_level: str  # beginner, intermediate, advanced

# Helper Functions
def detect_language(filename: str, code: str = "") -> str:
    """Detect programming language from filename or code content"""
    extension_map = {
        '.py': 'python',
        '.js': 'javascript',
        '.jsx': 'javascript',
        '.ts': 'typescript',
        '.tsx': 'typescript',
        '.html': 'html',
        '.css': 'css',
        '.java': 'java',
        '.cpp': 'cpp',
        '.c': 'c',
        '.php': 'php',
        '.rb': 'ruby',
        '.go': 'go',
        '.rs': 'rust'
    }
    
    ext = Path(filename).suffix.lower()
    if ext in extension_map:
        return extension_map[ext]
    
    # Fallback: try to detect from code content
    if 'import ' in code and 'def ' in code:
        return 'python'
    elif 'function' in code and ('{' in code or '=>' in code):
        return 'javascript'
    elif '<html' in code.lower() or '<!doctype' in code.lower():
        return 'html'
    
    return 'unknown'

def categorize_error(error_message: str, language: str) -> tuple:
    """Categorize error and determine severity"""
    error_lower = error_message.lower()
    
    # Syntax errors
    if any(keyword in error_lower for keyword in ['syntaxerror', 'syntax error', 'invalid syntax', 'unexpected token']):
        return 'syntax', 'high'
    
    # Runtime errors
    elif any(keyword in error_lower for keyword in ['nameerror', 'undefined', 'not defined', 'referenceerror']):
        return 'runtime', 'high'
    
    # Type errors
    elif any(keyword in error_lower for keyword in ['typeerror', 'type error', 'wrong type']):
        return 'type', 'medium'
    
    # Logic errors
    elif any(keyword in error_lower for keyword in ['logic', 'infinite loop', 'wrong result']):
        return 'logic', 'medium'
    
    # Security issues
    elif any(keyword in error_lower for keyword in ['security', 'injection', 'xss', 'csrf']):
        return 'security', 'critical'
    
    # Performance issues
    elif any(keyword in error_lower for keyword in ['performance', 'slow', 'memory leak', 'timeout']):
        return 'performance', 'low'
    
    return 'general', 'medium'

async def analyze_code_with_ai(code: str, language: str, analysis_type: str) -> Dict[str, Any]:
    """Use Claude Sonnet 4 to analyze code for errors and issues"""
    
    try:
        # Create chat instance
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"code_analysis_{uuid.uuid4()}",
            system_message=f"""You are an expert code reviewer and debugger specializing in {language}. 
            Analyze the provided code for errors, bugs, security issues, and performance problems.
            
            Provide your analysis in the following JSON format:
            {{
                "errors": [
                    {{
                        "line_number": number or null,
                        "error_type": "syntax|runtime|type|logic|security|performance|general",
                        "severity": "low|medium|high|critical",
                        "message": "Clear error description",
                        "suggested_fix": "Specific fix recommendation",
                        "explanation": "Detailed explanation of the issue and why the fix works"
                    }}
                ],
                "overall_score": number_0_to_100,
                "suggestions": ["General improvement suggestions"],
                "summary": "Brief analysis summary"
            }}
            
            Focus on practical, actionable feedback. If no errors are found, return an empty errors array but still provide suggestions for improvement."""
        ).with_model("anthropic", "claude-3-7-sonnet-20250219")
        
        # Create analysis prompt
        prompt = f"""Analyze this {language} code for errors and issues:

```{language}
{code}
```

Analysis type: {analysis_type}

Please provide a thorough analysis focusing on:
1. Syntax errors and typos
2. Runtime errors and exceptions
3. Logic errors and incorrect implementations
4. Security vulnerabilities
5. Performance issues
6. Code quality and best practices

Return your analysis in the specified JSON format."""

        # Send message to AI
        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            # Extract JSON from response
            response_text = str(response)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                json_str = response_text[json_start:json_end]
                return json.loads(json_str)
            else:
                raise ValueError("No JSON found in response")
        except (json.JSONDecodeError, ValueError) as e:
            # Fallback to structured response
            return {
                "errors": [{
                    "line_number": None,
                    "error_type": "general",
                    "severity": "medium", 
                    "message": "AI analysis completed but JSON parsing failed",
                    "suggested_fix": "Please review the code manually",
                    "explanation": f"AI Response: {response}"
                }],
                "overall_score": 75,
                "suggestions": ["AI analysis completed - please review manually"],
                "summary": "Analysis completed with parsing issues"
            }
            
    except Exception as e:
        logging.error(f"AI analysis failed: {str(e)}")
        return {
            "errors": [{
                "line_number": None,
                "error_type": "general",
                "severity": "low",
                "message": f"AI analysis failed: {str(e)}",
                "suggested_fix": "Please try again or check your code manually",
                "explanation": "The AI service encountered an error during analysis"
            }],
            "overall_score": 50,
            "suggestions": ["AI service temporarily unavailable"],
            "summary": "Analysis failed due to service error"
        }

def perform_static_analysis(code: str, language: str) -> List[Dict]:
    """Perform basic static analysis for common issues"""
    issues = []
    lines = code.split('\n')
    
    if language == 'python':
        try:
            # Try to parse Python AST
            tree = ast.parse(code)
            # Basic checks could be added here
        except SyntaxError as e:
            issues.append({
                "line_number": e.lineno,
                "error_type": "syntax",
                "severity": "high",
                "message": f"Syntax Error: {e.msg}",
                "suggested_fix": "Fix the syntax error on this line",
                "explanation": f"Python syntax error: {e.msg}"
            })
    
    elif language == 'javascript':
        # Basic JavaScript checks
        for i, line in enumerate(lines, 1):
            if '==' in line and '===' not in line:
                issues.append({
                    "line_number": i,
                    "error_type": "logic",
                    "severity": "medium",
                    "message": "Use strict equality (===) instead of loose equality (==)",
                    "suggested_fix": "Replace == with ===",
                    "explanation": "Strict equality prevents type coercion issues"
                })
    
    # Common checks for all languages
    for i, line in enumerate(lines, 1):
        stripped = line.strip()
        if not stripped:
            continue
            
        # Check for TODO/FIXME comments
        if any(keyword in stripped.upper() for keyword in ['TODO', 'FIXME', 'HACK', 'BUG']):
            issues.append({
                "line_number": i,
                "error_type": "general",
                "severity": "low",
                "message": f"Unresolved comment: {stripped}",
                "suggested_fix": "Address the TODO/FIXME comment",
                "explanation": "Unresolved development comments should be addressed"
            })
    
    return issues

# API Routes
@api_router.get("/")
async def root():
    return {"message": "AI Code Debugger API", "version": "1.0.0"}

@api_router.post("/analyze/code", response_model=AnalysisResult)
async def analyze_code(request: CodeAnalysisRequest):
    """Analyze code from direct input"""
    try:
        # Perform AI analysis
        ai_analysis = await analyze_code_with_ai(request.code, request.language, request.analysis_type)
        
        # Perform static analysis
        static_issues = perform_static_analysis(request.code, request.language)
        
        # Combine results
        all_errors = []
        
        # Add AI-detected errors
        for error in ai_analysis.get('errors', []):
            category, severity = categorize_error(error.get('message', ''), request.language)
            error_report = ErrorReport(
                source_type="paste",
                language=request.language,
                error_category=error.get('error_type', category),
                severity=error.get('severity', severity),
                error_message=error.get('message', ''),
                line_number=error.get('line_number'),
                suggested_fix=error.get('suggested_fix', ''),
                explanation=error.get('explanation', '')
            )
            all_errors.append(error_report)
        
        # Add static analysis errors
        for issue in static_issues:
            error_report = ErrorReport(
                source_type="paste",
                language=request.language,
                error_category=issue['error_type'],
                severity=issue['severity'],
                error_message=issue['message'],
                line_number=issue.get('line_number'),
                suggested_fix=issue['suggested_fix'],
                explanation=issue['explanation']
            )
            all_errors.append(error_report)
        
        # Create analysis result
        result = AnalysisResult(
            source_type="paste",
            language=request.language,
            total_errors=len(all_errors),
            errors=all_errors,
            overall_score=ai_analysis.get('overall_score', 85),
            suggestions=ai_analysis.get('suggestions', [])
        )
        
        # Store in database
        result_dict = result.dict()
        result_dict['timestamp'] = result_dict['timestamp'].isoformat()
        for error in result_dict['errors']:
            error['timestamp'] = error['timestamp'].isoformat()
        
        await db.analysis_results.insert_one(result_dict)
        
        return result
        
    except Exception as e:
        logging.error(f"Code analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@api_router.post("/analyze/file")
async def analyze_file(file: UploadFile = File(...), analysis_type: str = Form("full")):
    """Analyze uploaded code file"""
    try:
        # Read file content
        content = await file.read()
        code = content.decode('utf-8')
        
        # Detect language
        language = detect_language(file.filename, code)
        
        # Create analysis request
        request = CodeAnalysisRequest(
            code=code,
            language=language,
            analysis_type=analysis_type
        )
        
        # Perform analysis (reuse the existing logic)
        ai_analysis = await analyze_code_with_ai(code, language, analysis_type)
        static_issues = perform_static_analysis(code, language)
        
        # Combine results
        all_errors = []
        
        for error in ai_analysis.get('errors', []):
            category, severity = categorize_error(error.get('message', ''), language)
            error_report = ErrorReport(
                source_type="file",
                language=language,
                error_category=error.get('error_type', category),
                severity=error.get('severity', severity),
                error_message=error.get('message', ''),
                line_number=error.get('line_number'),
                suggested_fix=error.get('suggested_fix', ''),
                explanation=error.get('explanation', '')
            )
            all_errors.append(error_report)
        
        for issue in static_issues:
            error_report = ErrorReport(
                source_type="file",
                language=language,
                error_category=issue['error_type'],
                severity=issue['severity'],
                error_message=issue['message'],
                line_number=issue.get('line_number'),
                suggested_fix=issue['suggested_fix'],
                explanation=issue['explanation']
            )
            all_errors.append(error_report)
        
        result = AnalysisResult(
            source_type="file",
            language=language,
            total_errors=len(all_errors),
            errors=all_errors,
            overall_score=ai_analysis.get('overall_score', 85),
            suggestions=ai_analysis.get('suggestions', [])
        )
        
        # Store in database
        result_dict = result.dict()
        result_dict['timestamp'] = result_dict['timestamp'].isoformat()
        for error in result_dict['errors']:
            error['timestamp'] = error['timestamp'].isoformat()
        
        await db.analysis_results.insert_one(result_dict)
        
        return result
        
    except Exception as e:
        logging.error(f"File analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"File analysis failed: {str(e)}")

@api_router.post("/analyze/url")
async def analyze_url(request: URLAnalysisRequest):
    """Analyze website URL for frontend errors"""
    try:
        import aiohttp
        
        async with aiohttp.ClientSession() as session:
            async with session.get(request.url) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Failed to fetch URL: {response.status}")
                
                html_content = await response.text()
        
        # Basic HTML/JavaScript extraction and analysis
        # This is a simplified version - in production, you'd want more sophisticated parsing
        
        # Extract JavaScript from script tags
        js_pattern = r'<script[^>]*>(.*?)</script>'
        js_matches = re.findall(js_pattern, html_content, re.DOTALL | re.IGNORECASE)
        
        all_errors = []
        combined_js = '\n'.join(js_matches)
        
        if combined_js.strip():
            # Analyze extracted JavaScript
            ai_analysis = await analyze_code_with_ai(combined_js, 'javascript', request.analysis_type)
            
            for error in ai_analysis.get('errors', []):
                category, severity = categorize_error(error.get('message', ''), 'javascript')
                error_report = ErrorReport(
                    source_type="url",
                    language="javascript",
                    error_category=error.get('error_type', category),
                    severity=error.get('severity', severity),
                    error_message=error.get('message', ''),
                    line_number=error.get('line_number'),
                    suggested_fix=error.get('suggested_fix', ''),
                    explanation=error.get('explanation', '')
                )
                all_errors.append(error_report)
        
        # Basic HTML validation
        html_issues = []
        if not re.search(r'<!DOCTYPE\s+html>', html_content, re.IGNORECASE):
            html_issues.append("Missing DOCTYPE declaration")
        
        if not re.search(r'<html[^>]*>', html_content, re.IGNORECASE):
            html_issues.append("Missing HTML tag")
        
        for issue in html_issues:
            error_report = ErrorReport(
                source_type="url",
                language="html",
                error_category="validation",
                severity="medium",
                error_message=issue,
                suggested_fix=f"Add proper {issue.split()[1].lower()} to your HTML",
                explanation=f"HTML validation issue: {issue}"
            )
            all_errors.append(error_report)
        
        result = AnalysisResult(
            source_type="url",
            language="html/javascript",
            total_errors=len(all_errors),
            errors=all_errors,
            overall_score=max(100 - len(all_errors) * 10, 0),
            suggestions=["Consider using a proper HTML validator", "Test JavaScript in browser console"]
        )
        
        # Store in database
        result_dict = result.dict()
        result_dict['timestamp'] = result_dict['timestamp'].isoformat()
        for error in result_dict['errors']:
            error['timestamp'] = error['timestamp'].isoformat()
        
        await db.analysis_results.insert_one(result_dict)
        
        return result
        
    except Exception as e:
        logging.error(f"URL analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"URL analysis failed: {str(e)}")

@api_router.get("/analysis/{analysis_id}/debug-wizard", response_model=DebuggingWizard)
async def create_debug_wizard(analysis_id: str, error_id: str):
    """Create step-by-step debugging wizard for a specific error"""
    try:
        # Get analysis result from database
        analysis = await db.analysis_results.find_one({"id": analysis_id})
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Find specific error
        target_error = None
        for error in analysis['errors']:
            if error['id'] == error_id:
                target_error = error
                break
        
        if not target_error:
            raise HTTPException(status_code=404, detail="Error not found")
        
        # Generate debugging steps using AI
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"debug_wizard_{uuid.uuid4()}",
            system_message="You are an expert programming tutor. Create step-by-step debugging instructions."
        ).with_model("anthropic", "claude-3-7-sonnet-20250219")
        
        prompt = f"""Create a step-by-step debugging guide for this {target_error['language']} error:

Error: {target_error['error_message']}
Suggested Fix: {target_error['suggested_fix']}
Explanation: {target_error['explanation']}

Please provide debugging steps in this JSON format:
{{
    "steps": [
        {{
            "step_number": 1,
            "title": "Step Title",
            "description": "Detailed description",
            "code_example": "optional code example",
            "expected_outcome": "what should happen"
        }}
    ],
    "estimated_time": "5-10 minutes",
    "difficulty_level": "beginner|intermediate|advanced"
}}

Make the steps practical and easy to follow."""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse AI response
        try:
            response_text = str(response)
            json_start = response_text.find('{')
            json_end = response_text.rfind('}') + 1
            if json_start != -1 and json_end != -1:
                json_str = response_text[json_start:json_end]
                steps_data = json.loads(json_str)
                
                steps = [DebuggingStep(**step) for step in steps_data['steps']]
                
                wizard = DebuggingWizard(
                    analysis_id=analysis_id,
                    error_id=error_id,
                    steps=steps,
                    estimated_time=steps_data.get('estimated_time', '10-15 minutes'),
                    difficulty_level=steps_data.get('difficulty_level', 'intermediate')
                )
                
                # Store wizard in database
                wizard_dict = wizard.dict()
                await db.debug_wizards.insert_one(wizard_dict)
                
                return wizard
        except:
            # Fallback wizard
            default_steps = [
                DebuggingStep(
                    step_number=1,
                    title="Identify the Error",
                    description=f"Review the error: {target_error['error_message']}",
                    expected_outcome="Understand what went wrong"
                ),
                DebuggingStep(
                    step_number=2,
                    title="Apply the Fix",
                    description=target_error['suggested_fix'],
                    expected_outcome="Error should be resolved"
                ),
                DebuggingStep(
                    step_number=3,
                    title="Test the Solution",
                    description="Run your code to verify the fix works",
                    expected_outcome="Code runs without errors"
                )
            ]
            
            wizard = DebuggingWizard(
                analysis_id=analysis_id,
                error_id=error_id,
                steps=default_steps,
                estimated_time="10-15 minutes",
                difficulty_level="intermediate"
            )
            
            wizard_dict = wizard.dict()
            await db.debug_wizards.insert_one(wizard_dict)
            
            return wizard
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Debug wizard creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create debug wizard: {str(e)}")

@api_router.get("/analysis", response_model=List[AnalysisResult])
async def get_analysis_history():
    """Get analysis history"""
    try:
        analyses = await db.analysis_results.find().sort("timestamp", -1).limit(50).to_list(50)
        return [AnalysisResult(**analysis) for analysis in analyses]
    except Exception as e:
        logging.error(f"Failed to get analysis history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get analysis history")

@api_router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        total_analyses = await db.analysis_results.count_documents({})
        total_errors = await db.analysis_results.aggregate([
            {"$unwind": "$errors"},
            {"$count": "total"}
        ]).to_list(1)
        
        error_categories = await db.analysis_results.aggregate([
            {"$unwind": "$errors"},
            {"$group": {"_id": "$errors.error_category", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}}
        ]).to_list(10)
        
        severity_distribution = await db.analysis_results.aggregate([
            {"$unwind": "$errors"},
            {"$group": {"_id": "$errors.severity", "count": {"$sum": 1}}}
        ]).to_list(10)
        
        return {
            "total_analyses": total_analyses,
            "total_errors": total_errors[0]["total"] if total_errors else 0,
            "error_categories": error_categories,
            "severity_distribution": severity_distribution,
            "languages_analyzed": await db.analysis_results.distinct("language")
        }
    except Exception as e:
        logging.error(f"Failed to get stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get dashboard stats")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()