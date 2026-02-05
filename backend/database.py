"""
Database configuration and connection management
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from datetime import datetime
import anyio
import os
from mongita import MongitaClientDisk
from config import settings

class AsyncCursorWrapper:
    def __init__(self, cursor):
        self._cursor = cursor

    def skip(self, count: int):
        self._cursor = self._cursor.skip(count)
        return self

    def limit(self, count: int):
        self._cursor = self._cursor.limit(count)
        return self

    def sort(self, *args, **kwargs):
        self._cursor = self._cursor.sort(*args, **kwargs)
        return self

    async def to_list(self, length: Optional[int] = None):
        def _collect():
            if length is None:
                return list(self._cursor)
            return list(self._cursor.limit(length))
        return await anyio.to_thread.run_sync(_collect)

    def __aiter__(self):
        async def generator():
            items = await self.to_list()
            for item in items:
                yield item
        return generator()

class AsyncCollectionWrapper:
    def __init__(self, collection):
        self._collection = collection

    async def find_one(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.find_one(*args, **kwargs))

    def find(self, *args, **kwargs):
        if settings.DB_MODE.lower() == "embedded":
            if len(args) >= 2 and isinstance(args[1], dict):
                args = list(args)
                args.pop(1)
            kwargs.pop("projection", None)
            return AsyncCursorWrapper(self._collection.find(*args, **kwargs))
        if len(args) >= 2 and isinstance(args[1], dict):
            args = list(args)
            kwargs = {**kwargs, "projection": args[1]}
            args.pop(1)
        return AsyncCursorWrapper(self._collection.find(*args, **kwargs))

    def aggregate(self, *args, **kwargs):
        return AsyncCursorWrapper(self._collection.aggregate(*args, **kwargs))

    async def insert_one(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.insert_one(*args, **kwargs))

    async def insert_many(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.insert_many(*args, **kwargs))

    async def update_one(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.update_one(*args, **kwargs))

    async def delete_many(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.delete_many(*args, **kwargs))

    async def count_documents(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.count_documents(*args, **kwargs))

    async def create_index(self, *args, **kwargs):
        return await anyio.to_thread.run_sync(lambda: self._collection.create_index(*args, **kwargs))

class AsyncDatabaseWrapper:
    def __init__(self, db):
        self._db = db

    def __getattr__(self, name: str):
        return AsyncCollectionWrapper(self._db[name])

    def __getitem__(self, name: str):
        return AsyncCollectionWrapper(self._db[name])

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

# Initialize database connection
async def connect_to_mongo():
    """Establish connection to MongoDB"""
    try:
        if settings.DB_MODE.lower() == "embedded":
            db_dir = os.path.join(os.path.dirname(__file__), ".mongita")
            os.makedirs(db_dir, exist_ok=True)
            Database.client = MongitaClientDisk(db_dir)
            Database.db = AsyncDatabaseWrapper(Database.client[settings.DATABASE_NAME])
            await create_indexes()
            print("✓ Connected to embedded database (Mongita)")
            print(f"✓ Using database: {settings.DATABASE_NAME}")
            return

        Database.client = AsyncIOMotorClient(settings.MONGODB_URL)
        Database.db = Database.client[settings.DATABASE_NAME]

        # Verify connection
        await Database.client.admin.command('ping')

        # Create indexes for performance
        await create_indexes()

        print(f"✓ Connected to MongoDB at {settings.MONGODB_URL}")
        print(f"✓ Using database: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"✗ Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close MongoDB connection"""
    if Database.client and settings.DB_MODE.lower() != "embedded":
        Database.client.close()
        print("Closed MongoDB connection")

async def create_indexes():
    """Create database indexes for optimal query performance"""
    db = Database.db

    async def safe_create_index(collection, *args, **kwargs):
        if settings.DB_MODE.lower() == "embedded":
            kwargs = {}
            if args and isinstance(args[0], (list, tuple)) and args[0] and isinstance(args[0][0], (list, tuple)):
                return None
        return await collection.create_index(*args, **kwargs)
    
    # Patient indexes
    await safe_create_index(db.patients, "patient_id", unique=True)
    await safe_create_index(db.patients, "barangay")
    await safe_create_index(db.patients, [("first_name", 1), ("last_name", 1)])
    await safe_create_index(db.patients, "conditions")
    await safe_create_index(db.patients, "risk_level")
    await safe_create_index(db.patients, "created_at")
    
    # Visit indexes
    await safe_create_index(db.visits, "visit_id", unique=True)
    await safe_create_index(db.visits, "patient_id")
    await safe_create_index(db.visits, "visit_date")
    await safe_create_index(db.visits, "sync_status")
    await safe_create_index(db.visits, [("patient_id", 1), ("visit_date", -1)])
    
    # User indexes
    await safe_create_index(db.users, "user_id", unique=True)
    await safe_create_index(db.users, "username", unique=True)
    await safe_create_index(db.users, "email", unique=True, sparse=True)
    await safe_create_index(db.users, "role")
    await safe_create_index(db.users, "assigned_barangays")
    
    # Barangay indexes
    await safe_create_index(db.barangays, "barangay_id", unique=True)
    await safe_create_index(db.barangays, "name", unique=True)
    await safe_create_index(db.barangays, "cluster")
    
    # Medication stock indexes
    await safe_create_index(db.medication_stock, "medication_id", unique=True)
    await safe_create_index(db.medication_stock, "name")
    await safe_create_index(db.medication_stock, "medicine_type")
    
    # Education session indexes
    await safe_create_index(db.education_sessions, "session_id", unique=True)
    await safe_create_index(db.education_sessions, "barangay")
    await safe_create_index(db.education_sessions, "session_date")
    
    # Sync queue indexes
    await safe_create_index(db.sync_queue, "queue_id", unique=True)
    await safe_create_index(db.sync_queue, "sync_status")
    await safe_create_index(db.sync_queue, "created_by")
    await safe_create_index(db.sync_queue, "created_at")
    
    # Audit log indexes
    await safe_create_index(db.audit_logs, "log_id", unique=True)
    await safe_create_index(db.audit_logs, "user_id")
    await safe_create_index(db.audit_logs, "resource_type")
    await safe_create_index(db.audit_logs, "resource_id")
    await safe_create_index(db.audit_logs, "timestamp")
    await safe_create_index(db.audit_logs, "action")
    
    print("Database indexes created successfully")

def get_database():
    """Dependency for getting database instance"""
    return Database.db
