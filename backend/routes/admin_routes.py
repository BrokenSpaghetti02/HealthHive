"""
Admin endpoints for user management and audit logs.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime
from database import get_database
from auth import get_current_user
from models.schemas import RoleEnum

router = APIRouter(prefix="/api/admin", tags=["Admin"])

def require_admin(user: dict):
    if user.get("role") not in [RoleEnum.ADMIN.value, RoleEnum.SUPERVISOR.value]:
        raise HTTPException(status_code=403, detail="Admin access required")

@router.get("/users")
async def list_users(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    require_admin(current_user)
    users = await db.users.find({}).to_list(length=1000)
    return {
        "users": [
            {
                "user_id": u.get("user_id"),
                "name": u.get("full_name"),
                "role": u.get("role"),
                "status": "Active" if u.get("is_active") else "Inactive",
                "last_login": u.get("last_login"),
                "email": u.get("email")
            }
            for u in users
        ]
    }

@router.get("/audit-logs")
async def list_audit_logs(
    limit: int = Query(25, ge=1, le=200),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    require_admin(current_user)
    logs = await db.audit_logs.find({}).sort("timestamp", -1).to_list(length=limit)
    return {
        "logs": [
            {
                "time": log.get("timestamp"),
                "user": log.get("user_id"),
                "action": log.get("action"),
                "resource": log.get("resource_type"),
                "resource_id": log.get("resource_id"),
                "status": "Success"
            }
            for log in logs
        ]
    }

@router.get("/summary")
async def admin_summary(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    require_admin(current_user)
    active_users = await db.users.count_documents({"is_active": True})
    barangays = await db.barangays.count_documents({})
    medications = len(set([
        med.get("name")
        for visit in await db.visits.find({}).to_list(length=100000)
        for med in visit.get("medications_dispensed", [])
        if med.get("name")
    ]))
    last_sync = datetime.utcnow()
    return {
        "active_users": active_users,
        "barangays": barangays,
        "medications": medications,
        "last_sync": last_sync
    }
