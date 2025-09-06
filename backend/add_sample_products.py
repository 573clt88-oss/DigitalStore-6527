#!/usr/bin/env python3
"""
Script to add sample eBook products to demonstrate the marketplace
"""
import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import uuid
from datetime import datetime

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
load_dotenv(backend_dir / '.env')

async def add_sample_products():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Sample products
    sample_products = [
        {
            "id": str(uuid.uuid4()),
            "title": "The Complete Guide to Digital Marketing",
            "description": "Master the art of digital marketing with this comprehensive guide covering SEO, social media, content marketing, and paid advertising strategies that actually work in 2024.",
            "category": "Business eBooks",
            "price": 29.99,
            "cover_image": None,
            "file_path": None,
            "file_size": None,
            "downloads": 142,
            "rating": 4.8,
            "reviews_count": 23,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Python Programming for Beginners",
            "description": "Learn Python programming from scratch with hands-on examples, exercises, and real-world projects. Perfect for aspiring developers and career changers.",
            "category": "Computer and Technology eBooks",
            "price": 24.99,
            "cover_image": None,
            "file_path": None,
            "file_size": None,
            "downloads": 89,
            "rating": 4.6,
            "reviews_count": 15,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Personal Finance Mastery",
            "description": "Take control of your financial future with proven strategies for budgeting, investing, and building wealth. Includes practical worksheets and calculators.",
            "category": "Finance eBooks",
            "price": 19.99,
            "cover_image": None,
            "file_path": None,
            "file_size": None,
            "downloads": 267,
            "rating": 4.9,
            "reviews_count": 41,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Mindful Living: A Guide to Inner Peace",
            "description": "Discover the power of mindfulness and meditation to reduce stress, improve focus, and find inner peace in our chaotic world. Includes guided exercises.",
            "category": "Self improvement eBooks",
            "price": 16.99,
            "cover_image": None,
            "file_path": None,
            "file_size": None,
            "downloads": 198,
            "rating": 4.7,
            "reviews_count": 31,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "The Ultimate SEO Handbook 2024",
            "description": "Boost your website's search engine rankings with the latest SEO techniques and strategies. Includes case studies and actionable tips from industry experts.",
            "category": "SEO & Web Traffic eBooks",
            "price": 34.99,
            "cover_image": None,
            "file_path": None,
            "file_size": None,
            "downloads": 76,
            "rating": 4.5,
            "reviews_count": 12,
            "is_active": True,
            "created_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Healthy Living for Busy People",
            "description": "Simple, effective strategies for maintaining your health and fitness even with a packed schedule. Includes quick workouts and meal prep ideas.",
            "category": "Health and Fitness eBooks",
            "price": 21.99,
            "cover_image": None,
            "file_path": None,
            "file_size": None,
            "downloads": 156,
            "rating": 4.4,
            "reviews_count": 28,
            "is_active": True,
            "created_at": datetime.utcnow()
        }
    ]
    
    try:
        # Check if products already exist
        existing_count = await db.products.count_documents({})
        if existing_count > 0:
            print(f"❌ {existing_count} products already exist in the database!")
            print("To avoid duplicates, please clear the products collection first.")
            return
        
        # Insert sample products
        result = await db.products.insert_many(sample_products)
        print(f"✅ Successfully added {len(result.inserted_ids)} sample products!")
        
        # Display added products
        print("\n📚 Sample Products Added:")
        for product in sample_products:
            print(f"  • {product['title']} - ${product['price']} ({product['category']})")
        
        print(f"\n🎉 Your eBook marketplace is now ready with sample products!")
        print("🔗 Visit your website to see them in action!")
        
    except Exception as e:
        print(f"❌ Error adding sample products: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(add_sample_products())