"""
MongoDB Schema Models for HealthHive Platform
Designed for offline-first chronic disease management
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr, validator
from enum import Enum


class RoleEnum(str, Enum):
    """User roles with hierarchical permissions"""
    BHW = "bhw"  # Barangay Health Worker - data capture only
    RHU_NURSE = "rhu_nurse"  # RHU Nurse - validate and aggregate
    SUPERVISOR = "supervisor"  # Supervisor - read analytics
    ADMIN = "admin"  # Admin - full access


class SexEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"


class RiskLevel(str, Enum):
    NORMAL = "Normal"
    ELEVATED = "Elevated"
    HIGH = "High"
    VERY_HIGH = "Very High"


class ControlStatus(str, Enum):
    CONTROLLED = "Controlled"
    UNCONTROLLED = "Uncontrolled"
    UNASSIGNED = "Unassigned"


class VisitType(str, Enum):
    SCREENING = "screening"
    FOLLOW_UP = "follow-up"
    EDUCATION = "education"


class DiagnosisType(str, Enum):
    HTN = "HTN"
    DM = "DM"
    BOTH = "HTN+DM"


class SyncStatus(str, Enum):
    PENDING = "pending"
    SYNCED = "synced"
    FAILED = "failed"
    CONFLICT = "conflict"


class ClusterType(str, Enum):
    COASTAL = "coastal"
    UPLAND = "upland"


# ============================================
# PATIENT MODEL
# ============================================

class ConsentRecord(BaseModel):
    """Patient consent tracking"""
    consent_type: str = Field(description="Type of consent (data collection, data sharing, etc.)")
    status: bool = Field(description="Consent given or not")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    recorded_by: str = Field(description="User ID who recorded consent")


class Patient(BaseModel):
    """Patient demographics and registration data"""
    patient_id: str = Field(description="Unique patient identifier (e.g., JAG-000123)")
    
    # Demographics
    first_name: str
    middle_name: Optional[str] = None
    last_name: str
    date_of_birth: str = Field(description="Format: DD/MM/YYYY")
    age: int = Field(ge=0, le=120)
    sex: SexEnum
    
    # Contact & Location
    barangay: str = Field(description="One of 33 barangays in Jagna")
    purok: Optional[str] = Field(None, description="Household cluster")
    address: str
    contact: Optional[str] = Field(None, description="Phone number")
    
    # Socioeconomic
    occupation: Optional[str] = None
    education: Optional[str] = Field(None, description="Elementary/High School/College")
    marital_status: Optional[str] = Field(None, description="Single/Married/Widowed/Separated")
    
    # Clinical
    conditions: List[str] = Field(default_factory=list, description="HTN, DM, or both")
    risk_level: Optional[RiskLevel] = None
    current_medications: List[Dict[str, Any]] = Field(default_factory=list)
    previous_medications: Optional[str] = None
    medications_provided: Optional[bool] = None
    medications_taken_regularly: Optional[bool] = None
    flagged_for_follow_up: Optional[bool] = None
    
    # Consent & Privacy
    consent_records: List[ConsentRecord] = Field(default_factory=list)
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str = Field(description="User ID who registered patient")
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    updated_by: str
    is_active: bool = Field(default=True)
    
    class Config:
        json_schema_extra = {
            "example": {
                "patient_id": "JAG-000123",
                "first_name": "Ana",
                "middle_name": "Maria",
                "last_name": "Reyes",
                "date_of_birth": "15/03/1971",
                "age": 54,
                "sex": "Female",
                "barangay": "Poblacion (Pondol)",
                "purok": "Purok 3",
                "address": "Purok 3, Poblacion",
                "contact": "+63 912 345 6789",
                "occupation": "Vendor / Market Trader",
                "education": "High School",
                "marital_status": "Married",
                "conditions": ["Hypertension", "Diabetes Mellitus Type 2"],
                "risk_level": "High"
            }
        }


# ============================================
# VISIT MODEL
# ============================================

class VitalsReading(BaseModel):
    """Vital signs measurements"""
    systolic: Optional[int] = Field(None, ge=70, le=250, description="BP systolic in mmHg")
    diastolic: Optional[int] = Field(None, ge=40, le=150, description="BP diastolic in mmHg")
    glucose: Optional[float] = Field(None, ge=0, le=600, description="Blood glucose in mg/dL")
    glucose_type: Optional[str] = Field(None, description="Random or Fasting")
    glucose_random: Optional[float] = Field(None, ge=0, le=600, description="Random blood glucose in mg/dL")
    glucose_fasting: Optional[float] = Field(None, ge=0, le=600, description="Fasting blood glucose in mg/dL")
    weight: Optional[float] = Field(None, ge=0, le=300, description="Weight in kg")
    height: Optional[float] = Field(None, ge=0, le=250, description="Height in cm")
    bmi: Optional[float] = Field(None, ge=0, le=100, description="Body Mass Index")
    
    @validator('glucose')
    def flag_high_glucose(cls, v, values):
        """Flag improbable glucose values"""
        if v and v > 400:
            # Log warning but don't reject
            pass
        return v


class MedicationDispensed(BaseModel):
    """Medications given during visit"""
    name: str
    dosage: str
    quantity: int
    instructions: Optional[str] = None


class Visit(BaseModel):
    """Clinical encounter record"""
    visit_id: str = Field(description="Unique visit identifier")
    patient_id: str = Field(description="Reference to Patient")
    
    # Visit Details
    visit_type: VisitType
    visit_date: datetime = Field(default_factory=datetime.utcnow)
    
    # Clinical Data
    vitals: VitalsReading
    diagnosis: Optional[DiagnosisType] = None
    risk_tier: Optional[RiskLevel] = None
    control_status: Optional[ControlStatus] = None
    flagged_for_follow_up: Optional[bool] = None
    
    # Medications
    current_medications: List[MedicationDispensed] = Field(default_factory=list)
    medications_dispensed: List[MedicationDispensed] = Field(default_factory=list)
    medications_provided: Optional[bool] = None
    medications_taken_regularly: Optional[bool] = None
    previous_medications: Optional[str] = None
    new_medication_prescribed: Optional[str] = None
    treatment: Optional[str] = None
    
    # Follow-up
    next_visit_date: Optional[datetime] = None
    next_visit_reason: Optional[str] = None
    
    # Complications & Notes
    complications_noted: Optional[str] = None
    clinical_notes: Optional[str] = None
    
    # Attribution
    recorded_by: str = Field(description="BHW or nurse user ID")
    recorded_by_role: RoleEnum
    
    # Sync
    sync_status: SyncStatus = Field(default=SyncStatus.PENDING)
    synced_at: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "visit_id": "VISIT-2025-000001",
                "patient_id": "JAG-000123",
                "visit_type": "follow-up",
                "vitals": {
                    "systolic": 145,
                    "diastolic": 92,
                    "glucose": 180,
                    "glucose_type": "Random",
                    "weight": 68,
                    "height": 155,
                    "bmi": 28.3
                },
                "diagnosis": "HTN+DM",
                "control_status": "Uncontrolled",
                "risk_tier": "High"
            }
        }


# ============================================
# USER MODEL
# ============================================

class TrainingRecord(BaseModel):
    """Training completion tracking"""
    training_name: str
    completed_date: datetime
    certificate_id: Optional[str] = None


class User(BaseModel):
    """System users (BHWs, nurses, supervisors, admins)"""
    user_id: str = Field(description="Unique user identifier")
    username: str = Field(min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    hashed_password: str
    
    # Personal Info
    full_name: str
    contact: Optional[str] = None
    
    # Role & Access
    role: RoleEnum
    assigned_barangays: List[str] = Field(default_factory=list, description="Barangays this user can access")
    
    # Training
    digital_literacy_level: Optional[str] = Field(None, description="Low/Medium/High")
    training_records: List[TrainingRecord] = Field(default_factory=list)
    
    # Status
    is_active: bool = Field(default=True)
    last_login: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "BHW-001",
                "username": "maria.cruz",
                "full_name": "Maria Cruz",
                "role": "bhw",
                "assigned_barangays": ["Poblacion (Pondol)", "Naatang"],
                "digital_literacy_level": "Medium"
            }
        }


# ============================================
# BARANGAY MODEL
# ============================================

class BarangayStats(BaseModel):
    """Statistical summary for a barangay"""
    total_population: Optional[int] = None
    total_households: Optional[int] = None
    adult_population: Optional[int] = None  # For prevalence calculations


class Barangay(BaseModel):
    """Barangay (village) administrative unit"""
    barangay_id: str
    name: str = Field(description="One of 33 barangays in Jagna")
    cluster: ClusterType
    
    # Demographics
    stats: Optional[BarangayStats] = None
    
    # Staff Assignment
    assigned_bhws: List[str] = Field(default_factory=list, description="User IDs of assigned BHWs")
    assigned_nurses: List[str] = Field(default_factory=list, description="User IDs of assigned nurses")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# MEDICATION/STOCK MODEL
# ============================================

class StockLevel(BaseModel):
    """Current stock for a medication in a barangay"""
    barangay: str
    current_quantity: int = Field(ge=0)
    reorder_threshold: int = Field(ge=0)
    unit: str = Field(default="tablets", description="Unit of measure")


class MedicationStock(BaseModel):
    """Medication inventory tracking"""
    medication_id: str
    name: str
    medicine_type: str = Field(description="antihypertensive, antidiabetic, etc.")
    
    # Stock by barangay
    stock_levels: List[StockLevel] = Field(default_factory=list)
    
    # Consumption tracking
    total_dispensed_this_month: int = Field(default=0)
    average_monthly_consumption: Optional[float] = None
    
    # Metadata
    last_updated: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# EDUCATION SESSION MODEL (CDSMP)
# ============================================

class SessionAttendance(BaseModel):
    """Individual patient attendance record"""
    patient_id: str
    attended: bool
    goals_set: Optional[List[str]] = None
    notes: Optional[str] = None


class EducationSession(BaseModel):
    """Chronic Disease Self-Management Program session"""
    session_id: str
    session_type: str = Field(description="Healthy Eating, Active Living, etc.")
    session_date: datetime
    barangay: str
    
    # Attendance
    attendance_records: List[SessionAttendance] = Field(default_factory=list)
    total_attendees: int = Field(default=0)
    
    # Facilitation
    facilitator_id: str
    facilitator_notes: Optional[str] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================
# SYNC QUEUE MODEL
# ============================================

class SyncQueueItem(BaseModel):
    """Offline data waiting to sync"""
    queue_id: str
    item_type: str = Field(description="patient, visit, medication, etc.")
    operation: str = Field(description="create, update, delete")
    data: Dict[str, Any] = Field(description="The actual data payload")
    
    # Attribution
    created_by: str
    device_id: Optional[str] = None
    
    # Sync tracking
    sync_status: SyncStatus = Field(default=SyncStatus.PENDING)
    retry_count: int = Field(default=0)
    last_retry: Optional[datetime] = None
    error_message: Optional[str] = None
    
    # Conflict resolution
    conflict_detected: bool = Field(default=False)
    conflict_resolution: Optional[str] = Field(None, description="How conflict was resolved")
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    synced_at: Optional[datetime] = None


# ============================================
# AUDIT LOG MODEL
# ============================================

class AuditLog(BaseModel):
    """Comprehensive audit trail for PHI access and modifications"""
    log_id: str
    
    # What happened
    action: str = Field(description="view, create, update, delete, export, etc.")
    resource_type: str = Field(description="patient, visit, user, etc.")
    resource_id: str
    
    # Who did it
    user_id: str
    user_role: RoleEnum
    
    # When and where
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    ip_address: Optional[str] = None
    device_id: Optional[str] = None
    
    # Details
    changes_made: Optional[Dict[str, Any]] = Field(None, description="Before/after values for updates")
    reason: Optional[str] = Field(None, description="Reason for access/modification")
    
    # Context
    barangay: Optional[str] = None  # If action is barangay-specific
    
    class Config:
        json_schema_extra = {
            "example": {
                "log_id": "AUDIT-2025-000001",
                "action": "update",
                "resource_type": "patient",
                "resource_id": "JAG-000123",
                "user_id": "BHW-001",
                "user_role": "bhw",
                "changes_made": {
                    "contact": {"old": "+63 912 345 6789", "new": "+63 912 999 9999"}
                }
            }
        }
