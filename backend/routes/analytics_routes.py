"""
Analytics and Dashboard endpoints
Overview stats, HTN/DM trends, cohort retention, barangay summaries
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, List
from datetime import datetime, timedelta
from collections import defaultdict
from database import get_database
from config import settings
from auth import get_current_user, check_barangay_access
from models.schemas import RoleEnum, DiagnosisType, ControlStatus

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

def build_patient_query(current_user: dict, barangay: Optional[str] = None) -> dict:
    query = {"is_active": True}
    if barangay:
        if not check_barangay_access(current_user, barangay):
            raise HTTPException(status_code=403, detail="No access to this barangay")
        query["barangay"] = barangay
        return query
    if current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
    return query

async def get_patient_ids(db, patient_query: dict) -> list[str]:
    cursor = db.patients.find(patient_query, {"patient_id": 1})
    return [p["patient_id"] async for p in cursor]

async def get_latest_visits(db, patient_ids: list[str]) -> Dict[str, dict]:
    if not patient_ids:
        return {}
    if settings.DB_MODE.lower() == "embedded":
        visits = await db.visits.find({"patient_id": {"$in": patient_ids}}).to_list(length=100000)
        latest_by_patient: Dict[str, dict] = {}
        for visit in visits:
            pid = visit.get("patient_id")
            if not pid:
                continue
            current = latest_by_patient.get(pid)
            if not current or (visit.get("visit_date") and visit["visit_date"] > current.get("visit_date")):
                latest_by_patient[pid] = visit
        return latest_by_patient
    pipeline = [
        {"$match": {"patient_id": {"$in": patient_ids}}},
        {"$sort": {"visit_date": -1}},
        {"$group": {"_id": "$patient_id", "latest_visit": {"$first": "$$ROOT"}}}
    ]
    latest_visits = await db.visits.aggregate(pipeline).to_list(length=100000)
    return {v["_id"]: v["latest_visit"] for v in latest_visits}

@router.get("/overview")
async def get_overview(
    barangay: Optional[str] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Municipality-wide chronic disease snapshot
    - Total patients, active cases
    - HTN/DM breakdown
    - Control rates
    - Monthly screenings
    - Overdue follow-ups
    - Data completeness
    """
    # Build patient query based on access
    patient_query = {"is_active": True}
    
    if barangay:
        if not check_barangay_access(current_user, barangay):
            raise HTTPException(status_code=403, detail="No access to this barangay")
        patient_query["barangay"] = barangay
    elif current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
    
    # Total patients
    total_patients = await db.patients.count_documents(patient_query)
    
    # HTN/DM breakdown
    htn_query = patient_query.copy()
    htn_query["conditions"] = {"$in": ["Hypertension", "HTN"]}
    total_htn = await db.patients.count_documents(htn_query)
    
    dm_query = patient_query.copy()
    dm_query["conditions"] = {"$in": ["Diabetes", "Diabetes Mellitus Type 2", "DM"]}
    total_dm = await db.patients.count_documents(dm_query)
    
    both_query = patient_query.copy()
    both_query["$and"] = [
        {"conditions": {"$in": ["Hypertension", "HTN"]}},
        {"conditions": {"$in": ["Diabetes", "Diabetes Mellitus Type 2", "DM"]}}
    ]
    total_both = await db.patients.count_documents(both_query)
    
    # Get patient IDs for visit queries
    patient_ids_cursor = db.patients.find(patient_query, {"patient_id": 1})
    patient_ids = [p["patient_id"] async for p in patient_ids_cursor]
    
    # Recent visits (this month)
    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    monthly_visits_query = {
        "patient_id": {"$in": patient_ids},
        "visit_date": {"$gte": month_start}
    }
    monthly_screenings = await db.visits.count_documents(monthly_visits_query)
    
    # Control rates (get latest visit for each patient)
    latest_visits = []
    if settings.DB_MODE.lower() == "embedded":
        visits = await db.visits.find({"patient_id": {"$in": patient_ids}}).to_list(length=100000)
        latest_by_patient = {}
        for visit in visits:
            pid = visit.get("patient_id")
            if not pid:
                continue
            current = latest_by_patient.get(pid)
            if not current or (visit.get("visit_date") and visit["visit_date"] > current.get("visit_date")):
                latest_by_patient[pid] = visit
        latest_visits = [{"latest_visit": v} for v in latest_by_patient.values()]
    else:
        pipeline = [
            {"$match": {"patient_id": {"$in": patient_ids}}},
            {"$sort": {"visit_date": -1}},
            {"$group": {
                "_id": "$patient_id",
                "latest_visit": {"$first": "$$ROOT"}
            }}
        ]
        latest_visits = await db.visits.aggregate(pipeline).to_list(length=10000)
    
    controlled_count = sum(1 for v in latest_visits if v["latest_visit"].get("control_status") == ControlStatus.CONTROLLED.value)
    total_with_visits = len(latest_visits)
    
    control_rate = (controlled_count / total_with_visits * 100) if total_with_visits > 0 else 0
    
    # Overdue follow-ups
    overdue_count = sum(1 for v in latest_visits if v["latest_visit"].get("next_visit_date") and v["latest_visit"]["next_visit_date"] < now)
    
    # Data completeness (patients with at least one visit)
    data_completeness = (total_with_visits / total_patients * 100) if total_patients > 0 else 0
    
    return {
        "total_patients": total_patients,
        "active_cases": total_with_visits,
        "htn_patients": total_htn,
        "dm_patients": total_dm,
        "both_conditions": total_both,
        "control_rate": round(control_rate, 1),
        "controlled_patients": controlled_count,
        "uncontrolled_patients": total_with_visits - controlled_count,
        "monthly_screenings": monthly_screenings,
        "overdue_followups": overdue_count,
        "data_completeness": round(data_completeness, 1)
    }

@router.get("/htn-trends")
async def get_htn_trends(
    barangay: Optional[str] = Query(None),
    months: int = Query(6, ge=1, le=24),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Hypertension trends over time
    - Control vs uncontrolled
    - High-risk segmentation
    - Monthly progression
    """
    # Get HTN patients
    patient_query = {"is_active": True, "conditions": {"$in": ["Hypertension", "HTN"]}}
    
    if barangay:
        if not check_barangay_access(current_user, barangay):
            raise HTTPException(status_code=403, detail="No access to this barangay")
        patient_query["barangay"] = barangay
    elif current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
    
    patient_ids_cursor = db.patients.find(patient_query, {"patient_id": 1})
    patient_ids = [p["patient_id"] async for p in patient_ids_cursor]
    
    # Get visits for last N months
    now = datetime.utcnow()
    start_date = now - timedelta(days=months * 30)
    
    trends = []
    if settings.DB_MODE.lower() == "embedded":
        visits = await db.visits.find({
            "patient_id": {"$in": patient_ids},
            "visit_date": {"$gte": start_date},
            "diagnosis": {"$in": ["HTN", "HTN+DM"]}
        }).to_list(length=100000)
        bucket = {}
        for visit in visits:
            visit_date = visit.get("visit_date")
            if not visit_date:
                continue
            key = (visit_date.year, visit_date.month, visit.get("control_status"))
            bucket[key] = bucket.get(key, 0) + 1
        trends = [{"_id": {"year": y, "month": m, "control_status": status}, "count": count} for (y, m, status), count in bucket.items()]
        trends.sort(key=lambda x: (x["_id"]["year"], x["_id"]["month"]))
    else:
        pipeline = [
            {
                "$match": {
                    "patient_id": {"$in": patient_ids},
                    "visit_date": {"$gte": start_date},
                    "diagnosis": {"$in": ["HTN", "HTN+DM"]}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$visit_date"},
                        "month": {"$month": "$visit_date"},
                        "control_status": "$control_status"
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        trends = await db.visits.aggregate(pipeline).to_list(length=1000)
    
    # Format response
    monthly_data = {}
    for item in trends:
        month_key = f"{item['_id']['year']}-{item['_id']['month']:02d}"
        if month_key not in monthly_data:
            monthly_data[month_key] = {"controlled": 0, "uncontrolled": 0}
        
        status = item["_id"]["control_status"]
        if status == ControlStatus.CONTROLLED.value:
            monthly_data[month_key]["controlled"] = item["count"]
        else:
            monthly_data[month_key]["uncontrolled"] = item["count"]
    
    return {
        "condition": "Hypertension",
        "months": months,
        "trends": [
            {
                "month": month,
                "controlled": data["controlled"],
                "uncontrolled": data["uncontrolled"],
                "total": data["controlled"] + data["uncontrolled"]
            }
            for month, data in sorted(monthly_data.items())
        ]
    }

@router.get("/dm-trends")
async def get_dm_trends(
    barangay: Optional[str] = Query(None),
    months: int = Query(6, ge=1, le=24),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Diabetes trends over time"""
    # Similar to HTN trends but for DM patients
    patient_query = {"is_active": True, "conditions": {"$in": ["Diabetes", "Diabetes Mellitus Type 2", "DM"]}}
    
    if barangay:
        if not check_barangay_access(current_user, barangay):
            raise HTTPException(status_code=403, detail="No access to this barangay")
        patient_query["barangay"] = barangay
    elif current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
    
    patient_ids_cursor = db.patients.find(patient_query, {"patient_id": 1})
    patient_ids = [p["patient_id"] async for p in patient_ids_cursor]
    
    now = datetime.utcnow()
    start_date = now - timedelta(days=months * 30)
    
    trends = []
    if settings.DB_MODE.lower() == "embedded":
        visits = await db.visits.find({
            "patient_id": {"$in": patient_ids},
            "visit_date": {"$gte": start_date},
            "diagnosis": {"$in": ["DM", "HTN+DM"]}
        }).to_list(length=100000)
        bucket = {}
        for visit in visits:
            visit_date = visit.get("visit_date")
            if not visit_date:
                continue
            key = (visit_date.year, visit_date.month, visit.get("control_status"))
            bucket[key] = bucket.get(key, 0) + 1
        trends = [{"_id": {"year": y, "month": m, "control_status": status}, "count": count} for (y, m, status), count in bucket.items()]
        trends.sort(key=lambda x: (x["_id"]["year"], x["_id"]["month"]))
    else:
        pipeline = [
            {
                "$match": {
                    "patient_id": {"$in": patient_ids},
                    "visit_date": {"$gte": start_date},
                    "diagnosis": {"$in": ["DM", "HTN+DM"]}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$visit_date"},
                        "month": {"$month": "$visit_date"},
                        "control_status": "$control_status"
                    },
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        trends = await db.visits.aggregate(pipeline).to_list(length=1000)
    
    monthly_data = {}
    for item in trends:
        month_key = f"{item['_id']['year']}-{item['_id']['month']:02d}"
        if month_key not in monthly_data:
            monthly_data[month_key] = {"controlled": 0, "uncontrolled": 0}
        
        status = item["_id"]["control_status"]
        if status == ControlStatus.CONTROLLED.value:
            monthly_data[month_key]["controlled"] = item["count"]
        else:
            monthly_data[month_key]["uncontrolled"] = item["count"]
    
    return {
        "condition": "Diabetes Mellitus",
        "months": months,
        "trends": [
            {
                "month": month,
                "controlled": data["controlled"],
                "uncontrolled": data["uncontrolled"],
                "total": data["controlled"] + data["uncontrolled"]
            }
            for month, data in sorted(monthly_data.items())
        ]
    }

@router.get("/barangay-summary")
async def get_barangay_summary(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Summary statistics for all barangays
    Used for heat maps and priority ranking
    """
    # Get all barangays (or only assigned ones for BHWs/nurses)
    barangay_query = {}
    if current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        barangay_query = {"name": {"$in": current_user.get("assigned_barangays", [])}}
    
    barangays = await db.barangays.find(barangay_query).to_list(length=100)
    
    summaries = []
    for barangay in barangays:
        barangay_name = barangay["name"]
        
        # Patient counts
        total_patients = await db.patients.count_documents({"barangay": barangay_name, "is_active": True})
        
        htn_patients = await db.patients.count_documents({
            "barangay": barangay_name,
            "is_active": True,
            "conditions": {"$in": ["Hypertension", "HTN"]}
        })
        
        dm_patients = await db.patients.count_documents({
            "barangay": barangay_name,
            "is_active": True,
            "conditions": {"$in": ["Diabetes", "Diabetes Mellitus Type 2", "DM"]}
        })
        
        # High-risk patients
        high_risk = await db.patients.count_documents({
            "barangay": barangay_name,
            "is_active": True,
            "risk_level": {"$in": ["High", "Very High"]}
        })
        
        summaries.append({
            "barangay": barangay_name,
            "cluster": barangay.get("cluster"),
            "total_patients": total_patients,
            "htn_patients": htn_patients,
            "dm_patients": dm_patients,
            "high_risk_patients": high_risk,
            "population": barangay.get("stats", {}).get("total_population")
        })
    
    return summaries

@router.get("/barangay-stats")
async def get_barangay_stats(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Backward-compatible alias for barangay summary"""
    return await get_barangay_summary(current_user=current_user, db=db)

@router.get("/cohort-retention")
async def get_cohort_retention(
    months: int = Query(12, ge=6, le=24),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Cohort retention analysis
    Track how many patients remain in care at 6 and 12 months
    """
    now = datetime.utcnow()
    
    # Get patients registered N months ago
    cohort_start = now - timedelta(days=months * 30)
    cohort_end = cohort_start + timedelta(days=30)
    
    patient_query = {
        "created_at": {"$gte": cohort_start, "$lt": cohort_end}
    }
    
    if current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
    
    cohort_patients = await db.patients.find(patient_query).to_list(length=10000)
    cohort_size = len(cohort_patients)
    
    if cohort_size == 0:
        return {"cohort_size": 0, "retention": {}}
    
    patient_ids = [p["patient_id"] for p in cohort_patients]
    
    # Check 6-month retention
    six_months_ago = now - timedelta(days=180)
    six_month_visits = await db.visits.count_documents({
        "patient_id": {"$in": patient_ids},
        "visit_date": {"$gte": six_months_ago}
    })
    
    # Get unique patients with visits in last 6 months
    if settings.DB_MODE.lower() == "embedded":
        visits_6 = await db.visits.find({
            "patient_id": {"$in": patient_ids},
            "visit_date": {"$gte": six_months_ago}
        }).to_list(length=100000)
        six_month_retention = len({v.get("patient_id") for v in visits_6 if v.get("patient_id")})
    else:
        six_month_pipeline = [
            {"$match": {
                "patient_id": {"$in": patient_ids},
                "visit_date": {"$gte": six_months_ago}
            }},
            {"$group": {"_id": "$patient_id"}},
            {"$count": "total"}
        ]
        six_month_result = await db.visits.aggregate(six_month_pipeline).to_list(length=1)
        six_month_retention = six_month_result[0]["total"] if six_month_result else 0
    
    # Check 12-month retention
    twelve_months_ago = now - timedelta(days=365)
    if settings.DB_MODE.lower() == "embedded":
        visits_12 = await db.visits.find({
            "patient_id": {"$in": patient_ids},
            "visit_date": {"$gte": twelve_months_ago}
        }).to_list(length=100000)
        twelve_month_retention = len({v.get("patient_id") for v in visits_12 if v.get("patient_id")})
    else:
        twelve_month_pipeline = [
            {"$match": {
                "patient_id": {"$in": patient_ids},
                "visit_date": {"$gte": twelve_months_ago}
            }},
            {"$group": {"_id": "$patient_id"}},
            {"$count": "total"}
        ]
        twelve_month_result = await db.visits.aggregate(twelve_month_pipeline).to_list(length=1)
        twelve_month_retention = twelve_month_result[0]["total"] if twelve_month_result else 0
    
    return {
        "cohort_size": cohort_size,
        "cohort_period": f"{cohort_start.strftime('%Y-%m')}",
        "retention": {
            "6_months": {
                "retained": six_month_retention,
                "rate": round(six_month_retention / cohort_size * 100, 1)
            },
            "12_months": {
                "retained": twelve_month_retention,
                "rate": round(twelve_month_retention / cohort_size * 100, 1)
            }
        }
    }

@router.get("/risk-distribution")
async def get_risk_distribution(
    barangay: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Distribution of patients by risk level"""
    patient_query = {"is_active": True}
    
    if barangay:
        if not check_barangay_access(current_user, barangay):
            raise HTTPException(status_code=403, detail="No access to this barangay")
        patient_query["barangay"] = barangay
    elif current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
    
    if settings.DB_MODE.lower() == "embedded":
        patients = await db.patients.find(patient_query).to_list(length=100000)
        bucket = {}
        for patient in patients:
            key = patient.get("risk_level")
            bucket[key] = bucket.get(key, 0) + 1
        distribution = [{"_id": key, "count": count} for key, count in bucket.items()]
    else:
        pipeline = [
            {"$match": patient_query},
            {"$group": {
                "_id": "$risk_level",
                "count": {"$sum": 1}
            }}
        ]
        distribution = await db.patients.aggregate(pipeline).to_list(length=10)
    
    return {
        "distribution": [
            {"risk_level": item["_id"] or "Unknown", "count": item["count"]}
            for item in distribution
        ]
    }

@router.get("/medication-adherence")
async def get_medication_adherence(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """
    Basic adherence proxy based on recent visits with medications dispensed.
    Categories: Good (recent visit + meds), Moderate (recent visit, no meds),
    Poor (no recent visit in last 90 days).
    """
    now = datetime.utcnow()
    recent_cutoff = now - timedelta(days=90)

    def classify(latest_visit: Optional[dict]) -> str:
        if not latest_visit:
            return "Poor Adherence"
        if latest_visit.get("visit_date") and latest_visit["visit_date"] < recent_cutoff:
            return "Poor Adherence"
        if latest_visit.get("medications_dispensed"):
            return "Good Adherence"
        return "Moderate Adherence"

    async def build_group(conditions: list[str]) -> list[dict]:
        patient_query = {"is_active": True, "conditions": {"$in": conditions}}
        if current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
            patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}
        patient_ids_cursor = db.patients.find(patient_query, {"patient_id": 1})
        patient_ids = [p["patient_id"] async for p in patient_ids_cursor]
        if not patient_ids:
            return [
                {"category": "Good Adherence", "count": 0, "percent": 0},
                {"category": "Moderate Adherence", "count": 0, "percent": 0},
                {"category": "Poor Adherence", "count": 0, "percent": 0},
            ]

        if settings.DB_MODE.lower() == "embedded":
            visits = await db.visits.find({"patient_id": {"$in": patient_ids}}).to_list(length=100000)
            latest_by_patient = {}
            for visit in visits:
                pid = visit.get("patient_id")
                if not pid:
                    continue
                current = latest_by_patient.get(pid)
                if not current or (visit.get("visit_date") and visit["visit_date"] > current.get("visit_date")):
                    latest_by_patient[pid] = visit
        else:
            latest_pipeline = [
                {"$match": {"patient_id": {"$in": patient_ids}}},
                {"$sort": {"visit_date": -1}},
                {"$group": {"_id": "$patient_id", "latest_visit": {"$first": "$$ROOT"}}}
            ]
            latest_visits = await db.visits.aggregate(latest_pipeline).to_list(length=10000)
            latest_by_patient = {v["_id"]: v["latest_visit"] for v in latest_visits}

        buckets = {"Good Adherence": 0, "Moderate Adherence": 0, "Poor Adherence": 0}
        for patient_id in patient_ids:
            category = classify(latest_by_patient.get(patient_id))
            buckets[category] += 1

        total = len(patient_ids)
        return [
            {"category": "Good Adherence", "count": buckets["Good Adherence"], "percent": round(buckets["Good Adherence"] / total * 100, 1)},
            {"category": "Moderate Adherence", "count": buckets["Moderate Adherence"], "percent": round(buckets["Moderate Adherence"] / total * 100, 1)},
            {"category": "Poor Adherence", "count": buckets["Poor Adherence"], "percent": round(buckets["Poor Adherence"] / total * 100, 1)},
        ]

    dm_data = await build_group(["Diabetes", "Diabetes Mellitus Type 2", "DM"])
    htn_data = await build_group(["Hypertension", "HTN"])

    return {
        "dm": dm_data,
        "htn": htn_data
    }

@router.get("/cohort-series")
async def get_cohort_series(
    months: int = Query(6, ge=3, le=24),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Cohort retention series for the last N months."""
    now = datetime.utcnow()
    series = []

    for idx in range(months - 1, -1, -1):
        cohort_start = (now.replace(day=1, hour=0, minute=0, second=0, microsecond=0) - timedelta(days=idx * 30))
        cohort_end = cohort_start + timedelta(days=30)
        patient_query = {
            "created_at": {"$gte": cohort_start, "$lt": cohort_end}
        }
        if current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
            patient_query["barangay"] = {"$in": current_user.get("assigned_barangays", [])}

        cohort_patients = await db.patients.find(patient_query).to_list(length=10000)
        cohort_size = len(cohort_patients)
        patient_ids = [p["patient_id"] for p in cohort_patients]

        month_label = cohort_start.strftime("%b %y")
        month_entry = {"month": month_label, "enrolled": cohort_size, "month6": None, "month12": None}

        if cohort_size == 0:
            series.append(month_entry)
            continue

        six_months_after = cohort_start + timedelta(days=180)
        twelve_months_after = cohort_start + timedelta(days=365)

        if six_months_after <= now:
            six_cutoff = now - timedelta(days=180)
            if settings.DB_MODE.lower() == "embedded":
                visits_6 = await db.visits.find({
                    "patient_id": {"$in": patient_ids},
                    "visit_date": {"$gte": six_cutoff}
                }).to_list(length=100000)
                retained_6 = len({v.get("patient_id") for v in visits_6 if v.get("patient_id")})
            else:
                pipeline = [
                    {"$match": {"patient_id": {"$in": patient_ids}, "visit_date": {"$gte": six_cutoff}}},
                    {"$group": {"_id": "$patient_id"}},
                    {"$count": "total"}
                ]
                result = await db.visits.aggregate(pipeline).to_list(length=1)
                retained_6 = result[0]["total"] if result else 0
            month_entry["month6"] = retained_6

        if twelve_months_after <= now:
            twelve_cutoff = now - timedelta(days=365)
            if settings.DB_MODE.lower() == "embedded":
                visits_12 = await db.visits.find({
                    "patient_id": {"$in": patient_ids},
                    "visit_date": {"$gte": twelve_cutoff}
                }).to_list(length=100000)
                retained_12 = len({v.get("patient_id") for v in visits_12 if v.get("patient_id")})
            else:
                pipeline = [
                    {"$match": {"patient_id": {"$in": patient_ids}, "visit_date": {"$gte": twelve_cutoff}}},
                    {"$group": {"_id": "$patient_id"}},
                    {"$count": "total"}
                ]
                result = await db.visits.aggregate(pipeline).to_list(length=1)
                retained_12 = result[0]["total"] if result else 0
            month_entry["month12"] = retained_12

        series.append(month_entry)

    return {"series": series}

@router.get("/distributions")
async def get_distributions(
    months: int = Query(6, ge=1, le=24),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    """Aggregated distributions for dashboard charts."""
    patient_query = build_patient_query(current_user)
    patients = await db.patients.find(patient_query).to_list(length=100000)
    patient_ids = [p.get("patient_id") for p in patients if p.get("patient_id")]
    latest_visits = await get_latest_visits(db, patient_ids)

    total_patients = len(patients) or 1

    def pct(value: int, total: int) -> float:
        return round((value / total * 100), 1) if total > 0 else 0

    # Occupation distribution
    occupation_counts: Dict[str, int] = defaultdict(int)
    for patient in patients:
        occupation_counts[patient.get("occupation") or "Unknown"] += 1
    occupation_distribution = [
        {"occupation": occ, "count": count, "percent": pct(count, total_patients)}
        for occ, count in sorted(occupation_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Education distribution
    education_counts: Dict[str, int] = defaultdict(int)
    for patient in patients:
        education_counts[patient.get("education") or "Unknown"] += 1
    education_distribution = [
        {"level": level, "count": count, "percent": pct(count, total_patients)}
        for level, count in sorted(education_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Age distribution
    age_groups = [
        ("18-29", 18, 29),
        ("30-39", 30, 39),
        ("40-49", 40, 49),
        ("50-59", 50, 59),
        ("60-69", 60, 69),
        ("70+", 70, 200),
    ]
    age_counts = {label: 0 for label, _, _ in age_groups}
    for patient in patients:
        age = patient.get("age")
        if age is None:
            continue
        for label, min_age, max_age in age_groups:
            if min_age <= age <= max_age:
                age_counts[label] += 1
                break
    age_distribution = [
        {"ageGroup": label, "count": count, "percent": pct(count, total_patients)}
        for label, count in age_counts.items()
    ]

    # Age group disease correlation
    age_group_corr = []
    for label, min_age, max_age in age_groups:
        group_patients = [p for p in patients if p.get("age") is not None and min_age <= p["age"] <= max_age]
        group_total = len(group_patients)
        dm_count = sum(1 for p in group_patients if "DM" in (p.get("conditions") or []) or "Diabetes" in (p.get("conditions") or []))
        htn_count = sum(1 for p in group_patients if "HTN" in (p.get("conditions") or []) or "Hypertension" in (p.get("conditions") or []))
        age_group_corr.append({
            "ageGroup": label,
            "dmPrevalence": pct(dm_count, group_total),
            "htnPrevalence": pct(htn_count, group_total),
            "dmCount": dm_count,
            "htnCount": htn_count
        })

    # Occupation disease correlation
    occupation_corr = []
    for occupation, total in sorted(occupation_counts.items(), key=lambda x: x[1], reverse=True):
        group_patients = [p for p in patients if (p.get("occupation") or "Unknown") == occupation]
        dm_count = sum(1 for p in group_patients if "DM" in (p.get("conditions") or []) or "Diabetes" in (p.get("conditions") or []))
        htn_count = sum(1 for p in group_patients if "HTN" in (p.get("conditions") or []) or "Hypertension" in (p.get("conditions") or []))
        occupation_corr.append({
            "occupation": occupation,
            "total": len(group_patients),
            "dmCount": dm_count,
            "htnCount": htn_count,
            "dmPrevalence": pct(dm_count, len(group_patients)),
            "htnPrevalence": pct(htn_count, len(group_patients)),
            "notes": "Derived from registry"
        })

    # Monthly screenings and diagnoses
    now = datetime.utcnow()
    month_buckets = {}
    for i in range(months - 1, -1, -1):
        bucket_date = (now.replace(day=1) - timedelta(days=i * 30))
        month_key = bucket_date.strftime("%b")
        month_buckets[month_key] = {"month": month_key, "screenings": 0, "diagnoses": 0}

    visit_query = {"patient_id": {"$in": patient_ids}}
    visits = await db.visits.find(visit_query).to_list(length=100000)
    for visit in visits:
        visit_date = visit.get("visit_date")
        if not visit_date:
            continue
        month_key = visit_date.strftime("%b")
        if month_key not in month_buckets:
            continue
        month_buckets[month_key]["screenings"] += 1
        if visit.get("diagnosis"):
            month_buckets[month_key]["diagnoses"] += 1
    monthly_screenings = list(month_buckets.values())

    # Glucose distributions
    fbg_buckets = [("<100", 0), ("100-125", 0), ("126-180", 0), ("181-250", 0), (">250", 0)]
    rbg_buckets = [("<140", 0), ("140-199", 0), ("200-250", 0), ("251-350", 0), (">350", 0)]
    for visit in latest_visits.values():
        glucose = visit.get("vitals", {}).get("glucose")
        if glucose is None:
            continue
        glucose_type = (visit.get("vitals", {}).get("glucose_type") or "").lower()
        target = fbg_buckets if "fast" in glucose_type else rbg_buckets
        if target is fbg_buckets:
            if glucose < 100:
                target[0] = (target[0][0], target[0][1] + 1)
            elif glucose <= 125:
                target[1] = (target[1][0], target[1][1] + 1)
            elif glucose <= 180:
                target[2] = (target[2][0], target[2][1] + 1)
            elif glucose <= 250:
                target[3] = (target[3][0], target[3][1] + 1)
            else:
                target[4] = (target[4][0], target[4][1] + 1)
        else:
            if glucose < 140:
                target[0] = (target[0][0], target[0][1] + 1)
            elif glucose <= 199:
                target[1] = (target[1][0], target[1][1] + 1)
            elif glucose <= 250:
                target[2] = (target[2][0], target[2][1] + 1)
            elif glucose <= 350:
                target[3] = (target[3][0], target[3][1] + 1)
            else:
                target[4] = (target[4][0], target[4][1] + 1)
    fbg_distribution = [{"range": label, "count": count, "status": ""} for label, count in fbg_buckets]
    rbg_distribution = [{"range": label, "count": count, "status": ""} for label, count in rbg_buckets]

    # BP categories by month
    bp_buckets = {}
    for item in month_buckets.values():
        bp_buckets[item["month"]] = {"month": item["month"], "Normal": 0, "Elevated": 0, "Stage1": 0, "Stage2": 0}
    for visit in visits:
        visit_date = visit.get("visit_date")
        if not visit_date:
            continue
        month_key = visit_date.strftime("%b")
        if month_key not in bp_buckets:
            continue
        systolic = visit.get("vitals", {}).get("systolic")
        diastolic = visit.get("vitals", {}).get("diastolic")
        if systolic is None or diastolic is None:
            continue
        if systolic < 120 and diastolic < 80:
            bp_buckets[month_key]["Normal"] += 1
        elif 120 <= systolic < 130 and diastolic < 80:
            bp_buckets[month_key]["Elevated"] += 1
        elif 130 <= systolic < 140 or 80 <= diastolic < 90:
            bp_buckets[month_key]["Stage1"] += 1
        else:
            bp_buckets[month_key]["Stage2"] += 1
    bp_categories = list(bp_buckets.values())

    # BMI distributions
    def bmi_category(value: float) -> str:
        if value < 18.5:
            return "Underweight (<18.5)"
        if value < 23:
            return "Normal (18.5-22.9)"
        if value < 25:
            return "Overweight (23-24.9)"
        if value < 30:
            return "Obese I (25-29.9)"
        return "Obese II (≥30)"

    bmi_counts = defaultdict(int)
    bmi_counts_htn = defaultdict(int)
    for patient_id, visit in latest_visits.items():
        vitals = visit.get("vitals", {})
        bmi = vitals.get("bmi")
        if bmi is None and vitals.get("weight") and vitals.get("height"):
            bmi = round(vitals["weight"] / ((vitals["height"] / 100) ** 2), 1)
        if bmi is None:
            continue
        category = bmi_category(bmi)
        bmi_counts[category] += 1
        patient = next((p for p in patients if p.get("patient_id") == patient_id), None)
        if patient and ("HTN" in (patient.get("conditions") or []) or "Hypertension" in (patient.get("conditions") or [])):
            bmi_counts_htn[category] += 1

    def build_bmi_distribution(counts: dict, total: int) -> list[dict]:
        return [
            {"category": label, "count": counts.get(label, 0), "percent": pct(counts.get(label, 0), total), "color": "#4D6186"}
            for label in [
                "Underweight (<18.5)",
                "Normal (18.5-22.9)",
                "Overweight (23-24.9)",
                "Obese I (25-29.9)",
                "Obese II (≥30)"
            ]
        ]

    bmi_distribution = build_bmi_distribution(bmi_counts, len(latest_visits))
    bmi_distribution_htn = build_bmi_distribution(bmi_counts_htn, sum(bmi_counts_htn.values()))

    # Control rates by condition (based on latest visits)
    htn_controlled = 0
    htn_total = 0
    dm_controlled = 0
    dm_total = 0
    for patient_id, visit in latest_visits.items():
        patient = next((p for p in patients if p.get("patient_id") == patient_id), None)
        if not patient:
            continue
        conditions = patient.get("conditions") or []
        has_htn = "HTN" in conditions or "Hypertension" in conditions
        has_dm = "DM" in conditions or "Diabetes" in conditions or "Diabetes Mellitus Type 2" in conditions
        if has_htn:
            htn_total += 1
            if visit.get("control_status") == ControlStatus.CONTROLLED.value:
                htn_controlled += 1
        if has_dm:
            dm_total += 1
            if visit.get("control_status") == ControlStatus.CONTROLLED.value:
                dm_controlled += 1

    bmi_total = sum(bmi_counts.values()) or 1
    avg_bmi = 0.0
    if bmi_total:
        bmi_sum = 0.0
        for patient_id, visit in latest_visits.items():
            vitals = visit.get("vitals", {})
            bmi = vitals.get("bmi")
            if bmi is None and vitals.get("weight") and vitals.get("height"):
                bmi = round(vitals["weight"] / ((vitals["height"] / 100) ** 2), 1)
            if bmi is not None:
                bmi_sum += bmi
        avg_bmi = round(bmi_sum / bmi_total, 1)
    obese_percent = pct(bmi_counts.get("Obese I (25-29.9)", 0) + bmi_counts.get("Obese II (≥30)", 0), bmi_total)

    # Risk stratification
    def stratify(condition_key: str) -> list[dict]:
        patients_filtered = [
            p for p in patients if condition_key in (p.get("conditions") or [])
            or (condition_key == "HTN" and "Hypertension" in (p.get("conditions") or []))
            or (condition_key == "DM" and ("Diabetes" in (p.get("conditions") or []) or "Diabetes Mellitus Type 2" in (p.get("conditions") or [])))
        ]
        total = len(patients_filtered)
        bucket = defaultdict(int)
        for p in patients_filtered:
            bucket[p.get("risk_level") or "Unknown"] += 1
        descriptions = {
            "Low": "Stage 1, no other risk factors",
            "Moderate": "Stage 1-2 with 1-2 risk factors",
            "High": "Stage 2 or multiple risk factors",
            "Very High": "Stage 3 or complications",
            "Unknown": "Insufficient data"
        }
        return [
            {"risk": level, "count": count, "percent": pct(count, total), "description": descriptions.get(level, "")}
            for level, count in bucket.items()
        ]

    htn_risk_stratification = stratify("HTN")
    dm_risk_stratification = stratify("DM")

    # HTN complications
    complication_counts = defaultdict(int)
    for visit in latest_visits.values():
        complications = visit.get("complications_noted")
        if not complications:
            complication_counts["None"] += 1
            continue
        for comp in [c.strip() for c in str(complications).split(",") if c.strip()]:
            complication_counts[comp] += 1
    total_comp = sum(complication_counts.values()) or 1
    htn_complications = [
        {"complication": comp, "count": count, "percent": pct(count, total_comp)}
        for comp, count in sorted(complication_counts.items(), key=lambda x: x[1], reverse=True)
    ]

    # Medication distribution
    medication_counts = defaultdict(int)
    medication_patients = defaultdict(set)
    for visit in visits:
        for med in visit.get("medications_dispensed", []):
            name = med.get("name") or "Unknown"
            qty = med.get("quantity") or 1
            medication_counts[name] += qty
            if visit.get("patient_id"):
                medication_patients[name].add(visit.get("patient_id"))
    medication_distribution = [
        {
            "medication": name,
            "distributed": medication_counts[name],
            "patients": len(medication_patients[name]),
            "percent": pct(len(medication_patients[name]), total_patients)
        }
        for name in sorted(medication_counts.keys())
    ]

    return {
        "monthly_screenings": monthly_screenings,
        "fbg_distribution": fbg_distribution,
        "rbg_distribution": rbg_distribution,
        "bp_categories": bp_categories,
        "occupation_distribution": occupation_distribution,
        "education_distribution": education_distribution,
        "age_distribution": age_distribution,
        "age_group_disease_correlation": age_group_corr,
        "occupation_disease_correlation": occupation_corr,
        "bmi_distribution": bmi_distribution,
        "bmi_distribution_htn": bmi_distribution_htn,
        "htn_complications": htn_complications,
        "htn_risk_stratification": htn_risk_stratification,
        "dm_risk_stratification": dm_risk_stratification,
        "medication_distribution": medication_distribution
        ,
        "control_rates": {
            "htn": {"controlled": htn_controlled, "total": htn_total, "rate": pct(htn_controlled, htn_total)},
            "dm": {"controlled": dm_controlled, "total": dm_total, "rate": pct(dm_controlled, dm_total)}
        },
        "bmi_summary": {
            "obese_percent": obese_percent,
            "average": avg_bmi
        }
    }
