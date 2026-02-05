# MongoDB Setup Guide for HealthHive

Since MongoDB is not installed locally, you have two options:

## Option 1: Use MongoDB Atlas (Recommended for Testing/Production)

MongoDB Atlas is a free cloud database service - perfect for development and production.

### Steps:

1. **Create a free account** at https://www.mongodb.com/cloud/atlas

2. **Create a free cluster** (M0 - Free tier)
   - Choose a cloud provider (AWS, Google Cloud, or Azure)
   - Select a region close to Philippines (Singapore recommended)
   - Click "Create"

3. **Set up database access**
   - Go to "Database Access" in the left menu
   - Click "Add New Database User"
   - Username: `healthhive`
   - Password: Generate a secure password (copy it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Set up network access**
   - Go to "Network Access" in the left menu
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP addresses
   - Click "Confirm"

5. **Get your connection string**
   - Go to "Database" in the left menu
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - **Select Driver**: `Python`
   - **Select Version**: `3.6 or later` (or most recent option)
   - Copy the connection string (looks like):
     ```
     mongodb+srv://healthhive:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password

6. **Update backend/.env file**
   ```bash
   cd /Users/soumikbarua/Documents/HealthHive/backend
   nano .env
   ```
   
   Update the MONGODB_URL line:
   ```
   MONGODB_URL=mongodb+srv://healthhive:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   DATABASE_NAME=healthhive
   ```

7. **Test connection and seed data**
   ```bash
   source venv/bin/activate
   python seed_data.py
   ```

## Option 2: Install MongoDB Locally (macOS)

### Using Homebrew:

```bash
# Install MongoDB Community Edition
brew tap mongodb/brew
brew install mongodb-community@7.0

# Start MongoDB as a service
brew services start mongodb-community@7.0

# Verify it's running
mongosh --eval "db.version()"
```

### After installation:

Your MongoDB will run on the default: `mongodb://localhost:27017`

The default `.env` file already has this configured.

## Next Steps

Once MongoDB is set up:

```bash
cd /Users/soumikbarua/Documents/HealthHive/backend
source venv/bin/activate

# Seed the database with test data
python seed_data.py

# Start the backend server
uvicorn main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see the API documentation!

## Troubleshooting

### Connection timeout
- Check your internet connection
- Verify IP whitelist in MongoDB Atlas Network Access
- Confirm connection string is correct

### Authentication failed
- Verify username and password
- Make sure you replaced `<password>` with actual password
- Password should not contain special characters without URL encoding

### Database not found
- The database will be created automatically when you run seed_data.py
- No need to create it manually

## Production Checklist

For production deployment:
- [ ] Use MongoDB Atlas M10+ cluster (not free tier)
- [ ] Enable backup in Atlas
- [ ] Restrict network access to specific IPs only
- [ ] Use strong passwords
- [ ] Enable encryption at rest
- [ ] Set up monitoring alerts
