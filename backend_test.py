import requests
import sys
import json
from datetime import datetime
import time

class DigitalStoreAPITester:
    def __init__(self, base_url="https://digital-launch-pro.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_user_id = None
        self.created_product_id = None
        self.created_order_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 500:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list) and len(response_data) > 0:
                        print(f"   Response: Found {len(response_data)} items")
                    return success, response_data
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_basic_endpoints(self):
        """Test basic API endpoints"""
        print("\n" + "="*50)
        print("TESTING BASIC ENDPOINTS")
        print("="*50)
        
        # Test root endpoint
        self.run_test("API Root", "GET", "", 200)
        
        # Test health check
        self.run_test("Health Check", "GET", "health", 200)

    def test_products_api(self):
        """Test products CRUD operations"""
        print("\n" + "="*50)
        print("TESTING PRODUCTS API")
        print("="*50)
        
        # Get all products (should have sample products)
        success, products = self.run_test("Get All Products", "GET", "products", 200)
        if success and products:
            print(f"   Found {len(products)} products")
            if len(products) > 0:
                self.created_product_id = products[0]['id']
                print(f"   Using product ID: {self.created_product_id}")
        
        # Create a new product
        new_product = {
            "name": "Test Digital Product",
            "description": "A test product for API testing",
            "price": 99.99,
            "category": "Testing",
            "image_url": "https://example.com/test.jpg"
        }
        success, product = self.run_test("Create Product", "POST", "products", 200, new_product)
        if success and product:
            self.created_product_id = product['id']
            print(f"   Created product ID: {self.created_product_id}")
        
        # Get specific product
        if self.created_product_id:
            self.run_test("Get Specific Product", "GET", f"products/{self.created_product_id}", 200)
        
        # Get products by category
        self.run_test("Get Products by Category", "GET", "products", 200, params={"category": "Testing"})

    def test_users_api(self):
        """Test user management"""
        print("\n" + "="*50)
        print("TESTING USERS API")
        print("="*50)
        
        # Create a new user
        timestamp = int(time.time())
        new_user = {
            "name": f"Test User {timestamp}",
            "email": f"testuser{timestamp}@example.com"
        }
        success, user = self.run_test("Create User", "POST", "users", 200, new_user)
        if success and user:
            self.created_user_id = user['id']
            print(f"   Created user ID: {self.created_user_id}")
        
        # Get specific user
        if self.created_user_id:
            self.run_test("Get Specific User", "GET", f"users/{self.created_user_id}", 200)

    def test_orders_api(self):
        """Test order management"""
        print("\n" + "="*50)
        print("TESTING ORDERS API")
        print("="*50)
        
        if not self.created_user_id or not self.created_product_id:
            print("❌ Skipping order tests - missing user or product ID")
            return
        
        # Create a new order
        new_order = {
            "user_id": self.created_user_id,
            "product_id": self.created_product_id,
            "amount": 99.99
        }
        success, order = self.run_test("Create Order", "POST", "orders", 200, new_order)
        if success and order:
            self.created_order_id = order['id']
            print(f"   Created order ID: {self.created_order_id}")
        
        # Get specific order
        if self.created_order_id:
            self.run_test("Get Specific Order", "GET", f"orders/{self.created_order_id}", 200)
        
        # Get user orders
        if self.created_user_id:
            self.run_test("Get User Orders", "GET", f"users/{self.created_user_id}/orders", 200)

    def test_email_api(self):
        """Test AI email generation"""
        print("\n" + "="*50)
        print("TESTING EMAIL API (AI Integration)")
        print("="*50)
        
        # Test email content generation
        email_context = {
            "customer_name": "Test Customer",
            "product_name": "Test Product",
            "price": 99.99
        }
        
        print("⏳ Testing AI email generation (may take a few seconds)...")
        success, content = self.run_test(
            "Generate Welcome Email Content", 
            "POST", 
            "emails/generate-content?email_type=welcome", 
            200, 
            email_context
        )
        
        if success:
            print("✅ AI email generation working")
        else:
            print("❌ AI email generation failed")

    def test_marketing_api(self):
        """Test marketing strategy endpoints"""
        print("\n" + "="*50)
        print("TESTING MARKETING STRATEGY API")
        print("="*50)
        
        # Test marketing strategy
        success, strategy = self.run_test("Get Marketing Strategy", "GET", "marketing/strategy", 200)
        if success and strategy:
            print("✅ Marketing strategy endpoint working")
        
        # Test products research
        success, research = self.run_test("Get Products Research", "GET", "marketing/products-research", 200)
        if success and research:
            print("✅ Products research endpoint working")
        
        # Test complete strategy
        success, complete = self.run_test("Get Complete Strategy", "GET", "marketing/complete-strategy", 200)
        if success and complete:
            print("✅ Complete strategy endpoint working")

    def test_contact_api(self):
        """Test contact form"""
        print("\n" + "="*50)
        print("TESTING CONTACT API")
        print("="*50)
        
        contact_data = {
            "name": "Test Contact",
            "email": "test@example.com",
            "subject": "Test Subject",
            "message": "This is a test message"
        }
        
        self.run_test("Submit Contact Form", "POST", "contact", 200, contact_data)

    def test_analytics_api(self):
        """Test analytics endpoints"""
        print("\n" + "="*50)
        print("TESTING ANALYTICS API")
        print("="*50)
        
        success, analytics = self.run_test("Get Analytics Overview", "GET", "analytics/overview", 200)
        if success and analytics:
            print("✅ Analytics endpoint working")
            print(f"   Total Products: {analytics.get('total_products', 'N/A')}")
            print(f"   Total Orders: {analytics.get('total_orders', 'N/A')}")
            print(f"   Total Users: {analytics.get('total_users', 'N/A')}")

def main():
    print("🚀 Starting Digital Store-6527 API Testing")
    print("=" * 60)
    
    tester = DigitalStoreAPITester()
    
    # Run all tests
    tester.test_basic_endpoints()
    tester.test_products_api()
    tester.test_users_api()
    tester.test_orders_api()
    tester.test_email_api()
    tester.test_marketing_api()
    tester.test_contact_api()
    tester.test_analytics_api()
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! API is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Check the output above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(main())