from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationBearer
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Any
import uuid
from datetime import datetime, timedelta, timezone
import hashlib
import jwt
from passlib.context import CryptContext
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()
SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-here')
ALGORITHM = "HS256"

# Create the main app without a prefix
app = FastAPI(title="E-commerce Store API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# AI Chat setup
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Helper functions
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def prepare_for_mongo(data):
    """Convert datetime objects to ISO strings for MongoDB storage"""
    if isinstance(data, dict):
        for key, value in data.items():
            if isinstance(value, datetime):
                data[key] = value.isoformat()
    return data

# Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    hashed_password: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    download_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = True

class ProductCreate(BaseModel):
    name: str
    description: str
    price: float
    category: str
    image_url: Optional[str] = None
    download_url: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem]
    total_amount: float
    status: str = "pending"  # pending, completed, cancelled
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    subject: str
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ContactMessageCreate(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class ChatMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    user_message: str
    ai_response: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

# Auth Routes
@api_router.post("/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hashed_password
    )
    
    user_dict = prepare_for_mongo(user.dict())
    await db.users.insert_one(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user.id})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": user["id"]})
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Product Routes
@api_router.get("/products", response_model=List[Product])
async def get_products():
    products = await db.products.find({"is_active": True}).to_list(100)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(product_data: ProductCreate):
    product = Product(**product_data.dict())
    product_dict = prepare_for_mongo(product.dict())
    await db.products.insert_one(product_dict)
    return product

# Cart Routes
@api_router.get("/cart")
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = Cart(user_id=current_user.id)
        cart_dict = prepare_for_mongo(cart.dict())
        await db.carts.insert_one(cart_dict)
    else:
        cart = Cart(**cart)
    
    # Get product details for cart items
    cart_with_products = []
    for item in cart.items:
        product = await db.products.find_one({"id": item.product_id})
        if product:
            cart_with_products.append({
                "product": Product(**product),
                "quantity": item.quantity
            })
    
    return {"cart": cart, "items": cart_with_products}

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    
    if not cart:
        cart = Cart(user_id=current_user.id, items=[item])
    else:
        cart = Cart(**cart)
        # Check if item already exists in cart
        existing_item = next((i for i in cart.items if i.product_id == item.product_id), None)
        if existing_item:
            existing_item.quantity += item.quantity
        else:
            cart.items.append(item)
        cart.updated_at = datetime.now(timezone.utc)
    
    cart_dict = prepare_for_mongo(cart.dict())
    await db.carts.replace_one({"user_id": current_user.id}, cart_dict, upsert=True)
    return {"message": "Item added to cart"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if cart:
        cart = Cart(**cart)
        cart.items = [item for item in cart.items if item.product_id != product_id]
        cart.updated_at = datetime.now(timezone.utc)
        
        cart_dict = prepare_for_mongo(cart.dict())
        await db.carts.replace_one({"user_id": current_user.id}, cart_dict)
    
    return {"message": "Item removed from cart"}

# Order Routes
@api_router.post("/orders", response_model=Order)
async def create_order(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total
    total_amount = 0
    for item in cart["items"]:
        product = await db.products.find_one({"id": item["product_id"]})
        if product:
            total_amount += product["price"] * item["quantity"]
    
    order = Order(
        user_id=current_user.id,
        items=cart["items"],
        total_amount=total_amount
    )
    
    order_dict = prepare_for_mongo(order.dict())
    await db.orders.insert_one(order_dict)
    
    # Clear cart
    await db.carts.delete_one({"user_id": current_user.id})
    
    return order

@api_router.get("/orders", response_model=List[Order])
async def get_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}).to_list(100)
    return [Order(**order) for order in orders]

# Contact Routes
@api_router.post("/contact", response_model=ContactMessage)
async def submit_contact(message_data: ContactMessageCreate):
    message = ContactMessage(**message_data.dict())
    message_dict = prepare_for_mongo(message.dict())
    await db.contact_messages.insert_one(message_dict)
    return message

# AI Chat Routes
@api_router.post("/chat")
async def chat_with_ai(chat_request: ChatRequest):
    try:
        session_id = chat_request.session_id or str(uuid.uuid4())
        
        # Initialize AI chat
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=session_id,
            system_message="""You are a helpful customer support assistant for a digital products e-commerce store. 
            We sell courses, ebooks, calendars, day planners, and kids coloring books. 
            
            You can help customers with:
            - Product information and recommendations
            - Order status and issues
            - Refund and return policies
            - Digital product delivery
            - General store policies
            
            Our policies:
            - Digital products are delivered immediately after payment
            - 30-day money-back guarantee on all products
            - Refunds processed within 5-7 business days
            - Customer support available 24/7
            
            Be friendly, helpful, and professional."""
        ).with_model("openai", "gpt-4o-mini")
        
        user_message = UserMessage(text=chat_request.message)
        ai_response = await chat.send_message(user_message)
        
        # Save chat message to database
        chat_message = ChatMessage(
            session_id=session_id,
            user_message=chat_request.message,
            ai_response=ai_response
        )
        
        chat_dict = prepare_for_mongo(chat_message.dict())
        await db.chat_messages.insert_one(chat_dict)
        
        return {
            "response": ai_response,
            "session_id": session_id
        }
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return {
            "response": "I'm sorry, I'm having trouble processing your request right now. Please try again later or contact our support team directly.",
            "session_id": chat_request.session_id or str(uuid.uuid4())
        }

# Initialize some sample products
@api_router.post("/init-products")
async def initialize_products():
    sample_products = [
        {
            "name": "Complete Digital Marketing Course",
            "description": "Learn digital marketing from beginner to expert level. Includes social media, SEO, PPC, and content marketing strategies.",
            "price": 99.99,
            "category": "courses",
            "image_url": "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=400",
            "download_url": "https://example.com/download/marketing-course"
        },
        {
            "name": "2025 Productivity Planner",
            "description": "Digital planner to organize your year, set goals, and track progress. Compatible with all digital note-taking apps.",
            "price": 19.99,
            "category": "planners",
            "image_url": "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=400",
            "download_url": "https://example.com/download/productivity-planner"
        },
        {
            "name": "Kids Animal Coloring Book",
            "description": "50 beautiful animal illustrations for kids to color. High-quality printable PDF format.",
            "price": 9.99,
            "category": "coloring-books",
            "image_url": "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400",
            "download_url": "https://example.com/download/animal-coloring"
        },
        {
            "name": "Ultimate Recipe eBook Collection",
            "description": "500+ healthy and delicious recipes with step-by-step instructions and nutritional information.",
            "price": 29.99,
            "category": "ebooks",
            "image_url": "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400",
            "download_url": "https://example.com/download/recipe-ebook"
        },
        {
            "name": "2025 Wall Calendar Design",
            "description": "Beautiful printable wall calendar with inspiring quotes and stunning photography for each month.",
            "price": 14.99,
            "category": "calendars",
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
            "download_url": "https://example.com/download/wall-calendar"
        }
    ]
    
    for product_data in sample_products:
        existing = await db.products.find_one({"name": product_data["name"]})
        if not existing:
            product = Product(**product_data)
            product_dict = prepare_for_mongo(product.dict())
            await db.products.insert_one(product_dict)
    
    return {"message": "Sample products initialized"}

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "E-commerce Store API"}

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