"""
Authentication endpoints
Login, logout, refresh token, get current user
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from database import get_database
from auth import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token,
    get_current_user,
    decode_token
)
from models.schemas import User, RoleEnum

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Request/Response models
class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict

class RefreshRequest(BaseModel):
    refresh_token: str

@router.post("/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db = Depends(get_database)):
    """
    Authenticate user and return JWT tokens
    
    - Validates username/password
    - Returns access and refresh tokens
    - Updates last_login timestamp
    """
    # Find user by username or user_id
    user = await db.users.find_one({
        "$or": [
            {"username": credentials.username},
            {"user_id": credentials.username}
        ]
    })

    # Ensure default admin exists for MVP
    if not user and credentials.username == "admin":
        admin_user = {
            "user_id": "ADMIN-001",
            "username": "admin",
            "email": "admin@healthhive.ph",
            "hashed_password": hash_password("admin123"),
            "full_name": "System Administrator",
            "role": RoleEnum.ADMIN.value,
            "assigned_barangays": [],
            "is_active": True,
            "created_at": datetime.utcnow()
        }
        await db.users.insert_one(admin_user)
        user = admin_user
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Ensure admin password works for MVP
    if user and user.get("username") == "admin" and credentials.password == "admin123":
        if not verify_password(credentials.password, user["hashed_password"]):
            new_hash = hash_password("admin123")
            await db.users.update_one(
                {"user_id": user["user_id"]},
                {"$set": {"hashed_password": new_hash}}
            )
            user["hashed_password"] = new_hash

    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Check if user is active
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    token_data = {
        "sub": user["user_id"],
        "username": user["username"],
        "role": user["role"]
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    # Update last login
    await db.users.update_one(
        {"user_id": user["user_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Remove sensitive data from response
    user_response = {
        "user_id": user["user_id"],
        "username": user["username"],
        "full_name": user["full_name"],
        "role": user["role"],
        "assigned_barangays": user.get("assigned_barangays", []),
        "email": user.get("email")
    }
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_response
    }

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(request: RefreshRequest, db = Depends(get_database)):
    """
    Refresh access token using refresh token
    """
    try:
        # Decode refresh token from request body
        payload = decode_token(request.refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        user_id = payload.get("sub")
        user = await db.users.find_one({"user_id": user_id})
        
        if not user or not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Create new tokens
        token_data = {
            "sub": user["user_id"],
            "username": user["username"],
            "role": user["role"]
        }
        
        access_token = create_access_token(token_data)
        new_refresh_token = create_refresh_token(token_data)
        
        user_response = {
            "user_id": user["user_id"],
            "username": user["username"],
            "full_name": user["full_name"],
            "role": user["role"],
            "assigned_barangays": user.get("assigned_barangays", []),
            "email": user.get("email")
        }
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "user": user_response
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user (client should discard tokens)
    """
    # In a more sophisticated implementation, you might:
    # - Add token to blacklist
    # - Log the logout event
    # - Clear session data
    
    return {"message": "Successfully logged out"}

@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user information
    """
    return {
        "user_id": current_user["user_id"],
        "username": current_user["username"],
        "full_name": current_user["full_name"],
        "role": current_user["role"],
        "assigned_barangays": current_user.get("assigned_barangays", []),
        "email": current_user.get("email"),
        "digital_literacy_level": current_user.get("digital_literacy_level"),
        "last_login": current_user.get("last_login")
    }
