HealthHive MVP

Minimal instructions to run the backend, dashboard, and mobile app.

Prerequisites
- Python 3.9+
- Node.js 18+

Backend (FastAPI)
1) Create and activate a virtual environment:
   - cd backend
   - python -m venv venv
   - source venv/bin/activate
2) Install dependencies:
   - pip install -r requirements.txt
3) Environment file:
   - cp .env.example .env
4) (Optional) Seed synthetic data:
   - python seed_data.py
5) Run the API:
   - uvicorn main:app
   - API runs at http://127.0.0.1:8000

Dashboard (HealthHive Dashboard)
1) cd "HealthHive Dashboard"
2) Install dependencies:
   - npm install
3) Environment file:
   - If .env is missing, create it with:
     VITE_API_URL=http://127.0.0.1:8000
4) Run:
   - npm run dev
   - Dashboard runs at http://localhost:3000 (or next available port)

Mobile App (Jagna Health App Prototype)
1) cd "Jagna Health App Prototype"
2) Install dependencies:
   - npm install
3) Environment file:
   - If .env is missing, create it with:
     VITE_API_URL=http://127.0.0.1:8000
4) Run:
   - npm run dev
   - App runs at http://localhost:3001 (or next available port)

Note: If you open the app on another device, replace 127.0.0.1 with your computer's LAN IP in both frontends' .env files.

Workflow Overview (End-to-End)
1) Login on the mobile app (admin/admin123 or BHW credentials).
2) Register a patient using "New Patient".
3) Record a visit for that patient.
4) The dashboard Registry shows the new patient.
5) Overview and Analytics update based on visits and patient data.

Data Storage
- Default DB mode is embedded (Mongita), stored under backend/.mongita.
- To reset demo data, re-run: python seed_data.py
