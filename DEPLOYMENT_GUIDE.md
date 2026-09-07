# CareerPilot Production Deployment Guide

This guide covers step-by-step instructions to deploy the complete **CareerPilot** full-stack application (Backend API + React Frontend + MongoDB Atlas).

---

## Architecture Overview

- **Database**: MongoDB Atlas (Cloud Managed Database, Free M0 Cluster)
- **Backend API**: Node.js / Express deployed on **Render**, **Railway**, or **AWS/GCP/Docker VPS**
- **Frontend SPA**: Vite + React deployed on **Vercel**, **Netlify**, or **Cloudflare Pages**

---

## Step 1: Set Up MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Click **Build a Database** -> Select **M0 (Free)** tier.
3. Under **Security & Access**:
   - Create a database user with username and strong password (e.g. `careerpilot_user`).
   - Under **Network Access**, click **Add IP Address** -> Select **Allow Access From Anywhere** (`0.0.0.0/0`).
4. Click **Connect** -> **Drivers (Node.js)** and copy your connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/careerpilot?retryWrites=true&w=majority
   ```
   *(Replace `<username>`, `<password>`, and set database name to `careerpilot`)*.

---

## Step 2: Deploy Backend API (Render / Railway)

### Option A: Deploy on Render (Recommended Free Tier)

1. Push your repository to GitHub.
2. Sign in to [Render.com](https://render.com) and click **New +** -> **Web Service**.
3. Connect your GitHub repository.
4. Configure service settings:
   - **Name**: `careerpilot-api`
   - **Root Directory**: `.` (leave default)
   - **Environment**: `Node`
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `node server.js`
   - **Plan**: `Free`
5. Add **Environment Variables**:
   | Variable | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimisations |
   | `PORT` | `5000` | Express listening port |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `A_RANDOM_LONG_SECRET_KEY_MIN_32_CHARS` | Secure key for JWT tokens |
   | `JWT_EXPIRES_IN` | `7d` | Token expiry duration |
   | `CLIENT_URL` | `https://your-frontend.vercel.app` | Frontend production domain (update once deployed) |
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g. `https://careerpilot-api.onrender.com`).
8. Verify it works by opening `https://careerpilot-api.onrender.com/api/health` in your browser.

---

## Step 3: Deploy Frontend (Vercel / Netlify)

### Option A: Deploy on Vercel (Recommended)

1. Sign in to [Vercel.com](https://vercel.com) with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click Edit -> Select `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://careerpilot-api.onrender.com/api` |
   *(Use your deployed backend URL from Step 2 with `/api` suffix)*.
6. Click **Deploy**.
7. Once deployed, copy your production domain (e.g. `https://careerpilot.vercel.app`).
8. **Final Step**: Go back to your Backend on Render and update `CLIENT_URL` to match this frontend domain to ensure CORS requests are allowed.

---

## Step 4: Docker / Single-Host Deployment (Alternative)

If you prefer to run using Docker on a single VPS (DigitalOcean, AWS EC2, Linode):

```bash
# 1. Build the production backend Docker container
docker build -t careerpilot-api:latest .

# 2. Run container with environment variables
docker run -d -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGO_URI="mongodb+srv://..." \
  -e JWT_SECRET="your_secure_jwt_secret" \
  -e CLIENT_URL="https://yourfrontend.com" \
  --name careerpilot-api \
  careerpilot-api:latest
```

Or using `docker-compose`:
```bash
docker-compose up -d
```

---

## Verification Checklist

- [ ] Backend `/api/health` returns `{"status":"healthy","database":"connected"}`.
- [ ] Frontend loads and displays login screen with demo credentials.
- [ ] 1-Click Persona login buttons successfully log in as Admin, Recruiter, and Fresher.
- [ ] Database automatically initialized with demo seed data.
