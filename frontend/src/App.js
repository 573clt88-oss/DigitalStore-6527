import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import { Editor } from '@monaco-editor/react';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Progress } from './components/ui/progress';
import { Separator } from './components/ui/separator';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Textarea } from './components/ui/textarea';
import { ScrollArea } from './components/ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { 
  Upload, 
  Code, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Bug, 
  Shield,
  Zap,
  Clock,
  TrendingUp,
  FileText,
  ExternalLink,
  ChevronRight,
  Play,
  Lightbulb,
  Target
} from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 text-white p-4 shadow-xl border-b border-purple-500/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bug className="w-8 h-8 text-purple-400" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Bug Hunter
          </h1>
        </div>
        <div className="flex space-x-6">
          <Link 
            to="/" 
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === '/' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-purple-200 hover:text-white hover:bg-purple-700/50'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Analyzer</span>
          </Link>
          <Link 
            to="/dashboard" 
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === '/dashboard' 
                ? 'bg-purple-600 text-white shadow-lg' 
                : 'text-purple-200 hover:text-white hover:bg-purple-700/50'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const ErrorCard = ({ error, onCreateWizard }) => {
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-blue-600';
      default: return 'bg-gray-600';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <Clock className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Bug className="w-4 h-4" />;
    }
  };

  return (
    <Card className="mb-4 border-l-4 border-l-purple-500 hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={`${getSeverityColor(error.severity)} text-white`}>
              {getSeverityIcon(error.severity)}
              <span className="ml-1 capitalize">{error.severity}</span>
            </Badge>
            <Badge variant="outline" className="capitalize">
              {error.error_category}
            </Badge>
            {error.line_number && (
              <Badge variant="secondary">
                Line {error.line_number}
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg">{error.error_message}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-semibold text-green-700">Suggested Fix:</Label>
            <p className="text-sm mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
              {error.suggested_fix}
            </p>
          </div>
          <div>
            <Label className="text-sm font-semibold text-blue-700">Explanation:</Label>
            <p className="text-sm mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {error.explanation}
            </p>
          </div>
          <div className="flex justify-end">
            <Button 
              onClick={() => onCreateWizard(error.id)} 
              variant="outline" 
              size="sm"
              className="flex items-center space-x-2"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Debug Wizard</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DebuggingWizardDialog = ({ wizard, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!wizard) return null;

  return (
    <Dialog open={!!wizard} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <span>Step-by-Step Debugging Wizard</span>
          </DialogTitle>
          <DialogDescription>
            Estimated time: {wizard.estimated_time} • Difficulty: {wizard.difficulty_level}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-600">
              Step {currentStep + 1} of {wizard.steps.length}
            </span>
            <Progress value={((currentStep + 1) / wizard.steps.length) * 100} className="w-32" />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {wizard.steps[currentStep]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>{wizard.steps[currentStep]?.description}</p>
                
                {wizard.steps[currentStep]?.code_example && (
                  <div>
                    <Label className="text-sm font-semibold">Code Example:</Label>
                    <pre className="mt-2 p-3 bg-gray-100 border rounded-lg text-sm overflow-x-auto">
                      <code>{wizard.steps[currentStep].code_example}</code>
                    </pre>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-semibold text-green-700">Expected Outcome:</Label>
                  <p className="text-sm mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                    {wizard.steps[currentStep]?.expected_outcome}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between mt-6">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button 
              onClick={() => setCurrentStep(Math.min(wizard.steps.length - 1, currentStep + 1))}
              disabled={currentStep === wizard.steps.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CodeAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('paste');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [url, setUrl] = useState('');
  const [analysisType, setAnalysisType] = useState('full');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [wizard, setWizard] = useState(null);

  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: {
      'text/*': ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.java', '.cpp', '.c', '.php', '.rb', '.go', '.rs']
    },
    maxFiles: 1
  });

  const analyzeCode = async () => {
    setAnalyzing(true);
    setResult(null);
    
    try {
      let response;
      
      if (activeTab === 'paste') {
        response = await axios.post(`${API}/analyze/code`, {
          code,
          language,
          analysis_type: analysisType
        });
      } else if (activeTab === 'file' && acceptedFiles.length > 0) {
        const formData = new FormData();
        formData.append('file', acceptedFiles[0]);
        formData.append('analysis_type', analysisType);
        
        response = await axios.post(`${API}/analyze/file`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else if (activeTab === 'url') {
        response = await axios.post(`${API}/analyze/url`, {
          url,
          analysis_type: analysisType
        });
      }
      
      setResult(response.data);
    } catch (error) {
      console.error('Analysis failed:', error);
      setResult({
        errors: [{
          id: 'error-1',
          error_message: 'Analysis failed: ' + (error.response?.data?.detail || error.message),
          severity: 'high',
          error_category: 'system',
          suggested_fix: 'Please try again or check your input',
          explanation: 'The analysis service encountered an error'
        }],
        total_errors: 1,
        overall_score: 0,
        suggestions: ['Please try again with different input']
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const createWizard = async (errorId) => {
    if (!result) return;
    
    try {
      const response = await axios.get(`${API}/analysis/${result.id}/debug-wizard?error_id=${errorId}`);
      setWizard(response.data);
    } catch (error) {
      console.error('Failed to create wizard:', error);
    }
  };

  const canAnalyze = () => {
    if (activeTab === 'paste') return code.trim() !== '';
    if (activeTab === 'file') return acceptedFiles.length > 0;
    if (activeTab === 'url') return url.trim() !== '';
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">AI Code Analyzer</h2>
          <p className="text-gray-600">Upload, paste, or link to your code for intelligent error detection and debugging assistance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="shadow-xl border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-purple-600" />
                <span>Code Input</span>
              </CardTitle>
              <CardDescription>Choose how you want to provide your code for analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="paste" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Paste Code</span>
                  </TabsTrigger>
                  <TabsTrigger value="file" className="flex items-center space-x-2">
                    <Upload className="w-4 h-4" />
                    <span>Upload File</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center space-x-2">
                    <Globe className="w-4 h-4" />
                    <span>Website URL</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="javascript">JavaScript</SelectItem>
                          <SelectItem value="typescript">TypeScript</SelectItem>
                          <SelectItem value="python">Python</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                          <SelectItem value="css">CSS</SelectItem>
                          <SelectItem value="java">Java</SelectItem>
                          <SelectItem value="cpp">C++</SelectItem>
                          <SelectItem value="php">PHP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="analysisType">Analysis Type</Label>
                      <Select value={analysisType} onValueChange={setAnalysisType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Analysis</SelectItem>
                          <SelectItem value="syntax">Syntax Only</SelectItem>
                          <SelectItem value="security">Security Focus</SelectItem>
                          <SelectItem value="performance">Performance Focus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="code">Your Code</Label>
                    <div className="mt-2 border rounded-lg overflow-hidden">
                      <Editor
                        height="300px"
                        language={language}
                        value={code}
                        onChange={setCode}
                        theme="vs-light"
                        options={{
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollbar: { vertical: 'auto', horizontal: 'auto' }
                        }}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="file" className="space-y-4">
                  <div>
                    <Label htmlFor="analysisType">Analysis Type</Label>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select analysis type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Analysis</SelectItem>
                        <SelectItem value="syntax">Syntax Only</SelectItem>
                        <SelectItem value="security">Security Focus</SelectItem>
                        <SelectItem value="performance">Performance Focus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div
                    {...getRootProps()}
                    className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50/50"
                  >
                    <input {...getInputProps()} />
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your code file here, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: .js, .jsx, .ts, .tsx, .py, .html, .css, .java, .cpp, .php, .rb, .go, .rs
                    </p>
                    {acceptedFiles.length > 0 && (
                      <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                        <p className="text-green-800 font-medium">
                          Selected: {acceptedFiles[0].name}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="url" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="analysisType">Analysis Type</Label>
                      <Select value={analysisType} onValueChange={setAnalysisType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select analysis type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full">Full Analysis</SelectItem>
                          <SelectItem value="syntax">Syntax Only</SelectItem>
                          <SelectItem value="security">Security Focus</SelectItem>
                          <SelectItem value="performance">Performance Focus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="url">Website URL</Label>
                      <Input
                        id="url"
                        type="url"
                        placeholder="https://example.com"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button 
                onClick={analyzeCode}
                disabled={!canAnalyze() || analyzing}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition-all duration-200"
              >
                {analyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Play className="w-4 h-4" />
                    <span>Analyze Code</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-xl border-purple-100">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bug className="w-5 h-5 text-purple-600" />
                <span>Analysis Results</span>
              </CardTitle>
              <CardDescription>AI-powered error detection and debugging suggestions</CardDescription>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                      <div className="text-2xl font-bold text-purple-600">{result.total_errors}</div>
                      <div className="text-sm text-gray-600">Issues Found</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                      <div className="text-2xl font-bold text-green-600">{result.overall_score}%</div>
                      <div className="text-sm text-gray-600">Code Quality</div>
                    </div>
                  </div>

                  {result.errors.length > 0 ? (
                    <ScrollArea className="h-96">
                      <div className="space-y-4">
                        {result.errors.map((error, index) => (
                          <ErrorCard 
                            key={index} 
                            error={error} 
                            onCreateWizard={createWizard}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Great! No critical issues found in your code.
                      </AlertDescription>
                    </Alert>
                  )}

                  {result.suggestions.length > 0 && (
                    <div>
                      <Label className="text-sm font-semibold text-blue-700">General Suggestions:</Label>
                      <ul className="mt-2 space-y-1">
                        {result.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm p-2 bg-blue-50 border border-blue-200 rounded flex items-start space-x-2">
                            <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span>{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Bug className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Upload, paste, or provide a URL to analyze your code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <DebuggingWizardDialog 
        wizard={wizard} 
        onClose={() => setWizard(null)} 
      />
    </div>
  );
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsResponse, analysesResponse] = await Promise.all([
        axios.get(`${API}/stats`),
        axios.get(`${API}/analysis`)
      ]);
      
      setStats(statsResponse.data);
      setAnalyses(analysesResponse.data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Navigation />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h2>
          <p className="text-gray-600">Track your code analysis history and identify patterns</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">Total Analyses</p>
                    <p className="text-3xl font-bold">{stats.total_analyses}</p>
                  </div>
                  <FileText className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100">Total Errors</p>
                    <p className="text-3xl font-bold">{stats.total_errors}</p>
                  </div>
                  <Bug className="w-12 h-12 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Languages</p>
                    <p className="text-3xl font-bold">{stats.languages_analyzed.length}</p>
                  </div>
                  <Code className="w-12 h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Avg. Score</p>
                    <p className="text-3xl font-bold">
                      {analyses.length > 0 
                        ? Math.round(analyses.reduce((sum, a) => sum + a.overall_score, 0) / analyses.length)
                        : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Error Categories</CardTitle>
              <CardDescription>Distribution of error types found</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.error_categories.length > 0 ? (
                <div className="space-y-4">
                  {stats.error_categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{category._id}</span>
                      <Badge variant="secondary">{category.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Severity Distribution</CardTitle>
              <CardDescription>Breakdown by error severity levels</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.severity_distribution.length > 0 ? (
                <div className="space-y-4">
                  {stats.severity_distribution.map((severity, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="capitalize font-medium">{severity._id}</span>
                      <Badge 
                        className={
                          severity._id === 'critical' ? 'bg-red-600' :
                          severity._id === 'high' ? 'bg-orange-600' :
                          severity._id === 'medium' ? 'bg-yellow-600' :
                          'bg-blue-600'
                        }
                      >
                        {severity.count}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No data available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recent Analyses</CardTitle>
            <CardDescription>Your latest code analysis results</CardDescription>
          </CardHeader>
          <CardContent>
            {analyses.length > 0 ? (
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {analyses.map((analysis, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${
                          analysis.total_errors === 0 ? 'bg-green-500' :
                          analysis.total_errors <= 2 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium capitalize">{analysis.language}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(analysis.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge variant="outline">{analysis.total_errors} errors</Badge>
                        <Badge className="bg-green-600">{analysis.overall_score}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-gray-500 text-center py-8">No analyses yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<CodeAnalyzer />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;