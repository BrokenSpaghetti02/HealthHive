"""
Patient management endpoints
Register, list, retrieve, update patients
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from database import get_database
from config import settings
from auth import get_current_user, RoleChecker, check_barangay_access
from models.schemas import Patient, RoleEnum, ConsentRecord
from validation import ClinicalValidator, ValidationError
import re
import uuid

router = APIRouter(prefix="/api/patients", tags=["Patients"])

def generate_patient_id(barangay: str, count: int) -> str:
    """Generate unique patient ID: JAG-XXXXXX"""
    return f"JAG-{count + 1:06d}"

def normalize_conditions(conditions: List[str]) -> List[str]:
    """Normalize condition labels to HTN/DM tags for UI compatibility"""
    normalized = set()
    for condition in conditions or []:
        if condition in ["Hypertension", "HTN"]:
            normalized.add("HTN")
        if condition in ["Diabetes", "Diabetes Mellitus Type 2", "DM"]:
            normalized.add("DM")
    return sorted(normalized)

@router.post("", status_code=status.HTTP_201_CREATED)
async def register_patient(
    patient_data: dict,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Register a new patient
    
    - Requires BHW, RHU_NURSE, or ADMIN role
    - Validates required fields
    - Checks for duplicates
    - Generates unique patient ID
    - Records consent
    """
    # Check role permissions
    allowed_roles = [RoleEnum.BHW, RoleEnum.RHU_NURSE, RoleEnum.ADMIN]
    if current_user["role"] not in [r.value for r in allowed_roles]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to register patients"
        )
    
    # Check barangay access
    barangay = patient_data.get("barangay")
    if not check_barangay_access(current_user, barangay):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"No access to barangay: {barangay}"
        )
    
    # Validate required fields
    required_fields = ["first_name", "last_name", "date_of_birth", "age", "sex", "barangay", "address"]
    validation_errors = ClinicalValidator.validate_required_fields(patient_data, required_fields)
    
    if validation_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=[{"field": e.field, "message": e.message} for e in validation_errors]
        )
    
    # Check for potential duplicates
    existing_patient = await db.patients.find_one({
        "first_name": patient_data["first_name"],
        "last_name": patient_data["last_name"],
        "date_of_birth": patient_data["date_of_birth"],
        "barangay": barangay
    })
    
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Patient with same name, date of birth, and barangay already exists. Check for duplicates."
        )
    
    # Generate patient ID
    patient_count = await db.patients.count_documents({})
    patient_id = generate_patient_id(barangay, patient_count)
    
    # Prepare patient document
    now = datetime.utcnow()
    patient_doc = {
        "patient_id": patient_id,
        "first_name": patient_data["first_name"],
        "middle_name": patient_data.get("middle_name"),
        "last_name": patient_data["last_name"],
        "date_of_birth": patient_data["date_of_birth"],
        "age": patient_data["age"],
        "sex": patient_data["sex"],
        "barangay": barangay,
        "purok": patient_data.get("purok"),
        "address": patient_data["address"],
        "contact": patient_data.get("contact"),
        "occupation": patient_data.get("occupation"),
        "education": patient_data.get("education"),
        "marital_status": patient_data.get("marital_status"),
        "conditions": patient_data.get("conditions", []),
        "risk_level": patient_data.get("risk_level"),
        "consent_records": [],
        "created_at": now,
        "created_by": current_user["user_id"],
        "updated_at": now,
        "updated_by": current_user["user_id"],
        "is_active": True
    }
    
    # Add consent record if provided
    if patient_data.get("consent_given"):
        consent = {
            "consent_type": "data_collection",
            "status": True,
            "timestamp": now,
            "recorded_by": current_user["user_id"]
        }
        patient_doc["consent_records"].append(consent)
    
    # Insert patient
    result = await db.patients.insert_one(patient_doc)
    
    # Log audit with UUID to prevent collisions
    audit_id = f"AUDIT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8]}"
    await db.audit_logs.insert_one({
        "log_id": audit_id,
        "action": "create",
        "resource_type": "patient",
        "resource_id": patient_id,
        "user_id": current_user["user_id"],
        "user_role": current_user["role"],
        "timestamp": now,
        "barangay": barangay
    })
    
    # Return created patient
    created_patient = await db.patients.find_one({"_id": result.inserted_id})
    created_patient.pop("_id")
    
    return created_patient

@router.get("")
async def list_patients(
    barangay: Optional[str] = Query(None),
    condition: Optional[str] = Query(None, description="HTN, DM, or HTN+DM"),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None, description="Search by name or patient ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    List patients with filters and pagination
    
    - BHWs/RHU nurses see only their assigned barangays
    - Supervisors/admins see all
    - Supports search, filtering, and pagination
    """
    # Build query based on user permissions
    query = {"is_active": True}
    
    # Barangay access control
    user_role = current_user["role"]
    if user_role in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        # Restrict to assigned barangays
        assigned_barangays = current_user.get("assigned_barangays", [])
        if barangay:
            if barangay not in assigned_barangays:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"No access to barangay: {barangay}"
                )
            query["barangay"] = barangay
        else:
            query["barangay"] = {"$in": assigned_barangays}
    else:
        # Supervisors/admins can filter by any barangay
        if barangay:
            query["barangay"] = barangay
    
    # Apply filters
    if condition:
        if condition == "HTN":
            query["conditions"] = {"$in": ["Hypertension", "HTN"]}
        elif condition == "DM":
            query["conditions"] = {"$in": ["Diabetes", "Diabetes Mellitus Type 2", "DM"]}
        elif condition in ["HTN+DM", "DM+HTN"]:
            query["$and"] = [
                {"conditions": {"$in": ["Hypertension", "HTN"]}},
                {"conditions": {"$in": ["Diabetes", "Diabetes Mellitus Type 2", "DM"]}}
            ]
        else:
            query["conditions"] = {"$in": [condition]}
    
    if risk_level:
        query["risk_level"] = risk_level
    
    # Apply search
    if search:
        # Search by patient ID or name
        search_pattern = {"$regex": search, "$options": "i"}
        query["$or"] = [
            {"patient_id": search_pattern},
            {"first_name": search_pattern},
            {"last_name": search_pattern}
        ]
    
    # Get total count
    total = await db.patients.count_documents(query)
    
    # Get patients
    cursor = db.patients.find(query).skip(skip).limit(limit).sort("created_at", -1)
    patients = await cursor.to_list(length=limit)

    # Fetch latest visit per patient for list enrichment
    patient_ids = [p["patient_id"] for p in patients]
    latest_visit_by_patient = {}
    if patient_ids:
        if settings.DB_MODE.lower() == "embedded":
            visits = await db.visits.find({"patient_id": {"$in": patient_ids}}).to_list(length=100000)
            for visit in visits:
                pid = visit.get("patient_id")
                if not pid:
                    continue
                current = latest_visit_by_patient.get(pid)
                if not current or (visit.get("visit_date") and visit["visit_date"] > current.get("visit_date")):
                    latest_visit_by_patient[pid] = visit
        else:
            latest_pipeline = [
                {"$match": {"patient_id": {"$in": patient_ids}}},
                {"$sort": {"visit_date": -1}},
                {"$group": {"_id": "$patient_id", "latest_visit": {"$first": "$$ROOT"}}}
            ]
            latest_visits = await db.visits.aggregate(latest_pipeline).to_list(length=10000)
            latest_visit_by_patient = {v["_id"]: v["latest_visit"] for v in latest_visits}
    
    # Remove MongoDB _id and enrich fields
    for patient in patients:
        latest_visit = latest_visit_by_patient.get(patient["patient_id"])
        patient["conditions"] = normalize_conditions(patient.get("conditions", []))
        patient["last_visit_date"] = latest_visit.get("visit_date") if latest_visit else None
        patient["next_visit_date"] = latest_visit.get("next_visit_date") if latest_visit else None
        if latest_visit and latest_visit.get("control_status"):
            patient["control_status"] = latest_visit.get("control_status")
        else:
            patient["control_status"] = "N/A" if not patient["conditions"] else "Unknown"
        vitals = latest_visit.get("vitals", {}) if latest_visit else {}
        if vitals.get("systolic") and vitals.get("diastolic"):
            patient["latest_bp"] = f"{vitals.get('systolic')}/{vitals.get('diastolic')}"
        if vitals.get("glucose"):
            patient["latest_glucose"] = vitals.get("glucose")
        patient.pop("_id", None)
    
    return {
        "patients": patients,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{patient_id}")
async def get_patient(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get detailed patient information
    """
    patient = await db.patients.find_one({"patient_id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check barangay access
    if not check_barangay_access(current_user, patient["barangay"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this patient's data"
        )
    
    patient["conditions"] = normalize_conditions(patient.get("conditions", []))
    patient.pop("_id", None)
    
    # Log audit
    await db.audit_logs.insert_one({
        "log_id": f"AUDIT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{patient_id}",
        "action": "view",
        "resource_type": "patient",
        "resource_id": patient_id,
        "user_id": current_user["user_id"],
        "user_role": current_user["role"],
        "timestamp": datetime.utcnow(),
        "barangay": patient["barangay"]
    })
    
    return patient

@router.put("/{patient_id}")
async def update_patient(
    patient_id: str,
    update_data: dict,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Update patient information
    """
    # Get existing patient
    patient = await db.patients.find_one({"patient_id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check barangay access
    if not check_barangay_access(current_user, patient["barangay"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this patient's data"
        )
    
    # Prepare update
    update_data["updated_at"] = datetime.utcnow()
    update_data["updated_by"] = current_user["user_id"]
    
    # Track changes for audit
    changes = {k: {"old": patient.get(k), "new": v} for k, v in update_data.items() if patient.get(k) != v}
    
    # Update patient
    await db.patients.update_one(
        {"patient_id": patient_id},
        {"$set": update_data}
    )
    
    # Log audit
    await db.audit_logs.insert_one({
        "log_id": f"AUDIT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{patient_id}",
        "action": "update",
        "resource_type": "patient",
        "resource_id": patient_id,
        "user_id": current_user["user_id"],
        "user_role": current_user["role"],
        "timestamp": datetime.utcnow(),
        "changes_made": changes,
        "barangay": patient["barangay"]
    })
    
    # Return updated patient
    updated_patient = await db.patients.find_one({"patient_id": patient_id})
    updated_patient.pop("_id", None)
    
    return updated_patient

@router.get("/{patient_id}/visits")
async def get_patient_visits(
    patient_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get visit history for a patient
    """
    # Check patient exists and access
    patient = await db.patients.find_one({"patient_id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    if not check_barangay_access(current_user, patient["barangay"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this patient's data"
        )
    
    # Get visits
    total = await db.visits.count_documents({"patient_id": patient_id})
    cursor = db.visits.find({"patient_id": patient_id}).skip(skip).limit(limit).sort("visit_date", -1)
    visits = await cursor.to_list(length=limit)
    
    for visit in visits:
        visit.pop("_id", None)
    
    return {
        "patient_id": patient_id,
        "visits": visits,
        "total": total
    }

@router.get("/{patient_id}/history")
async def get_patient_clinical_history(
    patient_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Get comprehensive clinical history with trends
    """
    # Check access
    patient = await db.patients.find_one({"patient_id": patient_id})
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    if not check_barangay_access(current_user, patient["barangay"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this patient's data"
        )
    
    # Get all visits
    cursor = db.visits.find({"patient_id": patient_id}).sort("visit_date", 1)
    visits = await cursor.to_list(length=1000)
    
    # Extract trends
    bp_readings = []
    glucose_readings = []
    weight_readings = []
    
    for visit in visits:
        vitals = visit.get("vitals", {})
        visit_date = visit.get("visit_date")
        
        if vitals.get("systolic") and vitals.get("diastolic"):
            bp_readings.append({
                "date": visit_date,
                "systolic": vitals["systolic"],
                "diastolic": vitals["diastolic"]
            })
        
        if vitals.get("glucose"):
            glucose_readings.append({
                "date": visit_date,
                "glucose": vitals["glucose"],
                "type": vitals.get("glucose_type")
            })
        
        if vitals.get("weight"):
            weight_readings.append({
                "date": visit_date,
                "weight": vitals["weight"],
                "bmi": vitals.get("bmi")
            })
    
    return {
        "patient_id": patient_id,
        "patient_name": f"{patient['first_name']} {patient['last_name']}",
        "total_visits": len(visits),
        "bp_trend": bp_readings,
        "glucose_trend": glucose_readings,
        "weight_trend": weight_readings,
        "latest_diagnosis": visits[-1].get("diagnosis") if visits else None,
        "latest_risk_level": visits[-1].get("risk_tier") if visits else None
    }
