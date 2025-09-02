import requests
import sys
import json
from datetime import datetime
import time

class EcommerceAPITester:
    def __init__(self, base_url="https://ecom-support.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.session_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root Endpoint", "GET", "", 200)

    def test_init_products(self):
        """Initialize sample products"""
        return self.run_test("Initialize Products", "POST", "init-products", 200)

    def test_get_products(self):
        """Test getting all products"""
        success, response = self.run_test("Get Products", "GET", "products", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} products")
            if len(response) > 0:
                print(f"   Sample product: {response[0].get('name', 'Unknown')}")
        return success, response

    def test_register(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Test User {timestamp}",
            "email": f"test{timestamp}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test("User Registration", "POST", "register", 200, user_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token received: {self.token[:20]}...")
        return success, response

    def test_login(self):
        """Test user login with existing credentials"""
        # First register a user
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "name": f"Login Test User {timestamp}",
            "email": f"logintest{timestamp}@example.com", 
            "password": "TestPass123!"
        }
        
        # Register first
        reg_success, _ = self.run_test("Register for Login Test", "POST", "register", 200, user_data)
        if not reg_success:
            return False, {}
            
        # Now test login
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test("User Login", "POST", "login", 200, login_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Login token: {self.token[:20]}...")
        return success, response

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.token:
            print("❌ No token available for user info test")
            return False, {}
        return self.run_test("Get Current User", "GET", "me", 200)

    def test_add_to_cart(self, product_id):
        """Test adding item to cart"""
        if not self.token:
            print("❌ No token available for cart test")
            return False, {}
            
        cart_item = {
            "product_id": product_id,
            "quantity": 1
        }
        return self.run_test("Add to Cart", "POST", "cart/add", 200, cart_item)

    def test_get_cart(self):
        """Test getting cart contents"""
        if not self.token:
            print("❌ No token available for cart test")
            return False, {}
        return self.run_test("Get Cart", "GET", "cart", 200)

    def test_contact_form(self):
        """Test contact form submission"""
        contact_data = {
            "name": "Test Contact",
            "email": "contact@test.com",
            "subject": "Test Subject",
            "message": "This is a test message from the API test suite."
        }
        return self.run_test("Contact Form", "POST", "contact", 200, contact_data)

    def test_ai_chat(self):
        """Test AI chat functionality"""
        chat_data = {
            "message": "Hello, I need help with refund policy",
            "session_id": None
        }
        
        success, response = self.run_test("AI Chat", "POST", "chat", 200, chat_data)
        if success and 'session_id' in response:
            self.session_id = response['session_id']
            print(f"   AI Response: {response.get('response', '')[:100]}...")
            print(f"   Session ID: {self.session_id}")
            
            # Test follow-up message with session
            time.sleep(2)  # Wait for AI processing
            followup_data = {
                "message": "How long does a refund take?",
                "session_id": self.session_id
            }
            followup_success, followup_response = self.run_test("AI Chat Follow-up", "POST", "chat", 200, followup_data)
            if followup_success:
                print(f"   Follow-up Response: {followup_response.get('response', '')[:100]}...")
            
        return success, response

    def test_create_order(self):
        """Test order creation"""
        if not self.token:
            print("❌ No token available for order test")
            return False, {}
        return self.run_test("Create Order", "POST", "orders", 200)

    def test_get_orders(self):
        """Test getting user orders"""
        if not self.token:
            print("❌ No token available for orders test")
            return False, {}
        return self.run_test("Get Orders", "GET", "orders", 200)

def main():
    print("🚀 Starting E-commerce API Tests")
    print("=" * 50)
    
    tester = EcommerceAPITester()
    
    # Test basic connectivity
    success, _ = tester.test_root_endpoint()
    if not success:
        print("❌ Cannot connect to API. Stopping tests.")
        return 1

    # Initialize products
    tester.test_init_products()
    
    # Test products endpoint
    success, products = tester.test_get_products()
    product_id = None
    if success and products and len(products) > 0:
        product_id = products[0].get('id')
        print(f"   Using product ID for cart tests: {product_id}")

    # Test authentication flow
    tester.test_register()
    tester.test_login()
    tester.test_get_current_user()

    # Test cart functionality
    if product_id:
        tester.test_add_to_cart(product_id)
        tester.test_get_cart()
        # Test order creation (this will clear the cart)
        tester.test_create_order()
        tester.test_get_orders()

    # Test contact form
    tester.test_contact_form()

    # Test AI chat (most important feature)
    print("\n🤖 Testing AI Chat Functionality...")
    tester.test_ai_chat()

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Final Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        failed = tester.tests_run - tester.tests_passed
        print(f"⚠️  {failed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())