# MongoDB Setup Options

## Option 1: Install MongoDB Locally (Recommended for Development)

### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Make sure to install MongoDB as a Windows Service
4. After installation, MongoDB should start automatically
5. Test connection: Open Command Prompt and run `mongo` or `mongosh`

### Alternative - Using MongoDB Compass (GUI):
1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Install and connect to `mongodb://localhost:27017`

## Option 2: Use MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/atlas
2. Sign up for a free account
3. Create a new cluster (free tier)
4. Get your connection string
5. Update the MONGO_URI in `.env` file

Example Atlas connection string:
```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fyp_lost_found?retryWrites=true&w=majority
```

## Option 3: Docker (If you have Docker installed)

```bash
docker run --name mongodb -d -p 27017:27017 mongo:latest
```

## Quick Test

After setting up MongoDB, run:
```bash
cd backend
node testConnection.js
```

If successful, you'll see:
✅ MongoDB Connected Successfully!
✅ Database write test successful!
✅ Database read test successful!
✅ Database delete test successful!