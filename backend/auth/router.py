"""
Auth router — /auth/register and /auth/login
"""

from fastapi import APIRouter, HTTPException, status
from bson import ObjectId

from db.mongo import get_db
from auth.models import RegisterRequest, LoginRequest, TokenResponse
from auth.utils import hash_password, verify_password, create_access_token
from profile.service import create_initial_profile

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterRequest):
    db = get_db()

    # Check duplicate email
    if await db.users.find_one({"email": payload.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    user_doc = {
        "email": payload.email,
        "name": payload.name,
        "password_hash": hash_password(payload.password),
    }
    result = await db.users.insert_one(user_doc)
    user_id = str(result.inserted_id)

    # Create empty profile
    await create_initial_profile(user_id)

    token = create_access_token(user_id, payload.email)
    return TokenResponse(access_token=token, user_id=user_id, email=payload.email, name=payload.name)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": payload.email})

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    user_id = str(user["_id"])
    token = create_access_token(user_id, payload.email)
    return TokenResponse(access_token=token, user_id=user_id, email=payload.email, name=user["name"])
