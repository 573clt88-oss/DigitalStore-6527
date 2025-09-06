from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import hashlib
import secrets
import aiofiles
import jwt
from passlib.context import CryptContext
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Digital eBook Marketplace", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
JWT_SECRET = os.environ.get("JWT_SECRET", "your-secret-key-change-this")
JWT_ALGORITHM = "HS256"

# File storage
UPLOAD_DIR = ROOT_DIR / "uploads"
EBOOK_DIR = UPLOAD_DIR / "ebooks"
COVER_DIR = UPLOAD_DIR / "covers"

# Create directories
UPLOAD_DIR.mkdir(exist_ok=True)
EBOOK_DIR.mkdir(exist_ok=True)
COVER_DIR.mkdir(exist_ok=True)

# eBook Categories
EBOOK_CATEGORIES = [
    "Business eBooks",
    "Blogging eBooks", 
    "Computer and Technology eBooks",
    "Dating and Relations eBooks",
    "Finance eBooks",
    "Health and Fitness eBooks",
    "Kids eBooks",
    "Music eBooks",
    "Print on Demand eBooks",
    "Real Estate eBooks",
    "SEO & Web Traffic eBooks",
    "Pets eBooks",
    "Self improvement eBooks",
    "Sports eBooks",
    "Travel eBooks",
    "Calendar",
    "Day Planners",
    "Kids coloring eBooks",
    "Home and Garden eBooks"
]

# Define Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    hashed_password: str
    is_active: bool = True
    is_admin: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    category: str
    price: float
    cover_image: Optional[str] = None
    file_path: Optional[str] = None
    file_size: Optional[int] = None
    downloads: int = 0
    rating: float = 0.0
    reviews_count: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ProductCreate(BaseModel):
    title: str
    description: str
    category: str
    price: float

class CartItem(BaseModel):
    product_id: str
    quantity: int = 1

class Cart(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[CartItem] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    items: List[Dict[str, Any]]
    total_amount: float
    payment_status: str = "pending"  # pending, completed, failed
    payment_method: str = "paypal"
    payment_id: Optional[str] = None
    download_links: Dict[str, str] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Review(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    user_id: str
    rating: int = Field(ge=1, le=5)
    comment: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DownloadLink(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    product_id: str
    order_id: str
    download_token: str
    expires_at: datetime
    downloads_remaining: int = 3
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Helper functions
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = await db.users.find_one({"email": email})
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return User(**user)

async def get_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user

def generate_download_token():
    return secrets.token_urlsafe(32)

# Authentication Routes
@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    
    await db.users.insert_one(user.dict())
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/auth/login", response_model=Token)
async def login(user_data: UserLogin):
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

# Product Routes
@api_router.get("/categories")
async def get_categories():
    return {"categories": EBOOK_CATEGORIES}

@api_router.get("/products", response_model=List[Product])
async def get_products(category: Optional[str] = None, skip: int = 0, limit: int = 20):
    filter_dict = {"is_active": True}
    if category:
        filter_dict["category"] = category
    
    products = await db.products.find(filter_dict).skip(skip).limit(limit).to_list(length=limit)
    return [Product(**product) for product in products]

@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    product = await db.products.find_one({"id": product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return Product(**product)

@api_router.post("/products", response_model=Product)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_admin_user)
):
    if product_data.category not in EBOOK_CATEGORIES:
        raise HTTPException(status_code=400, detail="Invalid category")
    
    product = Product(**product_data.dict())
    await db.products.insert_one(product.dict())
    return product

@api_router.post("/products/{product_id}/upload-ebook")
async def upload_ebook(
    product_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user)
):
    # Verify product exists
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Save file
    file_extension = Path(file.filename).suffix
    filename = f"{product_id}{file_extension}"
    file_path = EBOOK_DIR / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        while chunk := await file.read(1024):
            await f.write(chunk)
    
    # Update product
    file_size = file_path.stat().st_size
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"file_path": str(file_path), "file_size": file_size}}
    )
    
    return {"message": "eBook uploaded successfully", "filename": filename}

@api_router.post("/products/{product_id}/upload-cover")
async def upload_cover(
    product_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_admin_user)
):
    # Verify product exists
    product = await db.products.find_one({"id": product_id})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Save cover image
    file_extension = Path(file.filename).suffix
    filename = f"{product_id}_cover{file_extension}"
    file_path = COVER_DIR / filename
    
    async with aiofiles.open(file_path, 'wb') as f:
        while chunk := await file.read(1024):
            await f.write(chunk)
    
    # Update product
    await db.products.update_one(
        {"id": product_id},
        {"$set": {"cover_image": f"/api/files/covers/{filename}"}}
    )
    
    return {"message": "Cover image uploaded successfully", "filename": filename}

# Cart Routes
@api_router.get("/cart", response_model=Cart)
async def get_cart(current_user: User = Depends(get_current_user)):
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = Cart(user_id=current_user.id)
        await db.carts.insert_one(cart.dict())
    return Cart(**cart)

@api_router.post("/cart/add")
async def add_to_cart(item: CartItem, current_user: User = Depends(get_current_user)):
    # Verify product exists
    product = await db.products.find_one({"id": item.product_id, "is_active": True})
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Get or create cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart:
        cart = Cart(user_id=current_user.id)
        await db.carts.insert_one(cart.dict())
    else:
        cart = Cart(**cart)
    
    # Add or update item
    existing_item = next((i for i in cart.items if i.product_id == item.product_id), None)
    if existing_item:
        existing_item.quantity += item.quantity
    else:
        cart.items.append(item)
    
    cart.updated_at = datetime.utcnow()
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": cart.dict()}
    )
    
    return {"message": "Item added to cart"}

@api_router.delete("/cart/remove/{product_id}")
async def remove_from_cart(product_id: str, current_user: User = Depends(get_current_user)):
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$pull": {"items": {"product_id": product_id}}}
    )
    return {"message": "Item removed from cart"}

# Order Routes
@api_router.post("/orders/create", response_model=Order)
async def create_order(current_user: User = Depends(get_current_user)):
    # Get cart
    cart = await db.carts.find_one({"user_id": current_user.id})
    if not cart or not cart.get("items"):
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Calculate total and prepare order items
    total_amount = 0
    order_items = []
    
    for cart_item in cart["items"]:
        product = await db.products.find_one({"id": cart_item["product_id"]})
        if product:
            item_total = product["price"] * cart_item["quantity"]
            total_amount += item_total
            order_items.append({
                "product_id": product["id"],
                "title": product["title"],
                "price": product["price"],
                "quantity": cart_item["quantity"],
                "total": item_total
            })
    
    # Create order
    order = Order(
        user_id=current_user.id,
        items=order_items,
        total_amount=total_amount
    )
    
    await db.orders.insert_one(order.dict())
    return order

@api_router.post("/orders/{order_id}/complete-payment")
async def complete_payment(
    order_id: str,
    payment_id: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    # Get order
    order = await db.orders.find_one({"id": order_id, "user_id": current_user.id})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Generate download links
    download_links = {}
    for item in order["items"]:
        product_id = item["product_id"]
        download_token = generate_download_token()
        expires_at = datetime.utcnow() + timedelta(days=30)
        
        download_link = DownloadLink(
            user_id=current_user.id,
            product_id=product_id,
            order_id=order_id,
            download_token=download_token,
            expires_at=expires_at
        )
        
        await db.download_links.insert_one(download_link.dict())
        download_links[product_id] = f"/api/download/{download_token}"
    
    # Update order
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {
            "payment_status": "completed",
            "payment_id": payment_id,
            "download_links": download_links
        }}
    )
    
    # Clear cart
    await db.carts.update_one(
        {"user_id": current_user.id},
        {"$set": {"items": []}}
    )
    
    return {"message": "Payment completed", "download_links": download_links}

@api_router.get("/orders", response_model=List[Order])
async def get_user_orders(current_user: User = Depends(get_current_user)):
    orders = await db.orders.find({"user_id": current_user.id}).to_list(100)
    return [Order(**order) for order in orders]

# Download Routes
@api_router.get("/download/{token}")
async def download_ebook(token: str):
    # Get download link
    download_link = await db.download_links.find_one({"download_token": token})
    if not download_link:
        raise HTTPException(status_code=404, detail="Download link not found")
    
    download_link = DownloadLink(**download_link)
    
    # Check expiration
    if download_link.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Download link expired")
    
    # Check downloads remaining
    if download_link.downloads_remaining <= 0:
        raise HTTPException(status_code=410, detail="Download limit exceeded")
    
    # Get product
    product = await db.products.find_one({"id": download_link.product_id})
    if not product or not product.get("file_path"):
        raise HTTPException(status_code=404, detail="File not found")
    
    # Update download count
    await db.download_links.update_one(
        {"download_token": token},
        {"$inc": {"downloads_remaining": -1}}
    )
    
    await db.products.update_one(
        {"id": download_link.product_id},
        {"$inc": {"downloads": 1}}
    )
    
    # Return file
    file_path = Path(product["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on server")
    
    return FileResponse(
        path=file_path,
        filename=f"{product['title']}.{file_path.suffix}",
        media_type='application/octet-stream'
    )

# File serving routes
@api_router.get("/files/covers/{filename}")
async def get_cover_image(filename: str):
    file_path = COVER_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path)

# Admin Routes
@api_router.get("/admin/products", response_model=List[Product])
async def get_all_products_admin(current_user: User = Depends(get_admin_user)):
    products = await db.products.find().to_list(1000)
    return [Product(**product) for product in products]

@api_router.get("/admin/orders", response_model=List[Order])
async def get_all_orders_admin(current_user: User = Depends(get_admin_user)):
    orders = await db.orders.find().to_list(1000)
    return [Order(**order) for order in orders]

@api_router.get("/admin/stats")
async def get_admin_stats(current_user: User = Depends(get_admin_user)):
    total_products = await db.products.count_documents({"is_active": True})
    total_orders = await db.orders.count_documents({})
    total_users = await db.users.count_documents({})
    total_revenue = await db.orders.aggregate([
        {"$match": {"payment_status": "completed"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
    ]).to_list(1)
    
    revenue = total_revenue[0]["total"] if total_revenue else 0
    
    return {
        "total_products": total_products,
        "total_orders": total_orders,
        "total_users": total_users,
        "total_revenue": revenue
    }

# Basic routes
@api_router.get("/")
async def root():
    return {"message": "Digital eBook Marketplace API"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy"}

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