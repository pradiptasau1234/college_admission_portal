# 🚀 Vercel Deployment Guide for College Admission Portal

This guide provides the complete step-by-step instructions to deploy both the **React Frontend** and **Express Backend API** to **Vercel** as a unified full-stack application on a single free domain.

---

## 📌 How the Vercel Architecture Works

Your project has already been configured for Vercel with:
1. `vercel.json`: Directs API calls to `/api/*` serverless functions and serves the Vite React single-page app for all UI routes.
2. `api/index.js`: Exposes the Express REST API as a Vercel Serverless Function.
3. In-memory / MongoDB Base64 file uploads: Ensures document uploads and the In-App Document Viewer work without needing external AWS S3 buckets.

---

## 📋 Step 1: Set Up Free Cloud MongoDB (MongoDB Atlas)

Because Vercel runs in the cloud, it cannot connect to `localhost:27017` on your computer. You need a free cloud database:

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) and sign up / log in.
2. Create a new cluster &rarr; Choose the **M0 Free** tier.
3. Under **Security &rarr; Database Access**:
   - Click **Add New Database User**.
   - Set Username (e.g., `admin`) and Password (e.g., `CollegeAdmin2026`).
   - Grant role: **Read and write to any database**.
4. Under **Security &rarr; Network Access**:
   - Click **Add IP Address**.
   - Select **Allow Access from Anywhere (`0.0.0.0/0`)** &rarr; Confirm. *(This allows Vercel serverless functions to connect).*
5. Under **Deployment &rarr; Database**:
   - Click **Connect** &rarr; **Drivers (Node.js)**.
   - Copy the connection string. It looks like:
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/college_admission_db?retryWrites=true&w=majority
     ```
   *(Replace `<password>` with the password you created).*

---

## 💾 Step 2: Seed Cloud Database with Demo Accounts (Optional but Recommended)

Before deploying, populate your cloud database with the initial academic branches, admin credentials, and sample applicants:

1. Open `server/.env` and update `MONGODB_URI` with your cloud Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://admin:CollegeAdmin2026@cluster0.xxxxx.mongodb.net/college_admission_db?retryWrites=true&w=majority
   ```
2. Run the seed script:
   ```bash
   cd server
   node src/seed.js
   ```
   *(You should see "Database seeding successfully finished!").*

---

## 🐙 Step 3: Push Code to GitHub

1. Open PowerShell or Terminal in the root project folder:
   ```powershell
   cd C:\Users\pradi\.gemini\antigravity\scratch\college-admission-portal
   ```
2. Initialize git repository:
   ```bash
   git init
   git add .
   git commit -m "Complete College Admission Portal with Vercel configuration"
   ```
3. Create a new empty repository on [GitHub](https://github.com/new) named `college-admission-portal`.
4. Push your code to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/college-admission-portal.git
   git branch -M main
   git push -u origin main
   ```

---

## ⚡ Step 4: Deploy on Vercel

1. Log in to [Vercel](https://vercel.com/) with your GitHub account.
2. In the Vercel dashboard, click **"Add New..." &rarr; "Project"**.
3. Locate `college-admission-portal` under your GitHub repositories and click **Import**.
4. **Configure Project Settings**:
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (Leave as root)
   - **Build and Output Settings:** Already configured automatically via `vercel.json`.
5. **Environment Variables**:
   Expand the **Environment Variables** section and add the following 3 variables:

   | Variable Name | Value |
   |---|---|
   | `MONGODB_URI` | `mongodb+srv://admin:CollegeAdmin2026@cluster0.xxxxx.mongodb.net/college_admission_db?retryWrites=true&w=majority` |
   | `JWT_SECRET` | `super_secret_jwt_token_for_college_swe_project_2026` |
   | `NODE_ENV` | `production` |

6. Click **Deploy**!

---

## 🎉 Verification & Live URL

In about 60 to 90 seconds, Vercel will finish building and provide you with a live domain:
```
https://college-admission-portal-xxxx.vercel.app
```

- **Health check:** `https://your-domain.vercel.app/api/health` should return `{"status": "healthy", "mongoConnection": "connected"}`.
- **Admin Login:** `admin@iem.edu` / `Admin@123`
- **Applicant Demo:** `rohan.sharma@example.com` / `User@123`
- **1-Click Buttons:** Use the quick-fill buttons on `/login` to test on your live deployed site!
