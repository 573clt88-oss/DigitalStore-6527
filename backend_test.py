import requests
import sys
import json
import time
from datetime import datetime

class AIBugHunterTester:
    def __init__(self, base_url="https://bug-hunter-56.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.analysis_id = None
        self.error_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        headers = {'Content-Type': 'application/json'} if not files else {}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, data=data, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if 'id' in response_data:
                        print(f"   Response ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout (30s)")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_analyze_code_paste(self):
        """Test code analysis via paste"""
        # Test with JavaScript code containing errors
        buggy_js_code = """
function calculateSum(a, b) {
    if (a == null || b == null) {  // Should use strict equality
        return 0;
    }
    
    let result = a + b
    // Missing semicolon above
    
    // Undefined variable
    console.log(undefinedVar);
    
    return result;
}

// TODO: Fix this function
function divide(x, y) {
    return x / y;  // No zero division check
}
"""
        
        success, response = self.run_test(
            "Code Analysis - Paste JavaScript",
            "POST",
            "analyze/code",
            200,
            data={
                "code": buggy_js_code,
                "language": "javascript",
                "analysis_type": "full"
            }
        )
        
        if success and response:
            self.analysis_id = response.get('id')
            if response.get('errors'):
                self.error_id = response['errors'][0].get('id')
                print(f"   Found {len(response['errors'])} errors")
                print(f"   Overall score: {response.get('overall_score', 'N/A')}%")
            else:
                print("   No errors found")
        
        return success

    def test_analyze_code_python(self):
        """Test code analysis with Python code"""
        buggy_python_code = """
def calculate_average(numbers):
    if numbers == []:  # Should use 'not numbers'
        return 0
    
    total = 0
    for num in numbers:
        total += num
    
    # Division by zero possible
    average = total / len(numbers)
    
    # Undefined variable
    print(undefined_variable)
    
    return average

# TODO: Add input validation
def process_data(data)
    # Missing colon above - syntax error
    return data.upper()
"""
        
        success, response = self.run_test(
            "Code Analysis - Python with Syntax Errors",
            "POST",
            "analyze/code",
            200,
            data={
                "code": buggy_python_code,
                "language": "python",
                "analysis_type": "full"
            }
        )
        
        if success and response:
            print(f"   Found {len(response.get('errors', []))} errors")
            print(f"   Overall score: {response.get('overall_score', 'N/A')}%")
        
        return success

    def test_analyze_file_upload(self):
        """Test file upload analysis"""
        # Create a temporary file with buggy code
        test_code = """
function buggyFunction() {
    var x = 10;
    var y = 0;
    
    // Division by zero
    var result = x / y;
    
    // Unused variable
    var unused = "test";
    
    // Missing return statement
}
"""
        
        # Create file-like object
        files = {
            'file': ('test.js', test_code, 'text/javascript')
        }
        data = {
            'analysis_type': 'full'
        }
        
        success, response = self.run_test(
            "File Upload Analysis",
            "POST",
            "analyze/file",
            200,
            data=data,
            files=files
        )
        
        if success and response:
            print(f"   Found {len(response.get('errors', []))} errors")
            print(f"   Language detected: {response.get('language', 'N/A')}")
        
        return success

    def test_analyze_url(self):
        """Test URL analysis"""
        success, response = self.run_test(
            "URL Analysis",
            "POST",
            "analyze/url",
            200,
            data={
                "url": "https://example.com",
                "analysis_type": "full"
            }
        )
        
        if success and response:
            print(f"   Found {len(response.get('errors', []))} errors")
            print(f"   Language: {response.get('language', 'N/A')}")
        
        return success

    def test_debug_wizard(self):
        """Test debug wizard creation"""
        if not self.analysis_id or not self.error_id:
            print("⚠️  Skipping Debug Wizard test - no analysis_id or error_id available")
            return True
        
        success, response = self.run_test(
            "Debug Wizard Creation",
            "GET",
            f"analysis/{self.analysis_id}/debug-wizard?error_id={self.error_id}",
            200
        )
        
        if success and response:
            print(f"   Steps: {len(response.get('steps', []))}")
            print(f"   Difficulty: {response.get('difficulty_level', 'N/A')}")
            print(f"   Estimated time: {response.get('estimated_time', 'N/A')}")
        
        return success

    def test_analysis_history(self):
        """Test getting analysis history"""
        success, response = self.run_test(
            "Analysis History",
            "GET",
            "analysis",
            200
        )
        
        if success and response:
            if isinstance(response, list):
                print(f"   Found {len(response)} analyses in history")
            else:
                print("   Response is not a list")
        
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, response = self.run_test(
            "Dashboard Statistics",
            "GET",
            "stats",
            200
        )
        
        if success and response:
            print(f"   Total analyses: {response.get('total_analyses', 'N/A')}")
            print(f"   Total errors: {response.get('total_errors', 'N/A')}")
            print(f"   Languages: {len(response.get('languages_analyzed', []))}")
        
        return success

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting AI Bug Hunter Backend Tests")
        print(f"   Base URL: {self.base_url}")
        print(f"   API URL: {self.api_url}")
        print("=" * 60)
        
        # Test basic connectivity
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - stopping tests")
            return False
        
        # Test core analysis features
        self.test_analyze_code_paste()
        time.sleep(2)  # Give AI time to process
        
        self.test_analyze_code_python()
        time.sleep(2)
        
        self.test_analyze_file_upload()
        time.sleep(2)
        
        self.test_analyze_url()
        time.sleep(2)
        
        # Test wizard creation (depends on previous analysis)
        self.test_debug_wizard()
        time.sleep(1)
        
        # Test dashboard features
        self.test_analysis_history()
        self.test_dashboard_stats()
        
        # Print results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = AIBugHunterTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())