import os
import uuid
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from pathlib import Path
import hashlib
import base64
import json

class DigitalProductDelivery:
    """Handles secure digital product delivery and download management"""
    
    def __init__(self):
        self.base_url = os.environ.get('REACT_APP_BACKEND_URL', 'https://digital-launch-pro.preview.emergentagent.com')
        self.download_directory = Path("/app/backend/downloads")
        self.download_directory.mkdir(exist_ok=True)
        
        # In production, these would be stored in a secure database
        self.active_downloads = {}  # order_id -> download_info
        
    def generate_secure_download_token(self, order_id: str, product_id: str, user_id: str) -> str:
        """Generate a secure, time-limited download token"""
        expiry_time = datetime.utcnow() + timedelta(days=7)  # 7-day download window
        
        token_data = {
            'order_id': order_id,
            'product_id': product_id,
            'user_id': user_id,
            'expires': expiry_time.isoformat(),
            'download_count': 0,
            'max_downloads': 5  # Allow 5 downloads
        }
        
        # Create a secure token
        token_string = json.dumps(token_data, sort_keys=True)
        token_hash = hashlib.sha256(token_string.encode()).hexdigest()
        secure_token = base64.urlsafe_b64encode(f"{token_hash}:{token_string}".encode()).decode()
        
        # Store in active downloads (in production, store in database)
        self.active_downloads[secure_token] = token_data
        
        return secure_token
    
    def validate_download_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate download token and check expiry/download limits"""
        try:
            if token not in self.active_downloads:
                return None
                
            token_data = self.active_downloads[token]
            
            # Check expiry
            expiry_time = datetime.fromisoformat(token_data['expires'])
            if datetime.utcnow() > expiry_time:
                del self.active_downloads[token]
                return None
            
            # Check download limit
            if token_data['download_count'] >= token_data['max_downloads']:
                return None
                
            return token_data
            
        except Exception as e:
            print(f"Token validation error: {e}")
            return None
    
    def increment_download_count(self, token: str):
        """Increment download count for a token"""
        if token in self.active_downloads:
            self.active_downloads[token]['download_count'] += 1
    
    def get_download_url(self, order_id: str, product_id: str, user_id: str) -> str:
        """Generate secure download URL for a digital product"""
        token = self.generate_secure_download_token(order_id, product_id, user_id)
        return f"{self.base_url}/api/download/{token}"
    
    async def create_sample_digital_products(self):
        """Create sample digital products for demonstration"""
        sample_products = {
            # Digital Life Planners
            "digital_life_planners": {
                "filename": "Digital_Life_Planners_Complete_Package.zip",
                "content": self._create_planner_content(),
                "description": "Complete digital life planner package with templates"
            },
            
            # Lead Magnet Templates  
            "lead_magnet_templates": {
                "filename": "Lead_Magnet_Templates_Pack.zip",
                "content": self._create_lead_magnet_content(),
                "description": "High-converting lead magnet templates collection"
            },
            
            # AI Prompt Packs
            "ai_prompt_packs": {
                "filename": "AI_Prompt_Packs_Professional.zip", 
                "content": self._create_prompt_pack_content(),
                "description": "Professional AI prompt collections for content creation"
            },
            
            # Business E-Books
            "business_ebooks": {
                "filename": "Business_Success_Ebooks_Bundle.zip",
                "content": self._create_ebook_content(),
                "description": "Essential business and productivity ebook collection"
            }
        }
        
        for product_key, product_info in sample_products.items():
            file_path = self.download_directory / product_info["filename"]
            
            if not file_path.exists():
                # Create sample files
                with open(file_path, 'w') as f:
                    f.write(product_info["content"])
                    
                print(f"Created sample product: {product_info['filename']}")
    
    def _create_planner_content(self) -> str:
        return """
=== DIGITAL LIFE PLANNERS - COMPLETE PACKAGE ===

This package includes:

1. DAILY PLANNER TEMPLATES
   - Morning routine tracker
   - Daily goal setting sheets  
   - Time blocking templates
   - Evening reflection pages

2. WEEKLY PLANNING SHEETS
   - Week-at-a-glance layout
   - Priority setting framework
   - Habit tracking grids
   - Weekly review templates

3. MONTHLY ORGANIZERS
   - Goal setting worksheets
   - Project planning templates
   - Budget tracking sheets
   - Monthly reflection guides

4. ANNUAL PLANNING TOOLS
   - Yearly vision board template
   - 90-day goal sprints
   - Life wheel assessment
   - Year-end review framework

5. BONUS PRODUCTIVITY TOOLS
   - Focus time tracker
   - Energy level monitor
   - Distraction log
   - Success metrics dashboard

HOW TO USE:
1. Print on standard 8.5x11 paper
2. Use in digital apps like GoodNotes or Notability
3. Customize colors and layouts as needed
4. Start with daily templates, then expand

COMMERCIAL LICENSE INCLUDED:
- Use for personal projects
- Share with clients (with attribution)
- Modify and adapt as needed

© Digital Store-6527 - Premium Digital Products
Contact: support@digitalstore6527.com

Thank you for your purchase! 
Leave a review to help other entrepreneurs find these tools.
"""

    def _create_lead_magnet_content(self) -> str:
        return """
=== LEAD MAGNET TEMPLATES - HIGH-CONVERTING PACK ===

This collection includes:

1. EBOOK TEMPLATES (5 designs)
   - "Ultimate Guide" framework
   - "Checklist + Tips" format
   - "Case Study" template
   - "Step-by-Step Tutorial" layout
   - "Resource Collection" design

2. CHECKLIST TEMPLATES (8 varieties)
   - Daily productivity checklist
   - Social media audit checklist  
   - Website launch checklist
   - Email marketing checklist
   - Content creation checklist
   - Sales funnel checklist
   - SEO optimization checklist
   - Goal achievement checklist  

3. WORKSHEET TEMPLATES (6 types)
   - Goal planning worksheet
   - Brand strategy worksheet
   - Content calendar worksheet
   - Budget planning worksheet
   - Skill assessment worksheet
   - Market research worksheet

4. QUIZ/ASSESSMENT TEMPLATES (4 formats)
   - Personality assessment quiz
   - Business readiness quiz
   - Skills evaluation quiz
   - Goal alignment quiz

5. BONUS: EMAIL SEQUENCES
   - Welcome sequence (5 emails)
   - Nurture sequence (7 emails)
   - Sales sequence (4 emails)
   - Re-engagement sequence (3 emails)

FEATURES:
- Canva-ready templates
- Multiple color schemes
- Mobile-responsive designs
- A/B testing variations

USAGE RIGHTS:
✓ Use for your business
✓ Customize and rebrand  
✓ Sell to clients
✗ Resell as templates

© Digital Store-6527 - Lead Generation Experts
Support: leads@digitalstore6527.com

BONUS TIP: Test different headlines to increase conversion rates by 40%+
"""

    def _create_prompt_pack_content(self) -> str:
        return """
=== AI PROMPT PACKS - PROFESSIONAL COLLECTION ===

This comprehensive pack includes:

1. CONTENT CREATION PROMPTS (50+ prompts)
   - Blog post outlines
   - Social media captions
   - Email subject lines
   - Video script starters
   - Podcast episode ideas
   - Newsletter content
   - Ad copy variations
   - Landing page copy

2. BUSINESS STRATEGY PROMPTS (40+ prompts)
   - Market research queries
   - Competitor analysis
   - SWOT analysis frameworks
   - Business plan sections
   - Product development ideas
   - Pricing strategy analysis
   - Customer persona creation
   - Growth hacking strategies

3. CREATIVE WRITING PROMPTS (60+ prompts)
   - Story beginnings
   - Character development
   - Plot twist ideas
   - Dialogue starters
   - Setting descriptions
   - Conflict scenarios
   - Theme exploration
   - Genre-specific prompts

4. PRODUCTIVITY & PLANNING PROMPTS (30+ prompts)
   - Goal setting frameworks
   - Time management strategies
   - Priority matrix creation
   - Habit formation plans
   - Decision making tools
   - Problem solving methods
   - Brainstorming techniques
   - Focus improvement tactics

5. LEARNING & DEVELOPMENT PROMPTS (35+ prompts)
   - Skill assessment questions
   - Learning path creation
   - Study plan development
   - Knowledge gap analysis
   - Practice exercise generation
   - Quiz question creation
   - Summary writing
   - Concept explanation

BONUS SECTIONS:
- Industry-specific prompts (10 industries)
- Advanced prompt engineering techniques
- Prompt optimization strategies
- AI model comparison guide

HOW TO USE:
1. Copy prompts to your AI tool (ChatGPT, Claude, etc.)
2. Customize with your specific details
3. Combine prompts for complex tasks
4. Save your best variations

WORKS WITH:
- ChatGPT (all versions)
- Claude (Anthropic)
- Gemini (Google)
- Other major AI models

© Digital Store-6527 - AI Productivity Specialists
Support: ai@digitalstore6527.com

PRO TIP: Combine 2-3 prompts for more sophisticated outputs!
"""

    def _create_ebook_content(self) -> str:
        return """
=== BUSINESS SUCCESS EBOOKS BUNDLE ===

This exclusive bundle contains:

📚 EBOOK #1: "The Digital Entrepreneur's Playbook" (47 pages)
- Building your online presence
- Monetizing digital products
- Scaling your business efficiently  
- Case studies of successful entrepreneurs

📚 EBOOK #2: "Productivity Mastery for Busy Professionals" (35 pages)
- Time management frameworks
- Focus techniques that work
- Energy optimization strategies
- Tools and apps recommendations

📚 EBOOK #3: "The Content Creator's Guide to Passive Income" (52 pages)
- Multiple income stream strategies
- Content that converts
- Automation tools and techniques
- Building your audience systematically

📚 EBOOK #4: "From Side Hustle to Full-Time Income" (41 pages)
- Transition planning strategies
- Risk management approaches
- Financial planning for entrepreneurs
- Success stories and lessons learned

📚 EBOOK #5: "Digital Marketing on a Bootstrap Budget" (38 pages)
- Free marketing strategies
- Low-cost advertising techniques
- Social media growth hacks
- Email marketing mastery

BONUS MATERIALS:
- Action plan templates
- Goal tracking worksheets
- Resource lists and links
- Implementation checklists
- Progress tracking tools

WHAT MAKES THESE SPECIAL:
✓ Written by successful entrepreneurs
✓ Practical, actionable advice
✓ Real-world case studies
✓ Step-by-step implementations
✓ Updated for 2025 trends

FORMATS INCLUDED:
- PDF (print-friendly)
- EPUB (e-readers)
- Audio summaries (MP3)
- Quick reference guides

COMMERCIAL LICENSE:
- Read and implement personally
- Share key insights with your team
- Use concepts in your business
- Quote with proper attribution

© Digital Store-6527 - Business Education Experts
Support: books@digitalstore6527.com

START HERE: Begin with "The Digital Entrepreneur's Playbook" for foundational knowledge!

Each ebook includes:
- Table of contents
- Chapter summaries  
- Action items
- Additional resources
- Contact information for questions

Total value: $197 individually
Your price: $14.99 (92% savings!)
"""

    async def get_product_file_path(self, product_name: str) -> Optional[Path]:
        """Get file path for a product based on its name"""
        
        # Create sample products if they don't exist
        await self.create_sample_digital_products()
        
        product_file_mapping = {
            "Digital Life Planners": "Digital_Life_Planners_Complete_Package.zip",
            "Lead Magnet Templates": "Lead_Magnet_Templates_Pack.zip", 
            "AI Prompt Packs": "AI_Prompt_Packs_Professional.zip",
            "Business E-Books": "Business_Success_Ebooks_Bundle.zip"
        }
        
        filename = product_file_mapping.get(product_name)
        if filename:
            file_path = self.download_directory / filename
            if file_path.exists():
                return file_path
        
        return None
    
    async def process_order_delivery(self, order_data: Dict[str, Any]) -> Dict[str, Any]:
        """Process digital product delivery for an order"""
        
        try:
            # Generate secure download URL
            download_url = self.get_download_url(
                order_id=order_data['order_id'],
                product_id=order_data['product_id'], 
                user_id=order_data['user_id']
            )
            
            # Get product file path
            product_file = await self.get_product_file_path(order_data['product_name'])
            
            delivery_info = {
                'order_id': order_data['order_id'],
                'download_url': download_url,
                'expires_in_days': 7,
                'max_downloads': 5,
                'file_available': product_file is not None,
                'delivery_status': 'ready' if product_file else 'preparing'
            }
            
            return delivery_info
            
        except Exception as e:
            print(f"Order delivery processing error: {e}")
            return {
                'order_id': order_data.get('order_id', 'unknown'),
                'delivery_status': 'error',
                'error_message': str(e)
            }

# Global delivery service instance  
delivery_service = DigitalProductDelivery()