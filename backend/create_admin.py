#!/usr/bin/env python3
"""
Script to create an admin user for the eBook marketplace
"""
import asyncio
import os
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from dotenv import load_dotenv
import uuid

# Add the backend directory to Python path
backend_dir = Path(__file__).parent
sys.path.insert(0, str(backend_dir))

# Load environment variables
load_dotenv(backend_dir / '.env')

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_admin_user():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    # Admin user details
    admin_email = "admin@ebookstore.com"
    admin_password = "admin123"  # Change this to a secure password
    admin_name = "Admin User"
    
    try:
        # Check if admin already exists
        existing_admin = await db.users.find_one({"email": admin_email})
        if existing_admin:
            print(f"❌ Admin user with email {admin_email} already exists!")
            return
        
        # Create admin user
        hashed_password = pwd_context.hash(admin_password)
        admin_user = {
            "id": str(uuid.uuid4()),
            "email": admin_email,
            "full_name": admin_name,
            "hashed_password": hashed_password,
            "is_active": True,
            "is_admin": True,
            "created_at": "2024-01-01T00:00:00"
        }
        
        await db.users.insert_one(admin_user)
        print("✅ Admin user created successfully!")
        print(f"📧 Email: {admin_email}")
        print(f"🔑 Password: {admin_password}")
        print("\n⚠️  Please change the password after first login!")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(create_admin_user())