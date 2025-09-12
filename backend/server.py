from fastapi import FastAPI, APIRouter, HTTPException, Depends, BackgroundTasks
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# Import our custom services
from email_service import email_service
from digital_delivery import delivery_service
from marketing_strategy import marketing_strategy
from automation_sequences import automation_manager, content_engine, revenue_engine
from analytics_automation import analytics, optimizer, competitor_monitor
from content_generator import content_generator
from action_plan_30_days import action_plan
from customer_journey_automation import customer_journey_ai, behavioral_triggers, retention_system
from revenue_optimization_engine import revenue_optimizer, pricing_engine, upsell_engine
from pdf_generator import pdf_generator

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Digital Store-6527 API", version="2.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    download_url: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    download_url: Optional[str] = None

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: str
    name: str

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    amount: float
    status: str = "pending"  # pending, completed, failed
    payment_id: Optional[str] = None
    download_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class OrderCreate(BaseModel):
    user_id: str
    product_id: str
    amount: float

class EmailRequest(BaseModel):
    email_type: str  # order_confirmation, product_delivery, customer_service, welcome, marketing
    recipient_email: str
    context: dict

class ContactMessage(BaseModel):
    name: str
    email: str
    subject: str
    message: str


# Basic Routes
@api_router.get("/")
async def root():
    return {"message": "Digital Store-6527 API is running with AI automation"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

# Status Check Routes (existing)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Product Routes
@api_router.post("/products", response_model=Product)
async def create_product(product: ProductCreate):
    product_dict = product.dict()
    product_obj = Product(**product_dict)
    await db.products.insert_one(product_obj.dict())
    return product_obj

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None):
    query = {"is_active": True}
    if category:
        query["category"] = category
    
    products = await db.products.find(query).to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, product_update: ProductCreate):
    existing_product = await db.products.find_one({"id": product_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_update.dict()
    await db.products.update_one(
        {"id": product_id},
        {"$set": update_data}
    )
    
    updated_product = await db.products.find_one({"id": product_id})
    return Product(**updated_product)

@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str):
    result = await db.products.update_one(
        {"id": product_id},
        {"$set": {"is_active": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"message": "Product deleted successfully"}

# User Routes
@api_router.post("/users", response_model=User)
async def create_user(user: UserCreate, background_tasks: BackgroundTasks):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    user_dict = user.dict()
    user_obj = User(**user_dict)
    await db.users.insert_one(user_obj.dict())
    
    # Send welcome email in background
    background_tasks.add_task(
        email_service.send_welcome_email,
        {
            'customer_name': user.name,
            'customer_email': user.email
        }
    )
    
    return user_obj

@api_router.get("/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return User(**user)

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(order: OrderCreate, background_tasks: BackgroundTasks):
    # Verify product exists
    product = await db.products.find_one({"id": order.product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Verify user exists
    user = await db.users.find_one({"id": order.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    order_dict = order.dict()
    order_obj = Order(**order_dict)
    await db.orders.insert_one(order_obj.dict())
    
    # Send order confirmation email in background
    background_tasks.add_task(
        email_service.send_order_confirmation,
        {
            'order_id': order_obj.id,
            'customer_name': user['name'],
            'customer_email': user['email'],
            'product_name': product['name'],
            'price': product['price']
        }
    )
    
    return order_obj

@api_router.get("/orders/{order_id}", response_model=Order)
async def get_order(order_id: str):
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return Order(**order)

@api_router.get("/users/{user_id}/orders", response_model=List[Order])
async def get_user_orders(user_id: str):
    orders = await db.orders.find({"user_id": user_id}).to_list(1000)
    return [Order(**order) for order in orders]

@api_router.put("/orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, payment_id: Optional[str] = None, background_tasks: BackgroundTasks = None):
    # Get order details
    order = await db.orders.find_one({"id": order_id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    update_data = {"status": status}
    if payment_id:
        update_data["payment_id"] = payment_id
    
    # If order is completed, process digital delivery
    if status == "completed":
        # Get user and product details
        user = await db.users.find_one({"id": order["user_id"]})
        product = await db.products.find_one({"id": order["product_id"]})
        
        if user and product:
            # Process digital delivery
            delivery_info = await delivery_service.process_order_delivery({
                'order_id': order_id,
                'product_id': order["product_id"],
                'user_id': order["user_id"],
                'product_name': product['name']
            })
            
            # Update order with download URL
            if delivery_info.get('download_url'):
                update_data["download_url"] = delivery_info['download_url']
            
            # Send product delivery email in background
            if background_tasks:
                background_tasks.add_task(
                    email_service.send_product_delivery,
                    {
                        'customer_name': user['name'],
                        'customer_email': user['email'],
                        'product_name': product['name'],
                        'download_link': delivery_info.get('download_url', 'Processing...')
                    }
                )
    
    result = await db.orders.update_one(
        {"id": order_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Order not found")
    
    return {"message": "Order status updated successfully", "delivery_processed": status == "completed"}

# Digital Product Download Route
@api_router.get("/download/{token}")
async def download_product(token: str):
    """Secure digital product download with token validation"""
    
    # Validate download token
    token_data = delivery_service.validate_download_token(token)
    if not token_data:
        raise HTTPException(status_code=401, detail="Invalid or expired download token")
    
    # Get order and product details
    order = await db.orders.find_one({"id": token_data['order_id']})
    if not order or order['status'] != 'completed':
        raise HTTPException(status_code=404, detail="Order not found or not completed")
    
    product = await db.products.find_one({"id": token_data['product_id']})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get product file
    product_file = await delivery_service.get_product_file_path(product['name'])
    if not product_file or not product_file.exists():
        raise HTTPException(status_code=404, detail="Product file not available")
    
    # Increment download count
    delivery_service.increment_download_count(token)
    
    # Return file for download
    return FileResponse(
        path=str(product_file),
        filename=product_file.name,
        media_type='application/octet-stream'
    )

# Email Routes (AI-Powered)
@api_router.post("/emails/send")
async def send_email(email_request: EmailRequest, background_tasks: BackgroundTasks):
    """Send AI-generated emails"""
    
    email_types = ["order_confirmation", "product_delivery", "customer_service", "welcome", "marketing"]
    if email_request.email_type not in email_types:
        raise HTTPException(status_code=400, detail=f"Invalid email type. Must be one of: {email_types}")
    
    # Send email in background
    if email_request.email_type == "order_confirmation":
        background_tasks.add_task(email_service.send_order_confirmation, email_request.context)
    elif email_request.email_type == "product_delivery":
        background_tasks.add_task(email_service.send_product_delivery, email_request.context)
    elif email_request.email_type == "customer_service":
        background_tasks.add_task(email_service.send_customer_service_response, email_request.context)
    elif email_request.email_type == "welcome":
        background_tasks.add_task(email_service.send_welcome_email, email_request.context)
    elif email_request.email_type == "marketing":
        background_tasks.add_task(email_service.send_marketing_email, email_request.context)
    
    return {"message": f"AI-generated {email_request.email_type} email queued for sending"}

@api_router.post("/emails/generate-content")
async def generate_email_content(email_type: str, context: dict):
    """Generate AI email content without sending"""
    
    content = await email_service.generate_email_content(email_type, context)
    return {"email_type": email_type, "generated_content": content}

# Contact Form Route
@api_router.post("/contact")
async def submit_contact_form(contact: ContactMessage, background_tasks: BackgroundTasks):
    """Handle contact form submissions with AI-powered responses"""
    
    # Store contact message
    contact_dict = contact.dict()
    contact_dict['id'] = str(uuid.uuid4())
    contact_dict['created_at'] = datetime.utcnow()
    contact_dict['status'] = 'new'
    
    await db.contact_messages.insert_one(contact_dict)
    
    # Send AI-powered auto-response
    background_tasks.add_task(
        email_service.send_customer_service_response,
        {
            'customer_name': contact.name,
            'customer_email': contact.email,
            'original_subject': contact.subject,
            'issue': contact.message,
            'additional_context': 'This is an auto-response to your contact form submission. A team member will follow up soon.'
        }
    )
    
    return {"message": "Contact form submitted successfully. You'll receive an auto-response shortly."}

# Analytics Routes
@api_router.get("/analytics/overview")
async def get_analytics_overview():
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    completed_orders = await db.orders.count_documents({"status": "completed"})
    pending_orders = await db.orders.count_documents({"status": "pending"})
    
    # Calculate total revenue
    revenue_pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    revenue_result = await db.orders.aggregate(revenue_pipeline).to_list(1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Get contact messages count
    total_contacts = await db.contact_messages.count_documents({})
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "completed_orders": completed_orders,
        "pending_orders": pending_orders,
        "total_revenue": total_revenue,
        "total_contacts": total_contacts,
        "ai_features_active": True
    }

# Marketing automation endpoint
@api_router.post("/marketing/campaign")
async def send_marketing_campaign(campaign_data: dict, background_tasks: BackgroundTasks):
    """Send AI-generated marketing campaign to all users"""
    
    # Get all users
    users = await db.users.find().to_list(1000)
    
    for user in users:
        campaign_context = {**campaign_data, "customer_email": user["email"], "customer_name": user["name"]}
        background_tasks.add_task(email_service.send_marketing_email, campaign_context)
    
    return {"message": f"Marketing campaign queued for {len(users)} recipients"}

# Marketing Strategy & Research Endpoints
@api_router.get("/marketing/strategy")
async def get_marketing_strategy():
    """Get comprehensive marketing strategy for $10-15K revenue goal"""
    return marketing_strategy.get_zero_budget_marketing_strategy()

@api_router.get("/marketing/products-research")
async def get_products_research():
    """Get top 4 digital products research and analysis"""
    return marketing_strategy.get_top_4_products_research()

@api_router.get("/marketing/suppliers")
async def get_supplier_research():
    """Get supplier research for digital products"""
    return marketing_strategy.get_supplier_research()

@api_router.get("/marketing/revenue-model")
async def get_revenue_projection():
    """Get detailed revenue projection model"""
    return marketing_strategy.get_revenue_projection_model()

@api_router.get("/marketing/automation-framework")
async def get_automation_framework():
    """Get business automation framework for passive income"""
    return marketing_strategy.get_automation_framework()

@api_router.get("/marketing/complete-strategy")
async def get_complete_strategy():
    """Get complete marketing strategy package"""
    return {
        "overview": "Complete Digital Store-6527 Marketing Strategy",
        "generated_on": datetime.utcnow().isoformat(),
        "revenue_goal": "$10,000-15,000 in 60 days",
        "budget": "$0 (Free marketing strategies only)",
        "products_research": marketing_strategy.get_top_4_products_research(),
        "supplier_research": marketing_strategy.get_supplier_research(),
        "marketing_strategy": marketing_strategy.get_zero_budget_marketing_strategy(),
        "revenue_model": marketing_strategy.get_revenue_projection_model(),
        "automation_framework": marketing_strategy.get_automation_framework(),
        "next_steps": [
            "1. Choose suppliers for top 4 products",
            "2. Set up social media accounts (Instagram, TikTok, Twitter, LinkedIn)",
            "3. Create content calendar for 60 days",
            "4. Implement email marketing sequences",
            "5. Launch first product with promotional campaign",
            "6. Track metrics and optimize based on performance",
            "7. Scale successful tactics and automate systems"
        ]
    }

# ADVANCED AUTOMATION ENDPOINTS
@api_router.get("/automation/content-calendar")
async def get_automated_content_calendar(days: int = 30):
    """Get AI-generated content calendar for specified days"""
    return await content_generator.generate_30_day_calendar()

@api_router.get("/automation/action-plan")
async def get_30_day_action_plan():
    """Get detailed 30-day action plan for revenue generation"""
    return action_plan.get_complete_action_plan()

@api_router.post("/automation/customer-journey")
async def optimize_customer_journey(customer_data: dict):
    """AI-powered customer journey optimization"""
    return await customer_journey_ai.optimize_customer_journey(customer_data)

@api_router.get("/automation/revenue-optimization")
async def get_revenue_optimization():
    """Get AI-powered revenue optimization recommendations"""
    return await revenue_optimizer.optimize_revenue_streams()

@api_router.get("/automation/pricing-optimization")
async def get_pricing_optimization():
    """Get dynamic pricing optimization strategies"""
    return await pricing_engine.optimize_pricing()

@api_router.get("/automation/upsell-optimization")
async def get_upsell_optimization():
    """Get upselling optimization strategies"""
    return await upsell_engine.optimize_upsells()

@api_router.post("/automation/behavioral-trigger")
async def execute_behavioral_trigger(trigger_name: str, customer_data: dict):
    """Execute behavioral trigger for customer"""
    return await behavioral_triggers.execute_trigger(trigger_name, customer_data)

@api_router.get("/automation/performance-analytics")
async def get_performance_analytics():
    """Get real-time performance analytics and alerts"""
    return {
        'metrics': await analytics.track_revenue_metrics(),
        'alerts': await analytics.performance_alerts_system(),
        'optimization_results': await optimizer.conversion_funnel_optimization(),
        'competitor_analysis': await competitor_monitor.competitor_analysis()
    }

@api_router.post("/automation/generate-content")
async def generate_ai_content(content_request: dict):
    """Generate AI content for any platform or purpose"""
    platform = content_request.get('platform', 'email')
    theme = content_request.get('theme', 'productivity')
    
    if platform == 'instagram':
        return await content_generator.generate_instagram_content(0, 'Monday', 1)
    elif platform == 'tiktok':
        return await content_generator.generate_tiktok_content(0, 'Monday', 1)
    elif platform == 'twitter':
        return await content_generator.generate_twitter_content(0, 'Monday', 1)
    elif platform == 'linkedin':
        return await content_generator.generate_linkedin_content(0, 'Monday', 1)
    elif platform == 'email':
        return await content_generator.generate_email_content(0, 'Monday', 1)
    elif platform == 'blog':
        return await content_generator.generate_blog_content(0, 'Monday', 1)
    else:
        return {"error": "Unsupported platform"}

@api_router.get("/automation/daily-checklist")
async def get_daily_checklist():
    """Get daily checklist for maintaining automation"""
    return action_plan.get_daily_checklist()

@api_router.get("/automation/emergency-protocols")
async def get_emergency_protocols():
    """Get emergency protocols for when things go wrong"""
    return action_plan.get_emergency_protocols()

# DOCUMENTATION DOWNLOAD ENDPOINTS
@api_router.get("/documentation/create-package")
async def create_documentation_package():
    """Create complete downloadable documentation package"""
    result = pdf_generator.create_documentation_package()
    return result

@api_router.get("/documentation/download-package")
async def download_documentation_package():
    """Download complete documentation as zip file"""
    import zipfile
    import io
    from pathlib import Path
    
    # Create zip file in memory
    zip_buffer = io.BytesIO()
    
    docs_dir = Path("/app/backend/documentation")
    
    # Create the documentation files first
    pdf_generator.create_documentation_package()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for file_path in docs_dir.glob("*.md"):
            zip_file.write(file_path, file_path.name)
    
    zip_buffer.seek(0)
    
    from fastapi.responses import StreamingResponse
    
    return StreamingResponse(
        io.BytesIO(zip_buffer.read()),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=Digital_Store_6527_Complete_Documentation.zip"}
    )

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

# Initialize with sample products and setup
@app.on_event("startup")
async def startup_event():
    # Create sample products if none exist
    product_count = await db.products.count_documents({"is_active": True})
    if product_count == 0:
        sample_products = [
            {
                "id": str(uuid.uuid4()),
                "name": "Digital Life Planners",
                "description": "Comprehensive productivity planners designed for modern professionals",
                "price": 29.99,
                "category": "Productivity",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Lead Magnet Templates",
                "description": "High-converting templates to grow your email list",
                "price": 19.99,
                "category": "Marketing",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "AI Prompt Packs",
                "description": "Professional prompt collections for content creation",
                "price": 24.99,
                "category": "AI Tools",
                "is_active": True,
                "created_at": datetime.utcnow()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Business E-Books",
                "description": "Essential guides for entrepreneurship and productivity",
                "price": 14.99,
                "category": "Education",
                "is_active": True,
                "created_at": datetime.utcnow()
            }
        ]
        
        await db.products.insert_many(sample_products)
        logger.info("Sample products created")
    
    # Initialize digital delivery system
    await delivery_service.create_sample_digital_products()
    logger.info("Digital delivery system initialized")
    
    logger.info("Digital Store-6527 API started with AI automation features")