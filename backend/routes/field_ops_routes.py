"""
Field operations endpoints for scheduling and outreach.
"""

from fastapi import APIRouter, Depends
from datetime import datetime, timedelta
from collections import defaultdict
from database import get_database
from auth import get_current_user
from models.schemas import RoleEnum, ControlStatus

router = APIRouter(prefix="/api/field-ops", tags=["FieldOps"])

@router.get("/summary")
async def get_field_ops_summary(
    current_user: dict = Depends(get_current_user),
    db = Depends(get_database)
):
    now = datetime.utcnow()

    # Determine accessible barangays
    barangay_query = {}
    if current_user["role"] in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]:
        barangay_query = {"name": {"$in": current_user.get("assigned_barangays", [])}}
    barangays = await db.barangays.find(barangay_query).to_list(length=100)
    barangay_names = [b.get("name") for b in barangays]

    patient_query = {"is_active": True}
    if barangay_names:
        patient_query["barangay"] = {"$in": barangay_names}
    patients = await db.patients.find(patient_query).to_list(length=100000)
    patient_ids = [p.get("patient_id") for p in patients if p.get("patient_id")]
    patient_map = {p.get("patient_id"): p for p in patients}

    visits = await db.visits.find({"patient_id": {"$in": patient_ids}}).to_list(length=100000)
    latest_by_patient = {}
    for visit in visits:
        pid = visit.get("patient_id")
        if not pid:
            continue
        current = latest_by_patient.get(pid)
        if not current or (visit.get("visit_date") and visit["visit_date"] > current.get("visit_date")):
            latest_by_patient[pid] = visit

    # Build barangay metrics for heatmap
    barangay_metrics = {}
    for barangay in barangays:
        barangay_metrics[barangay.get("name")] = {
            "id": str(barangay.get("_id")) if barangay.get("_id") else barangay.get("name"),
            "name": barangay.get("name"),
            "population": barangay.get("stats", {}).get("total_population") or 0,
            "registered": 0,
            "uncontrolledDM": 0,
            "uncontrolledHTN": 0,
            "lastClinicDate": None
        }

    for patient_id, visit in latest_by_patient.items():
        patient = patient_map.get(patient_id)
        if not patient:
            continue
        barangay_name = patient.get("barangay")
        if barangay_name not in barangay_metrics:
            continue
        barangay_metrics[barangay_name]["registered"] += 1
        if visit.get("control_status") == ControlStatus.UNCONTROLLED.value:
            diagnosis = visit.get("diagnosis") or ""
            if "DM" in diagnosis:
                barangay_metrics[barangay_name]["uncontrolledDM"] += 1
            if "HTN" in diagnosis:
                barangay_metrics[barangay_name]["uncontrolledHTN"] += 1
        last_date = barangay_metrics[barangay_name]["lastClinicDate"]
        visit_date = visit.get("visit_date")
        if visit_date and (last_date is None or visit_date > last_date):
            barangay_metrics[barangay_name]["lastClinicDate"] = visit_date

    # Visit schedule list (overdue + high risk)
    overdue_visits = []
    for patient_id, visit in latest_by_patient.items():
        next_visit = visit.get("next_visit_date")
        if next_visit and next_visit < now:
            patient = patient_map.get(patient_id)
            if not patient:
                continue
            reason = visit.get("clinical_notes") or visit.get("next_visit_reason") or "Overdue follow-up"
            overdue_visits.append({
                "patientId": patient_id,
                "patientName": patient.get("name") or f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip(),
                "barangay": patient.get("barangay"),
                "reason": reason,
                "distance": "N/A",
                "lastBP": f"{visit.get('vitals', {}).get('systolic', '')}/{visit.get('vitals', {}).get('diastolic', '')}",
                "lastHbA1c": visit.get("hba1c"),
                "conditions": patient.get("conditions") or [],
                "patient": {
                    "id": patient.get("patient_id"),
                    "name": patient.get("name") or f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip(),
                    "conditions": patient.get("conditions") or [],
                    "barangay": patient.get("barangay"),
                    "age": patient.get("age"),
                    "sex": patient.get("sex")
                }
            })

    # KPI counts
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = now - timedelta(days=7)
    today_visits = sum(1 for visit in visits if visit.get("visit_date") and visit["visit_date"] >= today_start)
    week_visits = sum(1 for visit in visits if visit.get("visit_date") and visit["visit_date"] >= week_start)
    overdue_count = len(overdue_visits)

    # Team members
    users = await db.users.find({"is_active": True}).to_list(length=1000)
    team_members = [u for u in users if u.get("role") in [RoleEnum.BHW.value, RoleEnum.RHU_NURSE.value]]

    teams = []
    for member in team_members:
        assigned = member.get("assigned_barangays", [])
        total_planned = sum(1 for v in overdue_visits if v.get("barangay") in assigned)
        completed = sum(1 for v in visits if v.get("recorded_by") == member.get("user_id") and v.get("visit_date") and v["visit_date"] >= today_start)
        total = max(total_planned, completed, 1)
        teams.append({
            "name": f"Team {member.get('full_name', member.get('username', 'Member'))}",
            "area": ", ".join(assigned) if assigned else "All barangays",
            "visits": f"{completed}/{total}",
            "status": "Active" if member.get("last_login") else "Inactive"
        })

    # Upcoming schedules (next 30 days)
    upcoming = defaultdict(list)
    for patient_id, visit in latest_by_patient.items():
        next_visit = visit.get("next_visit_date")
        if next_visit and now <= next_visit <= now + timedelta(days=30):
            patient = patient_map.get(patient_id)
            if not patient:
                continue
            date_key = next_visit.strftime("%Y-%m-%d")
            upcoming[date_key].append(patient.get("barangay"))

    upcoming_schedules = []
    for date_key, barangay_list in sorted(upcoming.items()):
        unique_barangays = sorted(set([b for b in barangay_list if b]))
        upcoming_schedules.append({
            "date": date_key,
            "barangays": ", ".join(unique_barangays),
            "patients": len(barangay_list),
            "team": "Team A",
            "flaggedCount": 0
        })

    return {
        "kpis": {
            "today_visits": today_visits,
            "week_visits": week_visits,
            "overdue_visits": overdue_count,
            "team_members": len(team_members)
        },
        "barangays": list(barangay_metrics.values()),
        "visits": overdue_visits[:20],
        "upcoming": upcoming_schedules[:10],
        "teams": teams
    }
