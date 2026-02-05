# HealthHive - Quick Start Guide

**Get HealthHive running in under 10 minutes**

## Prerequisites Check

```bash
# Check Python version (need 3.11+)
python3 --version

# Check Node.js (need 18+)
node --version

# Check npm
npm --version
```

If any are missing, install them first:
- Python: https://www.python.org/downloads/
- Node.js: https://nodejs.org/

## Step 1: Set Up MongoDB (2 minutes)

### Option A: MongoDB Atlas (Recommended - Cloud)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster (M0)
4. Add database user (save username & password!)
5. Allow network access from anywhere (0.0.0.0/0)
6. Get connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```

### Option B: Local MongoDB (macOS)

```bash
# Install via Homebrew
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

## Step 2: Set Up Backend (3 minutes)

```bash
# Navigate to backend
cd "/Users/soumikbarua/Documents/HealthHive/backend"

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Edit .env with your MongoDB URL
# For Atlas: MONGODB_URL=mongodb+srv://username:password@cluster...
# For Local: MONGODB_URL=mongodb://localhost:27017
nano .env  # or use any text editor

# Seed database with test data
python seed_data.py

# Start backend server
uvicorn main:app --reload --port 8000
```

✅ Backend should now be running at http://localhost:8000

Visit http://localhost:8000/docs to see the API!

## Step 3: Test Backend (1 minute)

Open a new terminal and test:

```bash
# Health check
curl http://localhost:8000/health

# Should return: {"status":"healthy","timestamp":...}

# Test login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return access token and user data
```

## Step 4: Set Up Dashboard (2 minutes)

Open a new terminal:

```bash
# Navigate to dashboard
cd "/Users/soumikbarua/Documents/HealthHive/HealthHive Dashboard"

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Dashboard should now be running at http://localhost:5173 or similar

## Step 5: Set Up Mobile App (2 minutes)

Open another new terminal:

```bash
# Navigate to mobile app
cd "/Users/soumikbarua/Documents/HealthHive/Jagna Health App Prototype"

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ Mobile app should now be running at http://localhost:5174 or similar

## Step 6: Login and Explore! (2 minutes)

### Default Credentials:

| Username | Password | Role |
|----------|----------|------|
| `admin` | `admin123` | Administrator |
| `supervisor1` | `super123` | Supervisor |
| `nurse1` | `nurse123` | RHU Nurse |
| `bhw_poblacion_pondol` | `bhw123` | BHW |

### What to Try:

1. **Dashboard** (http://localhost:5173)
   - Login as `admin` / `admin123`
   - View Overview page (municipality stats)
   - Check Analytics → HTN Trends
   - Explore Registry → Patient list

2. **Mobile App** (http://localhost:5174)
   - Login as `bhw_poblacion_pondol` / `bhw123`
   - View Home Dashboard
   - Browse Patients List
   - View Patient Profile
   - Check High-Risk Highlights

3. **API Documentation** (http://localhost:8000/docs)
   - Click "Authorize" button
   - Login to get token
   - Try "GET /api/patients" endpoint
   - Explore other endpoints

## Troubleshooting

### Backend won't start

```bash
# Check MongoDB connection
# Make sure your MONGODB_URL in .env is correct

# Try connecting directly
mongosh "your-mongodb-url"

# Check Python dependencies
pip list | grep fastapi
```

### Frontend won't connect

The frontends may need to be configured to point to the backend. If you see connection errors:

1. Check if backend is running: `curl http://localhost:8000/health`
2. Check browser console for CORS errors
3. Verify backend CORS_ORIGINS in .env includes `http://localhost:5173` and `http://localhost:5174`

### Database is empty

```bash
# Re-run seed script
cd backend
source venv/bin/activate
python seed_data.py
```

### Port already in use

```bash
# Backend (8000)
lsof -ti:8000 | xargs kill -9

# Dashboard (5173)
lsof -ti:5173 | xargs kill -9

# Mobile (5174)
lsof -ti:5174 | xargs kill -9
```

## What's Included

After seeding, your database has:

- **750 patients** with hypertension and/or diabetes
- **3,000+ visit records** spanning 6-12 months
- **33 barangays** across Jagna municipality
- **40 users**:
  - 1 admin
  - 2 supervisors
  - 5 RHU nurses
  - 33 BHWs (one per barangay)
- **10+ medications** with stock levels

## Next Steps

### For Development:
1. Read `backend/README.md` for API documentation
2. Explore the code in `backend/routes/`
3. Check `backend/models/schemas.py` for data models
4. Review clinical validation in `backend/validation.py`

### For Deployment:
1. Read `DEPLOYMENT_RAILWAY.md`
2. Sign up for Railway account
3. Deploy backend + MongoDB
4. Deploy frontends
5. Update CORS origins

### For Production:
1. Change all default passwords
2. Generate new SECRET_KEY
3. Use MongoDB Atlas M10+ (not free tier)
4. Enable HTTPS
5. Set up monitoring
6. Configure backups

## Support

If you get stuck:

1. **Check logs**: Look at terminal output for errors
2. **Check documentation**: See README files in each folder
3. **Check MongoDB**: Make sure it's running and accessible
4. **Check ports**: Make sure 8000, 5173, 5174 are not in use

## Full System Architecture

```
┌─────────────────┐
│  Mobile App PWA │ :5174
│  (BHW Interface)│
└────────┬────────┘
         │
         │ HTTP/REST
         │
         ▼
┌─────────────────┐      ┌──────────────┐
│   Backend API   │◄────►│   MongoDB    │
│    (FastAPI)    │ :8000│  (Database)  │
└────────┬────────┘      └──────────────┘
         │
         │ HTTP/REST
         │
         ▼
┌─────────────────┐
│  Web Dashboard  │ :5173
│ (Supervisor UI) │
└─────────────────┘
```

## Success!

If everything is running, you should have:

- ✅ Backend API at http://localhost:8000
- ✅ API Docs at http://localhost:8000/docs
- ✅ Dashboard at http://localhost:5173
- ✅ Mobile App at http://localhost:5174
- ✅ Database with 750+ patients
- ✅ All endpoints working

**You're ready to develop!** 🎉

---

**Total Setup Time**: ~10 minutes
**Next**: Explore the dashboard and mobile app with the default credentials above!
