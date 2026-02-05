"""
Data Seeding Script for HealthHive Platform
Generates realistic synthetic data for testing and demonstration
- 33 Barangays in Jagna
- 500-1000 patients with realistic demographics
- Visit histories spanning 3-12 months
- Stock levels for medications
- BHW/nurse user accounts
"""

import asyncio
from datetime import datetime, timedelta
import random
from auth import hash_password
from config import settings
from database import connect_to_mongo, close_mongo_connection, get_database
from models.schemas import (
    RoleEnum, SexEnum, RiskLevel, ControlStatus, 
    VisitType, DiagnosisType, SyncStatus, ClusterType
)

# Jagna Barangays (all 33)
BARANGAYS = {
    "coastal": [
        "Alejawan", "Balili", "Boctol", "Buyog", "Canjulao", 
        "Looc", "Naatang", "Nausok", "Poblacion (Pondol)", "Tubod Mar"
    ],
    "upland": [
        "Bunga Ilaya", "Bunga Mar", "Cabungaan", "Calabacita", "Cambugason",
        "Can-ipol", "Cantagay", "Cantuyoc", "Can-uba", "Can-upao",
        "Faraon", "Ipil", "Kinagbaan", "Laca", "Larapan",
        "Lonoy", "Malbog", "Mayana", "Odiong", "Pagina",
        "Pangdan", "Tejero", "Tubod Monte"
    ]
}

ALL_BARANGAYS = BARANGAYS["coastal"] + BARANGAYS["upland"]

# Philippines-specific data
FILIPINO_FIRST_NAMES_FEMALE = [
    "Synth-Maria", "Synth-Ana", "Synth-Rosa", "Synth-Elena", "Synth-Carmen",
    "Synth-Luz", "Synth-Gloria", "Synth-Teresa", "Synth-Josefa", "Synth-Catalina",
    "Synth-Mercedes", "Synth-Leonor", "Synth-Esperanza", "Synth-Remedios",
    "Synth-Angelita", "Synth-Beatriz", "Synth-Corazon", "Synth-Dolores",
    "Synth-Felicia", "Synth-Isabel"
]

FILIPINO_FIRST_NAMES_MALE = [
    "Synth-Jose", "Synth-Juan", "Synth-Pedro", "Synth-Antonio", "Synth-Francisco",
    "Synth-Carlos", "Synth-Manuel", "Synth-Miguel", "Synth-Ramon", "Synth-Fernando",
    "Synth-Roberto", "Synth-Emilio", "Synth-Eduardo", "Synth-Ricardo",
    "Synth-Salvador", "Synth-Alberto", "Synth-Rogelio", "Synth-Ernesto",
    "Synth-Felipe", "Synth-Vicente"
]

FILIPINO_LAST_NAMES = [
    "Mock-Reyes", "Mock-Santos", "Mock-Garcia", "Mock-Cruz", "Mock-Gonzales",
    "Mock-Ramos", "Mock-Flores", "Mock-Mendoza", "Mock-Torres", "Mock-Lopez",
    "Mock-Perez", "Mock-Aquino", "Mock-Castillo", "Mock-Fernandez",
    "Mock-Villanueva", "Mock-Santiago", "Mock-Ramirez", "Mock-Hernandez",
    "Mock-Mercado", "Mock-Bautista", "Mock-Rivera", "Mock-Diaz", "Mock-Morales",
    "Mock-Valdez", "Mock-Gutierrez", "Mock-Cortez", "Mock-Medina"
]

OCCUPATIONS = [
    "Farmer / Agricultural Worker",
    "Unemployed / Seeking Work",
    "Vendor / Market Trader",
    "Fisherman / Fish Vendor",
    "Health Worker / Barangay Worker",
    "Transport / Driver (Tricycle/Cargo)",
    "Homemaker / Housewife",
    "Teacher / Educator",
    "Government Employee / Officer",
    "Livestock / Poultry Raiser",
    "Artisan / Calamay / Food Processor",
    "Port / Cargo Handler / Dock Worker"
]

MEDICATIONS = {
    "antihypertensive": [
        {"name": "Amlodipine", "dosages": ["5mg", "10mg"]},
        {"name": "Losartan", "dosages": ["50mg", "100mg"]},
        {"name": "Atenolol", "dosages": ["25mg", "50mg"]},
        {"name": "Hydrochlorothiazide", "dosages": ["12.5mg", "25mg"]},
    ],
    "antidiabetic": [
        {"name": "Metformin", "dosages": ["500mg", "850mg"]},
        {"name": "Glimepiride", "dosages": ["1mg", "2mg", "4mg"]},
        {"name": "Insulin", "dosages": ["10 units", "20 units"]},
    ],
    "other": [
        {"name": "Aspirin", "dosages": ["80mg"]},
        {"name": "Simvastatin", "dosages": ["20mg", "40mg"]},
        {"name": "Atorvastatin", "dosages": ["10mg", "20mg"]},
    ]
}

def generate_patient_id(count: int) -> str:
    """Generate unique patient ID"""
    return f"JAG-{count + 1:06d}"

def generate_user_id(role: str, count: int) -> str:
    """Generate user ID"""
    role_prefix = {
        RoleEnum.BHW.value: "BHW",
        RoleEnum.RHU_NURSE.value: "NURSE",
        RoleEnum.SUPERVISOR.value: "SUP",
        RoleEnum.ADMIN.value: "ADMIN"
    }
    return f"{role_prefix.get(role, 'USER')}-{count + 1:03d}"

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate BMI"""
    return round(weight_kg / ((height_cm / 100) ** 2), 1)

def generate_bp_reading(has_htn: bool, controlled: bool):
    """Generate realistic BP reading"""
    if has_htn:
        if controlled:
            systolic = random.randint(120, 139)
            diastolic = random.randint(75, 89)
        else:
            systolic = random.randint(140, 180)
            diastolic = random.randint(90, 110)
    else:
        systolic = random.randint(110, 130)
        diastolic = random.randint(70, 85)
    
    return systolic, diastolic

def generate_glucose_reading(has_dm: bool, controlled: bool, glucose_type: str):
    """Generate realistic glucose reading"""
    if has_dm:
        if controlled:
            if glucose_type == "Fasting":
                glucose = random.randint(90, 125)
            else:
                glucose = random.randint(120, 199)
        else:
            if glucose_type == "Fasting":
                glucose = random.randint(126, 250)
            else:
                glucose = random.randint(200, 350)
    else:
        if glucose_type == "Fasting":
            glucose = random.randint(70, 100)
        else:
            glucose = random.randint(90, 140)
    
    return glucose

def generate_ph_phone():
    """Generate realistic Philippine mobile number"""
    prefixes = ['0917', '0918', '0919', '0920', '0921', '0922', '0923', '0924', '0925', 
                '0926', '0927', '0928', '0929', '0905', '0906', '0915', '0916', '0935', 
                '0936', '0937', '0945', '0953', '0954', '0955', '0956', '0965', '0966', 
                '0967', '0975', '0976', '0977', '0978', '0979', '0995', '0996', '0997']
    return f"{random.choice(prefixes)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"

async def seed_barangays(db):
    """Seed barangay data"""
    print("Seeding barangays...")
    
    barangays = []
    for cluster_type, names in BARANGAYS.items():
        for name in names:
            barangay = {
                "barangay_id": f"BRGY-{len(barangays) + 1:03d}",
                "name": name,
                "cluster": cluster_type,
                "stats": {
                    "total_population": random.randint(800, 5000),
                    "total_households": random.randint(150, 1000),
                    "adult_population": random.randint(400, 2500)
                },
                "assigned_bhws": [],  # Will be filled when creating users
                "assigned_nurses": [],
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            barangays.append(barangay)
    
    await db.barangays.delete_many({})  # Clear existing
    await db.barangays.insert_many(barangays)
    print(f"✓ Seeded {len(barangays)} barangays")
    
    return barangays

async def seed_users(db, barangays):
    """Seed user accounts"""
    print("Seeding users...")
    
    users = []
    
    # Create admin
    users.append({
        "user_id": "ADMIN-001",
        "username": "admin",
        "email": "admin@healthhive.ph",
        "hashed_password": hash_password("admin123"),
        "full_name": "Synthetic Admin",
        "contact": "+63 917 123 4567",
        "role": RoleEnum.ADMIN.value,
        "assigned_barangays": ALL_BARANGAYS,
        "digital_literacy_level": "High",
        "training_records": [],
        "is_active": True,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    })
    
    # Create supervisors (2)
    for i in range(2):
        users.append({
            "user_id": generate_user_id(RoleEnum.SUPERVISOR.value, i),
            "username": f"supervisor{i+1}",
            "email": f"supervisor{i+1}@healthhive.ph",
            "hashed_password": hash_password("super123"),
            "full_name": f"{random.choice(FILIPINO_FIRST_NAMES_MALE)} {random.choice(FILIPINO_LAST_NAMES)}",
            "contact": generate_ph_phone(),
            "role": RoleEnum.SUPERVISOR.value,
            "assigned_barangays": ALL_BARANGAYS,
            "digital_literacy_level": "High",
            "training_records": [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    # Create RHU nurses (5) - each covering multiple barangays
    barangay_chunks = [ALL_BARANGAYS[i:i+7] for i in range(0, len(ALL_BARANGAYS), 7)]
    for i in range(min(5, len(barangay_chunks))):
        users.append({
            "user_id": generate_user_id(RoleEnum.RHU_NURSE.value, i),
            "username": f"nurse{i+1}",
            "email": f"nurse{i+1}@healthhive.ph",
            "hashed_password": hash_password("nurse123"),
            "full_name": f"{random.choice(FILIPINO_FIRST_NAMES_FEMALE)} {random.choice(FILIPINO_LAST_NAMES)}",
            "contact": generate_ph_phone(),
            "role": RoleEnum.RHU_NURSE.value,
            "assigned_barangays": barangay_chunks[i] if i < len(barangay_chunks) else ALL_BARANGAYS[:5],
            "digital_literacy_level": random.choice(["Medium", "High"]),
            "training_records": [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    # Create BHWs (33 - one per barangay minimum)
    for i, barangay in enumerate(ALL_BARANGAYS):
        users.append({
            "user_id": generate_user_id(RoleEnum.BHW.value, i),
            "username": f"bhw_{barangay.lower().replace(' ', '_').replace('(', '').replace(')', '')}",
            "email": f"bhw{i+1}@healthhive.ph",
            "hashed_password": hash_password("bhw123"),
            "full_name": f"{random.choice(FILIPINO_FIRST_NAMES_FEMALE)} {random.choice(FILIPINO_LAST_NAMES)}",
            "contact": generate_ph_phone(),
            "role": RoleEnum.BHW.value,
            "assigned_barangays": [barangay],
            "digital_literacy_level": random.choice(["Low", "Medium", "High"]),
            "training_records": [],
            "is_active": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    await db.users.delete_many({})
    await db.users.insert_many(users)
    print(f"✓ Seeded {len(users)} users (1 admin, 2 supervisors, 5 nurses, 33 BHWs)")
    
    return users

async def seed_patients(db, num_patients=750):
    """Seed patient data"""
    print(f"Seeding {num_patients} patients...")
    
    patients = []
    now = datetime.utcnow()
    
    for i in range(num_patients):
        # Demographics
        sex = random.choice([SexEnum.MALE.value, SexEnum.FEMALE.value])
        first_name = random.choice(FILIPINO_FIRST_NAMES_FEMALE if sex == "Female" else FILIPINO_FIRST_NAMES_MALE)
        middle_name = random.choice(FILIPINO_FIRST_NAMES_FEMALE + FILIPINO_FIRST_NAMES_MALE)
        last_name = random.choice(FILIPINO_LAST_NAMES)
        
        # Age distribution: 20% ages 40-50, 50% ages 50-65, 30% ages 65+
        age_group = random.choices([0, 1, 2], weights=[20, 50, 30])[0]
        if age_group == 0:
            age = random.randint(40, 50)
        elif age_group == 1:
            age = random.randint(51, 65)
        else:
            age = random.randint(66, 85)
        
        birth_year = now.year - age
        dob = f"{random.randint(1,28):02d}/{random.randint(1,12):02d}/{birth_year}"
        
        barangay = random.choice(ALL_BARANGAYS)
        
        # Condition assignment (HTN prevalence ~20%, DM ~8%)
        has_htn = random.random() < 0.20
        has_dm = random.random() < 0.08
        
        conditions = []
        if has_htn:
            conditions.append("Hypertension")
        if has_dm:
            conditions.append("Diabetes Mellitus Type 2")
        
        # Skip if no conditions (we want chronic disease patients)
        if not conditions:
            continue
        
        # Risk level distribution
        risk_level = random.choices(
            [RiskLevel.NORMAL.value, RiskLevel.ELEVATED.value, RiskLevel.HIGH.value, RiskLevel.VERY_HIGH.value],
            weights=[40, 35, 20, 5]
        )[0]
        
        patient = {
            "patient_id": generate_patient_id(i),
            "first_name": first_name,
            "middle_name": middle_name,
            "last_name": last_name,
            "date_of_birth": dob,
            "age": age,
            "sex": sex,
            "barangay": barangay,
            "purok": f"Purok {random.randint(1, 7)}",
            "address": f"Purok {random.randint(1, 7)}, {barangay}",
            "contact": generate_ph_phone() if random.random() > 0.3 else None,
            "occupation": random.choice(OCCUPATIONS),
            "education": random.choices(["Elementary", "High School", "College"], weights=[40, 45, 15])[0],
            "marital_status": random.choices(["Single", "Married", "Widowed", "Separated"], weights=[10, 70, 15, 5])[0],
            "conditions": conditions,
            "risk_level": risk_level,
            "consent_records": [{
                "consent_type": "data_collection",
                "status": True,
                "timestamp": now - timedelta(days=random.randint(1, 365)),
                "recorded_by": f"BHW-{random.randint(1, 33):03d}"
            }],
            "created_at": now - timedelta(days=random.randint(30, 365)),
            "created_by": f"BHW-{random.randint(1, 33):03d}",
            "updated_at": now - timedelta(days=random.randint(0, 30)),
            "updated_by": f"BHW-{random.randint(1, 33):03d}",
            "is_active": True
        }
        
        patients.append(patient)
    
    await db.patients.delete_many({})
    await db.patients.insert_many(patients)
    print(f"✓ Seeded {len(patients)} patients with chronic conditions")
    
    return patients

async def seed_visits(db, patients):
    """Seed visit history for patients"""
    print("Seeding visit histories...")
    
    visits = []
    now = datetime.utcnow()
    visit_count = 0
    
    for patient in patients:
        # Each patient gets 2-8 visits over the past 6-12 months
        num_visits = random.randint(2, 8)
        days_back = random.randint(180, 365)
        
        has_htn = "Hypertension" in patient["conditions"]
        has_dm = any("Diabetes" in c for c in patient["conditions"])
        
        # Determine if patient is generally controlled or not
        generally_controlled = random.random() < 0.6  # 60% controlled
        
        for v in range(num_visits):
            visit_date = now - timedelta(days=days_back - (v * (days_back // num_visits)))
            
            # Some variation in control status over time
            is_controlled = generally_controlled if random.random() > 0.2 else not generally_controlled
            
            # Generate vitals
            weight = random.uniform(50, 95)
            height = random.uniform(145, 175)
            bmi = calculate_bmi(weight, height)
            
            vitals = {
                "weight": round(weight, 1),
                "height": round(height, 0),
                "bmi": bmi
            }
            
            # BP if HTN
            if has_htn:
                systolic, diastolic = generate_bp_reading(has_htn, is_controlled)
                vitals["systolic"] = systolic
                vitals["diastolic"] = diastolic
            
            # Glucose if DM
            if has_dm:
                glucose_type = random.choice(["Random", "Fasting"])
                glucose = generate_glucose_reading(has_dm, is_controlled, glucose_type)
                vitals["glucose"] = glucose
                vitals["glucose_type"] = glucose_type
            
            # Diagnosis
            if has_htn and has_dm:
                diagnosis = DiagnosisType.BOTH.value
            elif has_htn:
                diagnosis = DiagnosisType.HTN.value
            else:
                diagnosis = DiagnosisType.DM.value
            
            # Control status
            control_status = ControlStatus.CONTROLLED.value if is_controlled else ControlStatus.UNCONTROLLED.value
            
            # Medications
            medications = []
            if has_htn:
                med_choice = random.choice(MEDICATIONS["antihypertensive"])
                medications.append({
                    "name": med_choice["name"],
                    "dosage": random.choice(med_choice["dosages"]),
                    "quantity": random.choice([30, 60, 90]),
                    "instructions": "Take once daily"
                })
            
            if has_dm:
                med_choice = random.choice(MEDICATIONS["antidiabetic"])
                medications.append({
                    "name": med_choice["name"],
                    "dosage": random.choice(med_choice["dosages"]),
                    "quantity": random.choice([30, 60, 90]),
                    "instructions": "Take with meals"
                })
            
            # Next visit date
            if is_controlled:
                next_visit_date = visit_date + timedelta(weeks=12)
                next_visit_reason = "Routine follow-up"
            else:
                next_visit_date = visit_date + timedelta(weeks=random.choice([2, 4]))
                next_visit_reason = "Monitor uncontrolled condition"
            
            visit = {
                "visit_id": f"VISIT-{visit_count + 1:08d}",
                "patient_id": patient["patient_id"],
                "visit_type": VisitType.FOLLOW_UP.value if v > 0 else VisitType.SCREENING.value,
                "visit_date": visit_date,
                "vitals": vitals,
                "diagnosis": diagnosis,
                "risk_tier": patient["risk_level"],
                "control_status": control_status,
                "medications_dispensed": medications,
                "next_visit_date": next_visit_date,
                "next_visit_reason": next_visit_reason,
                "complications_noted": random.choice([None, None, None, "Mild headache", "Dizziness"]),
                "clinical_notes": random.choice([None, None, "Patient compliant with medication", "Advised lifestyle modification"]),
                "recorded_by": f"BHW-{random.randint(1, 33):03d}",
                "recorded_by_role": RoleEnum.BHW.value,
                "sync_status": SyncStatus.SYNCED.value,
                "synced_at": visit_date,
                "created_at": visit_date,
                "updated_at": visit_date
            }
            
            visits.append(visit)
            visit_count += 1
    
    await db.visits.delete_many({})
    await db.visits.insert_many(visits)
    print(f"✓ Seeded {len(visits)} visits")
    
    return visits

async def seed_medication_stock(db):
    """Seed medication inventory"""
    print("Seeding medication stock...")
    
    medications = []
    
    all_meds = MEDICATIONS["antihypertensive"] + MEDICATIONS["antidiabetic"] + MEDICATIONS["other"]
    
    for i, med_data in enumerate(all_meds):
        stock_levels = []
        
        # Create stock level for each barangay
        for barangay in random.sample(ALL_BARANGAYS, random.randint(20, 33)):
            stock_levels.append({
                "barangay": barangay,
                "current_quantity": random.randint(500, 5000),
                "reorder_threshold": 1000,
                "unit": "tablets"
            })
        
        medication = {
            "medication_id": f"MED-{i + 1:03d}",
            "name": med_data["name"],
            "medicine_type": "antihypertensive" if med_data in MEDICATIONS["antihypertensive"] else 
                            "antidiabetic" if med_data in MEDICATIONS["antidiabetic"] else "other",
            "stock_levels": stock_levels,
            "total_dispensed_this_month": random.randint(100, 1000),
            "average_monthly_consumption": random.uniform(200, 800),
            "last_updated": datetime.utcnow()
        }
        
        medications.append(medication)
    
    await db.medication_stock.delete_many({})
    await db.medication_stock.insert_many(medications)
    print(f"✓ Seeded {len(medications)} medications with stock levels")
    
    return medications

async def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("HealthHive Data Seeding Script")
    print("="*60 + "\n")
    
    await connect_to_mongo()
    db = get_database()
    
    try:
        # Seed in order
        barangays = await seed_barangays(db)
        users = await seed_users(db, barangays)
        patients = await seed_patients(db, num_patients=750)
        visits = await seed_visits(db, patients)
        medications = await seed_medication_stock(db)
        
        print("\n" + "="*60)
        print("✓ Seeding Complete!")
        print("="*60)
        print(f"\nSummary:")
        print(f"  - Barangays: {len(barangays)}")
        print(f"  - Users: {len(users)}")
        print(f"  - Patients: {len(patients)}")
        print(f"  - Visits: {len(visits)}")
        print(f"  - Medications: {len(medications)}")
        print(f"\nDefault credentials:")
        print(f"  Admin: admin / admin123")
        print(f"  Supervisor: supervisor1 / super123")
        print(f"  Nurse: nurse1 / nurse123")
        print(f"  BHW: bhw_poblacion_pondol / bhw123")
        print("\n")
        
    except Exception as e:
        print(f"\n✗ Error during seeding: {e}")
        raise
    finally:
        await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(main())
