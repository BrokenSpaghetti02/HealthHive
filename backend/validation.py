"""
Clinical validation rules and data quality checks
Based on HealthHive proposal requirements
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
from models.schemas import VitalsReading

class ValidationError:
    """Represents a validation error or warning"""
    def __init__(self, field: str, message: str, severity: str = "error"):
        self.field = field
        self.message = message
        self.severity = severity  # "error", "warning", "info"

class ClinicalValidator:
    """Validates clinical data according to medical standards"""
    
    @staticmethod
    def validate_blood_pressure(systolic: Optional[int], diastolic: Optional[int]) -> List[ValidationError]:
        """
        Validate blood pressure readings
        Normal range: Systolic 70-250 mmHg, Diastolic 40-150 mmHg
        Hypertension: ≥140/90 mmHg
        """
        errors = []
        
        if systolic is not None:
            if systolic < 70 or systolic > 250:
                errors.append(ValidationError(
                    "systolic",
                    f"Systolic BP {systolic} mmHg is outside normal range (70-250). Please verify.",
                    "warning"
                ))
            elif systolic < 90:
                errors.append(ValidationError(
                    "systolic",
                    f"Systolic BP {systolic} mmHg indicates hypotension. Verify reading.",
                    "info"
                ))
        
        if diastolic is not None:
            if diastolic < 40 or diastolic > 150:
                errors.append(ValidationError(
                    "diastolic",
                    f"Diastolic BP {diastolic} mmHg is outside normal range (40-150). Please verify.",
                    "warning"
                ))
            elif diastolic < 60:
                errors.append(ValidationError(
                    "diastolic",
                    f"Diastolic BP {diastolic} mmHg indicates hypotension. Verify reading.",
                    "info"
                ))
        
        # Check if both values are present for consistency
        if systolic is not None and diastolic is not None:
            if diastolic >= systolic:
                errors.append(ValidationError(
                    "blood_pressure",
                    "Diastolic BP cannot be greater than or equal to systolic BP.",
                    "error"
                ))
        
        return errors
    
    @staticmethod
    def validate_glucose(
        glucose: Optional[float],
        glucose_type: Optional[str],
        glucose_random: Optional[float] = None,
        glucose_fasting: Optional[float] = None
    ) -> List[ValidationError]:
        """
        Validate blood glucose readings
        Random glucose: 0-600 mg/dL (flag if >400)
        Fasting glucose: 0-400 mg/dL (flag if >200)
        Diabetes threshold: ≥200 mg/dL random or ≥126 mg/dL fasting
        """
        errors = []

        if glucose is not None:
            if glucose < 0 or glucose > 600:
                errors.append(ValidationError(
                    "glucose",
                    f"Glucose {glucose} mg/dL is outside valid range (0-600). Please verify.",
                    "error"
                ))
            elif glucose > 400:
                errors.append(ValidationError(
                    "glucose",
                    f"Glucose {glucose} mg/dL is extremely high. Verify reading and consider immediate referral.",
                    "warning"
                ))
            elif glucose < 70:
                errors.append(ValidationError(
                    "glucose",
                    f"Glucose {glucose} mg/dL indicates hypoglycemia. Verify and monitor patient.",
                    "warning"
                ))

            # Type-specific validation
            if glucose_type:
                if glucose_type.lower() == "fasting":
                    if glucose > 400:
                        errors.append(ValidationError(
                            "glucose",
                            f"Fasting glucose {glucose} mg/dL is abnormally high.",
                            "warning"
                        ))
                    elif glucose >= 126:
                        errors.append(ValidationError(
                            "glucose",
                            f"Fasting glucose {glucose} mg/dL meets diabetes criteria (≥126 mg/dL).",
                            "info"
                        ))
                elif glucose_type.lower() == "random":
                    if glucose >= 200:
                        errors.append(ValidationError(
                            "glucose",
                            f"Random glucose {glucose} mg/dL meets diabetes criteria (≥200 mg/dL).",
                            "info"
                        ))

        if glucose_random is not None:
            if glucose_random < 0 or glucose_random > 600:
                errors.append(ValidationError(
                    "glucose_random",
                    f"Random glucose {glucose_random} mg/dL is outside valid range (0-600). Please verify.",
                    "error"
                ))
            elif glucose_random >= 200:
                errors.append(ValidationError(
                    "glucose_random",
                    f"Random glucose {glucose_random} mg/dL meets diabetes criteria (≥200 mg/dL).",
                    "info"
                ))

        if glucose_fasting is not None:
            if glucose_fasting < 0 or glucose_fasting > 600:
                errors.append(ValidationError(
                    "glucose_fasting",
                    f"Fasting glucose {glucose_fasting} mg/dL is outside valid range (0-600). Please verify.",
                    "error"
                ))
            elif glucose_fasting >= 126:
                errors.append(ValidationError(
                    "glucose_fasting",
                    f"Fasting glucose {glucose_fasting} mg/dL meets diabetes criteria (≥126 mg/dL).",
                    "info"
                ))

        return errors
    
    @staticmethod
    def validate_anthropometrics(weight: Optional[float], height: Optional[float], bmi: Optional[float]) -> List[ValidationError]:
        """Validate weight, height, and BMI measurements"""
        errors = []
        
        if weight is not None:
            if weight < 20 or weight > 300:
                errors.append(ValidationError(
                    "weight",
                    f"Weight {weight} kg is outside typical range. Please verify.",
                    "warning"
                ))
        
        if height is not None:
            if height < 100 or height > 250:
                errors.append(ValidationError(
                    "height",
                    f"Height {height} cm is outside typical adult range. Please verify.",
                    "warning"
                ))
        
        # Validate BMI calculation
        if weight is not None and height is not None:
            calculated_bmi = weight / ((height / 100) ** 2)
            if bmi is not None:
                if abs(calculated_bmi - bmi) > 0.5:
                    errors.append(ValidationError(
                        "bmi",
                        f"Provided BMI {bmi:.1f} does not match calculated BMI {calculated_bmi:.1f}.",
                        "warning"
                    ))
            
            # BMI range warnings
            if calculated_bmi < 16:
                errors.append(ValidationError(
                    "bmi",
                    f"BMI {calculated_bmi:.1f} indicates severe underweight.",
                    "warning"
                ))
            elif calculated_bmi > 40:
                errors.append(ValidationError(
                    "bmi",
                    f"BMI {calculated_bmi:.1f} indicates severe obesity.",
                    "warning"
                ))
        
        return errors
    
    @staticmethod
    def validate_visit_dates(visit_date: datetime, next_visit_date: Optional[datetime]) -> List[ValidationError]:
        """Validate visit and follow-up dates"""
        errors = []
        
        now = datetime.utcnow()
        
        # Visit date cannot be in the future
        if visit_date > now:
            errors.append(ValidationError(
                "visit_date",
                "Visit date cannot be in the future.",
                "error"
            ))
        
        # Next visit date must be in the future
        if next_visit_date is not None:
            if next_visit_date <= now:
                errors.append(ValidationError(
                    "next_visit_date",
                    "Next visit date must be in the future.",
                    "error"
                ))
            
            if next_visit_date <= visit_date:
                errors.append(ValidationError(
                    "next_visit_date",
                    "Next visit date must be after current visit date.",
                    "error"
                ))
        
        return errors
    
    @staticmethod
    def validate_required_fields(data: Dict[str, Any], required_fields: List[str]) -> List[ValidationError]:
        """Validate that required fields are present and not empty"""
        errors = []
        
        for field in required_fields:
            value = data.get(field)
            if value is None or (isinstance(value, str) and not value.strip()):
                errors.append(ValidationError(
                    field,
                    f"Required field '{field}' is missing or empty.",
                    "error"
                ))
        
        return errors
    
    @staticmethod
    def validate_complete_visit(visit_data: Dict[str, Any]) -> List[ValidationError]:
        """Comprehensive validation for a complete visit record"""
        all_errors = []
        
        # Extract vitals
        vitals = visit_data.get("vitals", {})
        
        # Validate BP
        bp_errors = ClinicalValidator.validate_blood_pressure(
            vitals.get("systolic"),
            vitals.get("diastolic")
        )
        all_errors.extend(bp_errors)
        
        # Validate glucose
        glucose_errors = ClinicalValidator.validate_glucose(
            vitals.get("glucose"),
            vitals.get("glucose_type"),
            vitals.get("glucose_random"),
            vitals.get("glucose_fasting")
        )
        all_errors.extend(glucose_errors)
        
        # Validate anthropometrics
        anthro_errors = ClinicalValidator.validate_anthropometrics(
            vitals.get("weight"),
            vitals.get("height"),
            vitals.get("bmi")
        )
        all_errors.extend(anthro_errors)
        
        # Validate dates
        visit_date = visit_data.get("visit_date")
        next_visit_date = visit_data.get("next_visit_date")
        if visit_date:
            date_errors = ClinicalValidator.validate_visit_dates(visit_date, next_visit_date)
            all_errors.extend(date_errors)
        
        # Validate required fields (recorded_by is set server-side)
        required_fields = ["patient_id", "visit_type"]
        required_errors = ClinicalValidator.validate_required_fields(visit_data, required_fields)
        all_errors.extend(required_errors)
        
        return all_errors


class DataQualityChecker:
    """Check data quality and completeness"""
    
    @staticmethod
    def check_field_completeness(records: List[Dict[str, Any]], important_fields: List[str]) -> Dict[str, float]:
        """Calculate completeness percentage for important fields"""
        if not records:
            return {}
        
        total_records = len(records)
        completeness = {}
        
        for field in important_fields:
            filled_count = sum(1 for record in records if record.get(field) is not None and record.get(field) != "")
            completeness[field] = (filled_count / total_records) * 100
        
        return completeness
    
    @staticmethod
    async def detect_duplicates(db, collection_name: str, fields: List[str]) -> List[Dict[str, Any]]:
        """Detect potential duplicate records based on specified fields"""
        pipeline = [
            {
                "$group": {
                    "_id": {field: f"${field}" for field in fields},
                    "count": {"$sum": 1},
                    "ids": {"$push": "$patient_id"}
                }
            },
            {
                "$match": {
                    "count": {"$gt": 1}
                }
            }
        ]
        
        collection = db[collection_name]
        duplicates = await collection.aggregate(pipeline).to_list(length=1000)
        return duplicates
