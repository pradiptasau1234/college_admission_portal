# 🌐 Netlify Deployment Guide for College Admission Portal

This guide explains how to deploy your full-stack MERN College Admission Portal to **Netlify** using **Netlify Functions (Serverless Node.js)** and **Vite React**.

---

## 🏗️ How Netlify Architecture Works in Your Project

1. **Frontend (Vite + React):** Built from `client/` and published to `client/dist`.
2. **Backend REST API (Express):** Automatically converted into a Netlify Serverless Function via [netlify/functions/api.js](file:///C:/Users/pradi/.gemini/antigravity/scratch/college-admission-portal/netlify/functions/api.js) and `serverless-http`.
3. **Redirect Rules ([netlify.toml](file:///C:/Users/pradi/.gemini/antigravity/scratch/college-admission-portal/netlify.toml)):**
   - Directs all `/api/*` network requests to `/.netlify/functions/api/*`.
   - Directs all single-page application routes (`/applicant`, `/admin`, `/login`, etc.) to `/index.html` (prevents 404 on page refresh).

---

## 📋 Step 1: Ensure You Have a Free Cloud MongoDB Database

Because Netlify serverless functions run in the cloud, they connect to a cloud database rather than `localhost:27017`:

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) &rarr; Create a free **M0 cluster**.
2. Under **Network Access**: Add IP address `0.0.0.0/0` (Allow access from anywhere).
3. Under **Database Access**: Create a user and password (e.g. `admin` / `CollegeAdmin2026`).
4. Copy your connection URI:
   ```
   mongodb+srv://admin:CollegeAdmin2026@cluster0.xxxxx.mongodb.net/college_admission_db?retryWrites=true&w=majority
   ```

---

## 🐙 Step 2: Push Your Code to GitHub

Open PowerShell in your project directory:
```powershell
cd "C:\Users\pradi\.gemini\antigravity\scratch\college-admission-portal"
```

Initialize git and push to GitHub:
```powershell
git init
git add .
git commit -m "Full-stack College Admission Portal with Netlify configuration"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/college-admission-portal.git
git branch -M main
git push -u origin main
```

---

## 🚀 Step 3: Deploy on Netlify in 1-Click

1. Open [Netlify Dashboard](https://app.netlify.com/) and sign in with GitHub.
2. Click **"Add new site"** &rarr; **"Import an existing project"**.
3. Choose **GitHub** and authorize Netlify to access your repositories.
4. Select your **`college-admission-portal`** repository.
5. **Netlify Build Settings:** (These are automatically detected from `netlify.toml`):
   - **Base directory:** `./` (Leave as root)
   - **Build command:** `cd client && npm install && npm run build`
   - **Publish directory:** `client/dist`
   - **Functions directory:** `netlify/functions`
6. **Environment Variables:**
   Click **"Add environment variables"** and input the following 3 variables:

   | Key | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string from Step 1 |
   | `JWT_SECRET` | `super_secret_jwt_token_for_college_swe_project_2026` |
   | `NODE_ENV` | `production` |

7. Click **Deploy site**!

---

## 🎉 Verification & Live Production URL

Netlify will build your project in ~60-90 seconds and give you a free production domain:
```
https://<your-custom-name>.netlify.app
```

- **API Health Check:** `https://your-site.netlify.app/api/health`
- **Admin Login:** `admin@iem.edu` / `Admin@123`
- **Applicant Demo:** `rohan.sharma@example.com` / `User@123`
- **1-Click Testing:** Use the quick-fill buttons on `/login` to test on your live deployed website!
