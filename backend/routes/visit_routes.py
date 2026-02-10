"""
Visit management endpoints
Record visits, retrieve visit history, sync offline data
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_database
from auth import get_current_user, RoleChecker, check_barangay_access
from models.schemas import Visit, VisitType, DiagnosisType, RiskLevel, ControlStatus, SyncStatus, RoleEnum
from validation import ClinicalValidator
import uuid

router = APIRouter(prefix="/api/visits", tags=["Visits"])

def generate_visit_id() -> str:
    """Generate unique visit ID"""
    timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
    unique_id = str(uuid.uuid4())[:8]
    return f"VISIT-{timestamp}-{unique_id}"

def calculate_risk_level(vitals: dict, diagnosis: str) -> str:
    """Calculate risk level based on vitals and diagnosis"""
    systolic = vitals.get("systolic")
    diastolic = vitals.get("diastolic")
    glucose = vitals.get("glucose")
    glucose_random = _get_random_glucose(vitals)
    glucose_fasting = _get_fasting_glucose(vitals)
    glucose_value = glucose if glucose is not None else (glucose_random if glucose_random is not None else glucose_fasting)
    
    # High risk criteria
    if systolic and systolic >= 180:
        return RiskLevel.VERY_HIGH.value
    if diastolic and diastolic >= 110:
        return RiskLevel.VERY_HIGH.value
    if glucose_value and glucose_value >= 300:
        return RiskLevel.VERY_HIGH.value
    
    # High risk
    if systolic and systolic >= 160:
        return RiskLevel.HIGH.value
    if diastolic and diastolic >= 100:
        return RiskLevel.HIGH.value
    if glucose_value and glucose_value >= 250:
        return RiskLevel.HIGH.value
    
    # Elevated
    if systolic and systolic >= 140:
        return RiskLevel.ELEVATED.value
    if diastolic and diastolic >= 90:
        return RiskLevel.ELEVATED.value
    if glucose_value and glucose_value >= 200:
        return RiskLevel.ELEVATED.value
    
    return RiskLevel.NORMAL.value

def _get_random_glucose(vitals: dict) -> Optional[float]:
    if vitals.get("glucose_random") is not None:
        return vitals.get("glucose_random")
    if vitals.get("glucose") is not None and (vitals.get("glucose_type") or "").lower() == "random":
        return vitals.get("glucose")
    return None


def _get_fasting_glucose(vitals: dict) -> Optional[float]:
    if vitals.get("glucose_fasting") is not None:
        return vitals.get("glucose_fasting")
    if vitals.get("glucose") is not None and (vitals.get("glucose_type") or "").lower() == "fasting":
        return vitals.get("glucose")
    return None


def calculate_control_status(
    vitals: dict,
    diagnosis: Optional[str],
    medications_provided: Optional[bool],
    medications_taken_regularly: Optional[bool],
    has_current_medications: bool
) -> str:
    """Determine if patient's condition is controlled"""
    if medications_provided is not None or medications_taken_regularly is not None:
        if medications_provided is True and medications_taken_regularly is True:
            return ControlStatus.CONTROLLED.value
        if has_current_medications and medications_provided is False:
            return ControlStatus.UNCONTROLLED.value
        if medications_provided is False and medications_taken_regularly is False:
            return ControlStatus.UNASSIGNED.value
        if medications_taken_regularly is False:
            return ControlStatus.UNCONTROLLED.value
        return ControlStatus.UNASSIGNED.value

    systolic = vitals.get("systolic")
    diastolic = vitals.get("diastolic")
    glucose = vitals.get("glucose")
    glucose_random = _get_random_glucose(vitals)
    glucose_fasting = _get_fasting_glucose(vitals)

    diagnosis_value = diagnosis or ""

    if "HTN" in diagnosis_value:
        if systolic and systolic >= 140:
            return ControlStatus.UNCONTROLLED.value
        if diastolic and diastolic >= 90:
            return ControlStatus.UNCONTROLLED.value
    
    if "DM" in diagnosis_value:
        if glucose and glucose >= 200:
            return ControlStatus.UNCONTROLLED.value
        if glucose_random and glucose_random >= 200:
            return ControlStatus.UNCONTROLLED.value
        if glucose_fasting and glucose_fasting >= 126:
            return ControlStatus.UNCONTROLLED.value
    
    return ControlStatus.CONTROLLED.value


def calculate_follow_up_flag(vitals: dict) -> bool:
    systolic = vitals.get("systolic")
    diastolic = vitals.get("diastolic")
    bmi = vitals.get("bmi")
    glucose_random = _get_random_glucose(vitals)
    glucose_fasting = _get_fasting_glucose(vitals)

    if systolic is not None and diastolic is not None:
        if systolic >= 140 and diastolic >= 90:
            return True
    if glucose_random is not None and glucose_random >= 200:
        return True
    if glucose_fasting is not None and glucose_fasting >= 126:
        return True
    if bmi is not None and bmi >= 30:
        return True
    return False

def calculate_next_visit_date(control_status: str, risk_level: str) -> datetime:
    """Calculate recommended next visit date based on control and risk"""
    now = datetime.utcnow()
    
    if control_status == ControlStatus.UNCONTROLLED.value:
        if risk_level == RiskLevel.VERY_HIGH.value:
            return now + timedelta(weeks=1)  # 1 week for very high risk uncontrolled
        elif risk_level == RiskLevel.HIGH.value:
            return now + timedelta(weeks=2)  # 2 weeks for high risk uncontrolled
        else:
            return now + timedelta(weeks=4)  # 4 weeks for uncontrolled
    else:
        return now + timedelta(weeks=12)  # 3 months for controlled

def parse_iso_datetime(value: Optional[object]) -> Optional[datetime]:
    if isinstance(value, str):
        return datetime.fromisoformat(value.replace("Z", "+00:00"))
    if isinstance(value, datetime):
        return value
    return None

@router.post("", status_code=status.HTTP_201_CREATED)
async def record_visit(
    visit_data: dict,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Record a new clinical visit
    
    - Validates vitals and clinical data
    - Auto-calculates risk level and control status
    - Determines next visit date
    - Supports offline sync
    """
    # Check permissions
    allowed_roles = [RoleEnum.BHW, RoleEnum.RHU_NURSE, RoleEnum.ADMIN]
    if current_user["role"] not in [r.value for r in allowed_roles]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to record visits"
        )
    
    # Verify patient exists
    patient_id = visit_data.get("patient_id")
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
    
    # Normalize date fields before validation
    if visit_data.get("visit_date"):
        visit_data["visit_date"] = parse_iso_datetime(visit_data.get("visit_date")) or visit_data.get("visit_date")
    if visit_data.get("next_visit_date"):
        visit_data["next_visit_date"] = parse_iso_datetime(visit_data.get("next_visit_date")) or visit_data.get("next_visit_date")

    # Validate visit data
    validation_errors = ClinicalValidator.validate_complete_visit(visit_data)
    
    # Filter out only errors (not warnings)
    critical_errors = [e for e in validation_errors if e.severity == "error"]
    if critical_errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=[{"field": e.field, "message": e.message, "severity": e.severity} for e in critical_errors]
        )
    
    # Generate visit ID
    visit_id = generate_visit_id()
    
    # Extract vitals
    vitals = visit_data.get("vitals", {})
    
    # Calculate BMI if not provided
    if vitals.get("weight") and vitals.get("height"):
        if not vitals.get("bmi"):
            vitals["bmi"] = round(vitals["weight"] / ((vitals["height"] / 100) ** 2), 1)
    
    # Determine diagnosis from patient conditions or visit data
    diagnosis = visit_data.get("diagnosis")
    if not diagnosis:
        conditions = patient.get("conditions", [])
        if "Hypertension" in conditions and "Diabetes" in conditions:
            diagnosis = DiagnosisType.BOTH.value
        elif "Hypertension" in conditions:
            diagnosis = DiagnosisType.HTN.value
        elif "Diabetes" in conditions:
            diagnosis = DiagnosisType.DM.value
    
    # Auto-calculate risk level
    risk_tier = calculate_risk_level(vitals, diagnosis)
    
    medications_provided = visit_data.get("medications_provided")
    medications_taken_regularly = visit_data.get("medications_taken_regularly")
    has_current_medications = bool(visit_data.get("current_medications") or patient.get("current_medications"))

    # Auto-calculate control status
    control_status = calculate_control_status(
        vitals,
        diagnosis,
        medications_provided,
        medications_taken_regularly,
        has_current_medications
    )

    flagged_for_follow_up = calculate_follow_up_flag(vitals)
    
    # Calculate next visit date if not provided
    next_visit_date = visit_data.get("next_visit_date")
    if not next_visit_date:
        next_visit_date = calculate_next_visit_date(control_status, risk_tier)
        next_visit_reason = "Routine follow-up" if control_status == ControlStatus.CONTROLLED.value else "Monitor uncontrolled condition"
    else:
        next_visit_reason = visit_data.get("next_visit_reason", "Follow-up visit")
    
    # Prepare visit document
    now = datetime.utcnow()
    visit_doc = {
        "visit_id": visit_id,
        "patient_id": patient_id,
        "visit_type": visit_data.get("visit_type", VisitType.FOLLOW_UP.value),
        "visit_date": visit_data.get("visit_date", now),
        "vitals": vitals,
        "diagnosis": diagnosis,
        "risk_tier": risk_tier,
        "control_status": control_status,
        "flagged_for_follow_up": flagged_for_follow_up,
        "current_medications": visit_data.get("current_medications", []),
        "medications_dispensed": visit_data.get("medications_dispensed", []),
        "medications_provided": medications_provided,
        "medications_taken_regularly": medications_taken_regularly,
        "previous_medications": visit_data.get("previous_medications"),
        "new_medication_prescribed": visit_data.get("new_medication_prescribed"),
        "treatment": visit_data.get("treatment"),
        "next_visit_date": next_visit_date,
        "next_visit_reason": next_visit_reason,
        "complications_noted": visit_data.get("complications_noted"),
        "clinical_notes": visit_data.get("clinical_notes"),
        "recorded_by": current_user["user_id"],
        "recorded_by_role": current_user["role"],
        "sync_status": SyncStatus.SYNCED.value,  # Already synced if coming from backend
        "synced_at": now,
        "created_at": now,
        "updated_at": now
    }
    
    # Insert visit
    result = await db.visits.insert_one(visit_doc)
    
    # Update patient's latest data
    await db.patients.update_one(
        {"patient_id": patient_id},
        {
            "$set": {
                "risk_level": risk_tier,
                "flagged_for_follow_up": flagged_for_follow_up,
                "current_medications": visit_data.get("current_medications", patient.get("current_medications", [])),
                "previous_medications": visit_data.get("previous_medications", patient.get("previous_medications")),
                "medications_provided": medications_provided if medications_provided is not None else patient.get("medications_provided"),
                "medications_taken_regularly": medications_taken_regularly if medications_taken_regularly is not None else patient.get("medications_taken_regularly"),
                "updated_at": now,
                "updated_by": current_user["user_id"]
            }
        }
    )
    
    # Log audit
    await db.audit_logs.insert_one({
        "log_id": f"AUDIT-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{visit_id}",
        "action": "create",
        "resource_type": "visit",
        "resource_id": visit_id,
        "user_id": current_user["user_id"],
        "user_role": current_user["role"],
        "timestamp": now,
        "barangay": patient["barangay"]
    })
    
    # Return created visit with warnings
    created_visit = await db.visits.find_one({"_id": result.inserted_id})
    created_visit.pop("_id")
    
    # Include validation warnings
    warnings = [{"field": e.field, "message": e.message} for e in validation_errors if e.severity == "warning"]
    
    return {
        "visit": created_visit,
        "warnings": warnings if warnings else None
    }

@router.get("")
async def list_visits(
    patient_id: Optional[str] = Query(None),
    barangay: Optional[str] = Query(None),
    visit_type: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=1000),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    List visits with filters and pagination
    """
    # Build query
    query = {}
    
    # Barangay access control
    user_role = current_user["role"]
    assigned_barangays = current_user.get("assigned_barangays", [])
    
    if patient_id:
        query["patient_id"] = patient_id
        # Check access to this patient
        patient = await db.patients.find_one({"patient_id": patient_id})
        if patient and not check_barangay_access(current_user, patient["barangay"]):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No access to this patient's data"
            )
    else:
        # Filter by barangay for BHWs and nurses
        if user_role in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
            # Get patients from assigned barangays
            patients_query = {"barangay": {"$in": assigned_barangays}}
            if barangay and barangay in assigned_barangays:
                patients_query = {"barangay": barangay}
            
            patient_ids_cursor = db.patients.find(patients_query, {"patient_id": 1})
            patient_ids = [p["patient_id"] async for p in patient_ids_cursor]
            query["patient_id"] = {"$in": patient_ids}
        elif barangay:
            # Supervisors/admins can filter by any barangay
            patients_query = {"barangay": barangay}
            patient_ids_cursor = db.patients.find(patients_query, {"patient_id": 1})
            patient_ids = [p["patient_id"] async for p in patient_ids_cursor]
            query["patient_id"] = {"$in": patient_ids}
    
    # Apply filters
    if visit_type:
        query["visit_type"] = visit_type
    
    if start_date:
        query["visit_date"] = query.get("visit_date", {})
        query["visit_date"]["$gte"] = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
    
    if end_date:
        query["visit_date"] = query.get("visit_date", {})
        query["visit_date"]["$lte"] = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
    
    # Get total count
    total = await db.visits.count_documents(query)
    
    # Get visits
    cursor = db.visits.find(query).skip(skip).limit(limit).sort("visit_date", -1)
    visits = await cursor.to_list(length=limit)
    
    # Remove MongoDB _id
    for visit in visits:
        visit.pop("_id", None)
    
    return {
        "visits": visits,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.get("/{visit_id}")
async def get_visit(
    visit_id: str,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Get detailed visit information"""
    visit = await db.visits.find_one({"visit_id": visit_id})
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    # Check access
    patient = await db.patients.find_one({"patient_id": visit["patient_id"]})
    if patient and not check_barangay_access(current_user, patient["barangay"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No access to this visit data"
        )
    
    visit.pop("_id", None)
    return visit

@router.post("/bulk-sync")
async def bulk_sync_visits(
    visits_data: object,
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Bulk upload visits from offline queue
    
    - Processes multiple visits at once
    - Handles conflict resolution
    - Returns sync results
    """
    results = {
        "success": [],
        "errors": [],
        "conflicts": []
    }
    
    # Accept both raw arrays and { visits: [...] } payloads
    if isinstance(visits_data, dict) and "visits" in visits_data:
        visits_list = visits_data.get("visits") or []
    else:
        visits_list = visits_data or []

    for visit_data in visits_list:
        try:
            # Check if visit already exists (by visit_id or timestamp+patient combination)
            existing_visit = None
            if visit_data.get("visit_id"):
                existing_visit = await db.visits.find_one({"visit_id": visit_data["visit_id"]})
            
            if existing_visit:
                # Conflict detected
                results["conflicts"].append({
                    "visit_id": visit_data.get("visit_id"),
                    "patient_id": visit_data.get("patient_id"),
                    "reason": "Visit already exists",
                    "existing_data": existing_visit
                })
                continue
            
            # Process visit (similar to record_visit but from offline data)
            patient_id = visit_data.get("patient_id")
            patient = await db.patients.find_one({"patient_id": patient_id})
            
            if not patient:
                results["errors"].append({
                    "visit_data": visit_data,
                    "error": "Patient not found"
                })
                continue

            if not check_barangay_access(current_user, patient["barangay"]):
                results["errors"].append({
                    "visit_data": visit_data,
                    "error": "No access to this patient's data"
                })
                continue
            
            # Normalize date fields
            if visit_data.get("visit_date"):
                visit_data["visit_date"] = parse_iso_datetime(visit_data.get("visit_date")) or visit_data.get("visit_date")
            if visit_data.get("next_visit_date"):
                visit_data["next_visit_date"] = parse_iso_datetime(visit_data.get("next_visit_date")) or visit_data.get("next_visit_date")

            # Generate new visit ID if not present
            if not visit_data.get("visit_id"):
                visit_data["visit_id"] = generate_visit_id()
            
            # Fill derived fields if missing
            vitals = visit_data.get("vitals", {})
            diagnosis = visit_data.get("diagnosis")
            if not diagnosis:
                conditions = patient.get("conditions", [])
                if "Hypertension" in conditions and "Diabetes" in conditions:
                    diagnosis = DiagnosisType.BOTH.value
                elif "Hypertension" in conditions:
                    diagnosis = DiagnosisType.HTN.value
                elif "Diabetes" in conditions:
                    diagnosis = DiagnosisType.DM.value
                visit_data["diagnosis"] = diagnosis

            if not visit_data.get("risk_tier"):
                visit_data["risk_tier"] = calculate_risk_level(vitals, diagnosis)

            if vitals.get("weight") and vitals.get("height") and not vitals.get("bmi"):
                vitals["bmi"] = round(vitals["weight"] / ((vitals["height"] / 100) ** 2), 1)

            has_current_medications = bool(visit_data.get("current_medications") or patient.get("current_medications"))
            if not visit_data.get("control_status"):
                visit_data["control_status"] = calculate_control_status(
                    vitals,
                    diagnosis,
                    visit_data.get("medications_provided"),
                    visit_data.get("medications_taken_regularly"),
                    has_current_medications
                )

            if visit_data.get("flagged_for_follow_up") is None:
                visit_data["flagged_for_follow_up"] = calculate_follow_up_flag(vitals)

            if not visit_data.get("next_visit_date"):
                visit_data["next_visit_date"] = calculate_next_visit_date(
                    visit_data["control_status"],
                    visit_data["risk_tier"]
                )
                visit_data["next_visit_reason"] = visit_data.get(
                    "next_visit_reason",
                    "Routine follow-up" if visit_data["control_status"] == ControlStatus.CONTROLLED.value else "Monitor uncontrolled condition"
                )

            # Mark as synced
            visit_data["sync_status"] = SyncStatus.SYNCED.value
            visit_data["synced_at"] = datetime.utcnow()
            
            # Insert visit
            await db.visits.insert_one(visit_data)
            
            results["success"].append({
                "visit_id": visit_data["visit_id"],
                "patient_id": patient_id
            })

            # Update patient risk level
            await db.patients.update_one(
                {"patient_id": patient_id},
                {"$set": {
                    "risk_level": visit_data.get("risk_tier"),
                    "flagged_for_follow_up": visit_data.get("flagged_for_follow_up"),
                    "current_medications": visit_data.get("current_medications", patient.get("current_medications", [])),
                    "previous_medications": visit_data.get("previous_medications", patient.get("previous_medications")),
                    "medications_provided": visit_data.get("medications_provided", patient.get("medications_provided")),
                    "medications_taken_regularly": visit_data.get("medications_taken_regularly", patient.get("medications_taken_regularly")),
                    "updated_at": datetime.utcnow()
                }}
            )
            
        except Exception as e:
            results["errors"].append({
                "visit_data": visit_data,
                "error": str(e)
            })
    
    return results
