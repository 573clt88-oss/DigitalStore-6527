# API Endpoints Reference - Complete Technical Documentation


# 🔗 API ENDPOINTS REFERENCE

## 🎯 BASE CONFIGURATION

### BASE URL
```
https://digital-launch-pro.preview.emergentagent.com/api
```

### AUTHENTICATION
Currently open for your use. In production, implement API key authentication.

### RESPONSE FORMATS
All responses return JSON with consistent structure:

**Success Response**:
```json
{
  "status": "success",
  "data": { /* response data */ },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Error Response**:
```json
{
  "status": "error",
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## 📊 ANALYTICS ENDPOINTS

### GET /analytics/overview
**Description**: Get comprehensive business analytics
**Method**: GET
**Parameters**: None

**Response Example**:
```json
{
  "total_products": 6,
  "total_orders": 2,
  "total_users": 2,
  "completed_orders": 1,
  "pending_orders": 1,
  "total_revenue": 29.99,
  "total_contacts": 5,
  "ai_features_active": true
}
```

### GET /automation/performance-analytics
**Description**: Real-time performance monitoring and alerts
**Method**: GET
**Parameters**: None

**Response Example**:
```json
{
  "metrics": {
    "daily_revenue": 250,
    "conversion_rate": 3.2,
    "average_order_value": 32.50,
    "email_open_rate": 28.5,
    "website_traffic": 1250
  },
  "alerts": {
    "revenue_drop": false,
    "high_bounce_rate": false,
    "low_conversion": false
  }
}
```

## 🛍️ PRODUCT MANAGEMENT ENDPOINTS

### GET /products
**Description**: Get all active products
**Method**: GET
**Parameters**: 
- `category` (optional): Filter by product category

**Example Request**:
```bash
curl "https://digital-launch-pro.preview.emergentagent.com/api/products"
curl "https://digital-launch-pro.preview.emergentagent.com/api/products?category=Productivity"
```

**Response Example**:
```json
[
  {
    "id": "product-123",
    "name": "Digital Life Planners",
    "description": "Comprehensive productivity planners",
    "price": 29.99,
    "category": "Productivity",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /products
**Description**: Create new product
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 24.99,
  "category": "Category Name",
  "image_url": "https://example.com/image.jpg"
}
```

### GET /products/{product_id}
**Description**: Get specific product details
**Method**: GET
**Parameters**: 
- `product_id` (required): Product ID

### PUT /products/{product_id}
**Description**: Update product information
**Method**: PUT
**Content-Type**: application/json

### DELETE /products/{product_id}
**Description**: Soft delete product (sets is_active to false)
**Method**: DELETE

## 👥 USER MANAGEMENT ENDPOINTS

### POST /users
**Description**: Create new user account (triggers welcome email)
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "User Name"
}
```

**Response**: User object with auto-generated ID

### GET /users/{user_id}
**Description**: Get user information
**Method**: GET
**Parameters**: 
- `user_id` (required): User ID

## 🛒 ORDER MANAGEMENT ENDPOINTS

### POST /orders
**Description**: Create new order (triggers confirmation email)
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "user_id": "user-123",
  "product_id": "product-123",
  "amount": 29.99
}
```

### GET /orders/{order_id}
**Description**: Get order details
**Method**: GET

### GET /users/{user_id}/orders
**Description**: Get all orders for a user
**Method**: GET

### PUT /orders/{order_id}/status
**Description**: Update order status (triggers delivery emails)
**Method**: PUT
**Parameters**:
- `status` (required): "pending", "completed", "failed"
- `payment_id` (optional): Payment transaction ID

**Example**:
```bash
curl -X PUT "https://digital-launch-pro.preview.emergentagent.com/api/orders/order-123/status?status=completed&payment_id=pay_123"
```

## 📧 EMAIL AUTOMATION ENDPOINTS

### POST /emails/send
**Description**: Send AI-generated emails
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "email_type": "welcome",
  "recipient_email": "customer@example.com",
  "context": {
    "customer_name": "John Doe",
    "product_name": "Digital Life Planners"
  }
}
```

**Email Types**:
- `welcome`: Welcome new subscribers
- `order_confirmation`: Confirm purchases
- `product_delivery`: Send download links
- `customer_service`: Auto-respond to inquiries
- `marketing`: Promotional campaigns

### POST /emails/generate-content
**Description**: Generate email content without sending
**Method**: POST
**Parameters**:
- `email_type` (required): Type of email to generate

**Request Body**:
```json
{
  "customer_name": "John Doe",
  "product_name": "AI Prompt Packs",
  "special_offer": "20% off"
}
```

## 🎨 CONTENT GENERATION ENDPOINTS

### POST /automation/generate-content
**Description**: Generate AI content for any platform
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "platform": "instagram",
  "theme": "productivity",
  "content_type": "motivational"
}
```

**Supported Platforms**:
- `instagram`: Posts and stories
- `tiktok`: Video scripts
- `twitter`: Tweets and threads
- `linkedin`: Professional posts
- `email`: Email campaigns
- `blog`: Blog post outlines

**Example Response**:
```json
{
  "caption": "🎯 MOTIVATION MONDAY: Ready to crush your goals...",
  "hashtags": "#productivity #goals #planning...",
  "cta": "Get our Digital Life Planners! Link in bio 🔗"
}
```

### GET /automation/content-calendar
**Description**: Get AI-generated content calendar
**Method**: GET
**Parameters**:
- `days` (default: 30): Number of days to generate

## 🤖 AUTOMATION SYSTEM ENDPOINTS

### GET /automation/action-plan
**Description**: Get detailed 30-day action plan
**Method**: GET

**Response**: Complete action plan with daily tasks and targets

### POST /automation/customer-journey
**Description**: Optimize customer journey with AI
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "id": "customer-123",
  "behaviors": {
    "email_opened": true,
    "website_visited": true,
    "product_viewed": false,
    "purchased": false
  }
}
```

### GET /automation/revenue-optimization
**Description**: Get AI revenue optimization recommendations
**Method**: GET

### GET /automation/pricing-optimization
**Description**: Get dynamic pricing strategies
**Method**: GET

### GET /automation/upsell-optimization
**Description**: Get upselling recommendations
**Method**: GET

### POST /automation/behavioral-trigger
**Description**: Execute behavioral trigger for customer
**Method**: POST
**Parameters**:
- `trigger_name` (required): Name of trigger to execute

**Request Body**: Customer data object

## 📈 MARKETING ENDPOINTS

### GET /marketing/complete-strategy
**Description**: Get comprehensive marketing strategy
**Method**: GET

### GET /marketing/products-research
**Description**: Get top 4 products research
**Method**: GET

### GET /marketing/suppliers
**Description**: Get supplier recommendations
**Method**: GET

### GET /marketing/revenue-model
**Description**: Get revenue projection model
**Method**: GET

### POST /marketing/campaign
**Description**: Send marketing campaign to all users
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "campaign_name": "Launch Campaign",
  "special_offer": "30% off everything",
  "target_audience": "entrepreneurs"
}
```

## 📱 CONTACT & SUPPORT ENDPOINTS

### POST /contact
**Description**: Submit contact form with AI auto-response
**Method**: POST
**Content-Type**: application/json

**Request Body**:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "subject": "Question about products",
  "message": "I have a question..."
}
```

## 📦 DIGITAL DELIVERY ENDPOINTS

### GET /download/{token}
**Description**: Secure digital product download
**Method**: GET
**Parameters**:
- `token` (required): Secure download token

**Token Features**:
- 7-day expiration
- 5 download limit
- Secure encryption
- Usage tracking

## 🔧 UTILITY ENDPOINTS

### GET /health
**Description**: Check API health status
**Method**: GET

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### GET /
**Description**: API welcome message
**Method**: GET

## 📋 DOCUMENTATION ENDPOINTS

### GET /documentation/create-package
**Description**: Create complete downloadable documentation package
**Method**: GET

### GET /documentation/download-package
**Description**: Download complete documentation as zip file
**Method**: GET
**Response**: ZIP file download

## 📊 ERROR CODES REFERENCE

### HTTP STATUS CODES
- `200`: Success
- `201`: Created successfully
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Authentication required
- `403`: Forbidden - Access denied
- `404`: Not Found - Resource not found
- `429`: Too Many Requests - Rate limited
- `500`: Internal Server Error

### CUSTOM ERROR CODES
- `INVALID_REQUEST`: Request format invalid
- `MISSING_PARAMETER`: Required parameter missing
- `RESOURCE_NOT_FOUND`: Requested resource not found
- `VALIDATION_ERROR`: Data validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `SERVICE_UNAVAILABLE`: Service temporarily unavailable

## 🔐 SECURITY & RATE LIMITING

### RATE LIMITS
- 1000 requests per hour per IP
- 100 requests per minute per IP
- Automatic throttling for excessive usage

### SECURITY HEADERS
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

### DATA PROTECTION
- All sensitive data encrypted at rest
- HTTPS-only communication
- Regular security audits
- GDPR compliance features

## 🔄 WEBHOOKS

### WEBHOOK ENDPOINTS
Setup webhooks for real-time notifications:

**Order Completion Webhook**:
```
POST /webhooks/order-completed
Headers: {"X-Webhook-Secret": "your-secret"}
```

**Email Engagement Webhook**:
```
POST /webhooks/email-engagement
Headers: {"X-Webhook-Secret": "your-secret"}
```

## 🧪 TESTING ENDPOINTS

### TEST API CALLS
Use these examples to test your integration:

**Test Product Creation**:
```bash
curl -X POST "https://digital-launch-pro.preview.emergentagent.com/api/products"   -H "Content-Type: application/json"   -d '{
    "name": "Test Product",
    "description": "Test description",
    "price": 19.99,
    "category": "Test"
  }'
```

**Test Content Generation**:
```bash
curl -X POST "https://digital-launch-pro.preview.emergentagent.com/api/automation/generate-content"   -H "Content-Type: application/json"   -d '{
    "platform": "instagram",
    "theme": "productivity"
  }'
```

**Test Email Generation**:
```bash
curl -X POST "https://digital-launch-pro.preview.emergentagent.com/api/emails/generate-content?email_type=welcome"   -H "Content-Type: application/json"   -d '{
    "customer_name": "Test User",
    "customer_email": "test@example.com"
  }'
```

## 📚 SDK & LIBRARIES

### PYTHON SDK EXAMPLE
```python
import requests

class DigitalStoreAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def get_products(self, category=None):
        url = f"{self.base_url}/products"
        params = {"category": category} if category else {}
        response = requests.get(url, params=params)
        return response.json()
    
    def generate_content(self, platform, theme):
        url = f"{self.base_url}/automation/generate-content"
        data = {"platform": platform, "theme": theme}
        response = requests.post(url, json=data)
        return response.json()

# Usage
api = DigitalStoreAPI("https://digital-launch-pro.preview.emergentagent.com/api")
products = api.get_products("Productivity")
content = api.generate_content("instagram", "motivation")
```

### JAVASCRIPT SDK EXAMPLE
```javascript
class DigitalStoreAPI {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    
    async getProducts(category = null) {
        const url = new URL(`${this.baseUrl}/products`);
        if (category) url.searchParams.set('category', category);
        
        const response = await fetch(url);
        return response.json();
    }
    
    async generateContent(platform, theme) {
        const response = await fetch(`${this.baseUrl}/automation/generate-content`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, theme })
        });
        return response.json();
    }
}

// Usage
const api = new DigitalStoreAPI('https://digital-launch-pro.preview.emergentagent.com/api');
const products = await api.getProducts('Productivity');
const content = await api.generateContent('instagram', 'motivation');
```

## 🚀 PRODUCTION DEPLOYMENT

### ENVIRONMENT VARIABLES
```bash
# Required
MONGO_URL=mongodb://localhost:27017
DB_NAME=digital_store_db
CORS_ORIGINS=*
EMERGENT_LLM_KEY=your-llm-key

# Optional
EMAIL_PROVIDER=convertkit
SOCIAL_SCHEDULER=buffer
ANALYTICS_PROVIDER=google_analytics
```

### SCALING CONSIDERATIONS
- Database indexing for performance
- Caching layer for frequently accessed data
- Load balancing for high traffic
- CDN for static asset delivery
- Monitoring and alerting systems

**Your API is enterprise-ready and fully documented for easy integration!** 🔗🚀
