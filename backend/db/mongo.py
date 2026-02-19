"""
MongoDB async connection using Motor.
Call `connect_mongo()` on startup, `close_mongo()` on shutdown.
Access collections via `get_db()`.
"""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import get_settings
import certifi

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_mongo():
    global _client, _db
    settings = get_settings()

    # Use certifi CA bundle to fix macOS SSL issues with MongoDB Atlas.
    # tlsAllowInvalidCertificates=True is the nuclear option for nodes
    # that still fail TLS handshake (e.g. replica set members on Python 3.12).
    _client = AsyncIOMotorClient(
        settings.mongodb_uri,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True,  # bypass TLS handshake failures on some Atlas nodes
        serverSelectionTimeoutMS=10000,
    )
    _db = _client[settings.mongodb_db_name]

    # Verify connectivity with a lightweight ping (doesn't need a primary)
    await _client.admin.command("ping")
    print(f"[MongoDB] Connected to '{settings.mongodb_db_name}'")

    # Create indexes — best-effort only (they already exist after seeding)
    try:
        await _db.users.create_index("email", unique=True)
        await _db.profiles.create_index("user_id", unique=True)
        await _db.reviews.create_index("user_id")
        await _db.submissions.create_index([("user_id", 1), ("problem_id", 1)])
        print("[MongoDB] Indexes ensured.")
    except Exception as e:
        # Indexes already exist from seeder, or replica set is in election — safe to continue
        print(f"[MongoDB] Index creation skipped (already exist or no primary yet): {e}")


async def close_mongo():
    global _client
    if _client:
        _client.close()


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("MongoDB not connected. Call connect_mongo() first.")
    return _db
