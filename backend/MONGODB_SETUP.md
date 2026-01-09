# MongoDB Setup for Windows

You have MongoDB Compass (the GUI) but need MongoDB Server. Here are your options:

## Option 1: Install MongoDB Community Server (Recommended)

1. **Download MongoDB Community Server:**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows x64
   - Download the MSI installer

2. **Install MongoDB:**
   - Run the downloaded MSI file
   - Choose "Complete" installation
   - **IMPORTANT:** Check "Install MongoDB as a Service"
   - **IMPORTANT:** Check "Install MongoDB Compass" (you already have it, but this ensures compatibility)

3. **Verify Installation:**
   - Open Command Prompt as Administrator
   - Run: `net start MongoDB`
   - Or check Services: Windows + R → `services.msc` → Look for "MongoDB Server"

## Option 2: Use MongoDB Atlas (Cloud - Easier)

1. **Sign up for MongoDB Atlas:**
   - Go to: https://www.mongodb.com/atlas
   - Create free account
   - Create a new cluster (free tier)

2. **Get Connection String:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

3. **Update .env file:**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fyp_lost_found?retryWrites=true&w=majority
   ```

## Option 3: Quick Test with Docker (If you have Docker)

```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

## Current Status Check

Run this to test your current setup:
```bash
cd backend
node testConnection.js
```

## Next Steps After MongoDB is Running

1. **Stop the demo server:**
   - The demo server is currently running
   - We'll switch to the real server with MongoDB

2. **Seed the database:**
   ```bash
   cd backend
   npm run seed
   ```

3. **Start the real server:**
   ```bash
   cd backend
   npm run dev
   ```

## MongoDB Compass Connection

Once MongoDB is running, connect MongoDB Compass to:
- **Connection String:** `mongodb://localhost:27017`
- **Database Name:** `fyp_lost_found`

You'll see your collections: `users`, `colleges`, `lostitems`