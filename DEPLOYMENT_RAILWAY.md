# Railway Deployment Guide

Complete step-by-step guide to deploy HealthHive to Railway.

## Prerequisites

- Railway account (sign up at https://railway.app)
- GitHub account (optional but recommended)
- Railway CLI installed

## Step 1: Install Railway CLI

```bash
# macOS/Linux
npm install -g @railway/cli

# Verify installation
railway --version
```

## Step 2: Login to Railway

```bash
railway login
```

This will open your browser for authentication.

## Step 3: Deploy Backend

### 3.1 Create New Project

```bash
cd /Users/soumikbarua/Documents/HealthHive/backend
railway init
```

Select "Create new project" and give it a name: `healthhive-backend`

### 3.2 Add MongoDB Service

```bash
railway add
```

Select "MongoDB" from the list. Railway will provision a MongoDB instance.

### 3.3 Link Environment Variables

Railway automatically sets `MONGO_URL` for the MongoDB service. We need to copy it to our variable name:

```bash
# Get the MongoDB URL
railway variables

# Set our environment variables
railway variables set SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
railway variables set APP_NAME="HealthHive API"
railway variables set APP_VERSION="1.0.0"
railway variables set DATABASE_NAME="healthhive"
railway variables set CORS_ORIGINS="https://healthhive-dashboard.up.railway.app,https://healthhive-mobile.up.railway.app"
```

The `MONGODB_URL` will be automatically available from the MongoDB service.

### 3.4 Create railway.json

```bash
cat > railway.json <<EOF
{
  "build": {
    "builder": "DOCKERFILE",
    "dockerfilePath": "Dockerfile"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port \$PORT",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

### 3.5 Deploy

```bash
railway up
```

This will:
- Build your Docker container
- Deploy to Railway
- Assign a public URL

### 3.6 Get Your Backend URL

```bash
railway domain
```

Copy the URL (e.g., `https://healthhive-backend-production.up.railway.app`)

### 3.7 Seed the Database

```bash
# Connect to your Railway project
railway run python seed_data.py
```

## Step 4: Deploy Dashboard

### 4.1 Update API Endpoint

```bash
cd "/Users/soumikbarua/Documents/HealthHive/HealthHive Dashboard"
```

Create a `.env` file:

```bash
cat > .env <<EOF
VITE_API_URL=https://your-backend-url.up.railway.app
EOF
```

Replace `your-backend-url` with the actual URL from step 3.6.

### 4.2 Create Railway Project

```bash
railway init
```

Select "Create new project" and name it: `healthhive-dashboard`

### 4.3 Set Build Command

```bash
railway variables set BUILD_COMMAND="npm install && npm run build"
railway variables set START_COMMAND="npm run preview -- --host 0.0.0.0 --port \$PORT"
```

Or create `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview -- --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/",
    "healthcheckTimeout": 100
  }
}
```

### 4.4 Deploy

```bash
railway up
```

### 4.5 Get Dashboard URL

```bash
railway domain
```

## Step 5: Deploy Mobile App

### 5.1 Update API Endpoint

```bash
cd "/Users/soumikbarua/Documents/HealthHive/Jagna Health App Prototype"
```

Create `.env`:

```bash
cat > .env <<EOF
VITE_API_URL=https://your-backend-url.up.railway.app
EOF
```

### 5.2 Deploy (same as dashboard)

```bash
railway init
railway up
railway domain
```

## Step 6: Update CORS

Now that you have all three URLs, update the backend CORS:

```bash
cd /Users/soumikbarua/Documents/HealthHive/backend

# Set CORS to include all frontend URLs
railway variables set CORS_ORIGINS="https://your-dashboard-url.up.railway.app,https://your-mobile-url.up.railway.app,http://localhost:5173,http://localhost:5174"
```

## Step 7: Test Everything

### 7.1 Test Backend

```bash
curl https://your-backend-url.up.railway.app/health
```

Should return: `{"status":"healthy","timestamp":...}`

### 7.2 Test Login

```bash
curl -X POST https://your-backend-url.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Should return access token and user data.

### 7.3 Visit Dashboard

Open `https://your-dashboard-url.up.railway.app` in your browser.

Login with:
- Username: `admin`
- Password: `admin123`

### 7.4 Visit Mobile App

Open `https://your-mobile-url.up.railway.app` in your browser or mobile device.

## Monitoring

### View Logs

```bash
# Backend logs
cd /Users/soumikbarua/Documents/HealthHive/backend
railway logs

# Dashboard logs
cd "/Users/soumikbarua/Documents/HealthHive/HealthHive Dashboard"
railway logs
```

### View Metrics

Visit https://railway.app/dashboard and select your project to see:
- CPU usage
- Memory usage
- Network traffic
- Build logs
- Deployment history

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Railway dashboard
2. Select your project
3. Click "Settings" > "Domains"
4. Click "Add Domain"
5. Enter your domain (e.g., `api.healthhive.ph`)
6. Add the CNAME record to your DNS provider

For example:
```
CNAME api.healthhive.ph -> healthhive-backend-production.up.railway.app
CNAME dashboard.healthhive.ph -> healthhive-dashboard-production.up.railway.app
CNAME app.healthhive.ph -> healthhive-mobile-production.up.railway.app
```

## Environment Variables Reference

### Backend

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URL` | MongoDB connection string | Auto-set by Railway |
| `SECRET_KEY` | JWT signing key (32+ chars) | Generated randomly |
| `DATABASE_NAME` | Database name | `healthhive` |
| `CORS_ORIGINS` | Allowed origins | Frontend URLs |
| `DEBUG` | Debug mode | `False` |

### Frontend (Dashboard & Mobile)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://api.healthhive.ph` |

## Troubleshooting

### Build fails

```bash
# Check build logs
railway logs

# Try local build first
docker build -t healthhive-test .
```

### Can't connect to database

```bash
# Check MongoDB is running
railway run mongosh $MONGO_URL --eval "db.version()"

# Verify MONGODB_URL is set
railway variables
```

### CORS errors

Make sure `CORS_ORIGINS` includes your frontend URLs:

```bash
railway variables set CORS_ORIGINS="https://dashboard.example.com,https://app.example.com"
```

### Health check fails

Verify `/health` endpoint works:

```bash
curl https://your-app-url.up.railway.app/health
```

## Scaling

Railway automatically scales based on usage. For production:

1. Upgrade to Pro plan for better performance
2. Enable autoscaling in project settings
3. Consider adding Redis for caching
4. Set up monitoring alerts

## Backup Strategy

### Database Backups

Railway MongoDB includes automatic backups. To manually backup:

```bash
# Export database
railway run mongodump --uri=$MONGO_URL --out=/tmp/backup

# Download backup
scp -r /tmp/backup ./healthhive-backup-$(date +%Y%m%d)
```

### Restore from Backup

```bash
# Upload and restore
railway run mongorestore --uri=$MONGO_URL ./healthhive-backup-20260125
```

## Cost Estimate

Railway pricing (as of 2026):

- **Hobby Plan** (Free): 
  - $5 credit/month
  - 500MB RAM
  - Good for testing

- **Pro Plan** ($20/month):
  - $20 credit + $0.000231/GB-second
  - 8GB RAM max
  - Recommended for production
  - Custom domains
  - Priority support

Estimated monthly cost for HealthHive:
- Backend API: ~$10-15
- Dashboard: ~$5-8  
- Mobile App: ~$5-8
- MongoDB (512MB): ~$5

**Total: ~$25-35/month**

## Security Checklist

- [x] HTTPS enabled (automatic on Railway)
- [ ] Change default passwords
- [ ] Strong SECRET_KEY generated
- [ ] CORS properly configured
- [ ] Database backups enabled
- [ ] Monitoring and alerts set up
- [ ] Audit logs reviewed regularly

## Next Steps

After deployment:

1. Test all features thoroughly
2. Train users on the system
3. Monitor logs for errors
4. Set up automated backups
5. Configure monitoring alerts
6. Review and optimize performance

---

**Deployment Support**: If you encounter issues, check Railway's documentation at https://docs.railway.app or contact support.
