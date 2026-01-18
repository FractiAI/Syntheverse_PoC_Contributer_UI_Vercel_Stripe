# How to Find/Create Instrumentation Shell API on Vercel

## 🔍 Where to Look

The Instrumentation Shell API needs to be a **separate Vercel project** because it's in a subdirectory. Here's how to find it or create it:

---

## Step 1: Check Your Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Look for these project names:**
   - `instrumentation-shell-api`
   - `syntheverse-instrumentation-api`
   - Any project linked to repository: `Syntheverse_PoC_Contributer_UI_Vercel_Stripe` with **Root Directory** set to `instrumentation-shell-api`

3. **Check Project Settings:**
   - For each project, go to **Settings** → **General**
   - Look for **Root Directory** - it should say `instrumentation-shell-api`

---

## Step 2: If Project Doesn't Exist - Create It

If you can't find the project, create a new one:

### Option A: Via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard

2. **Click "Add New..." → "Project"**

3. **Import Git Repository:**
   - Select: `Syntheverse_PoC_Contributer_UI_Vercel_Stripe` (same repo as main project)

4. **Configure Project:**
   - **Project Name:** `instrumentation-shell-api`
   - **Framework:** Next.js (auto-detected)
   - **Root Directory:** ⚠️ **CRITICAL** - Click "Edit" and enter: `instrumentation-shell-api`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

5. **Environment Variables** (Add before deploying):
   - `INSTRUMENTATION_API_KEY` = (generate a secure key)
   - `NODE_ENV` = `production`
   - (Optional) `AUTHORIZED_CALLER_ORIGINS` = `https://your-main-app.vercel.app`
   - (Optional) `ENABLE_ORIGIN_CHECK` = `false`

6. **Deploy**

---

### Option B: Via Vercel CLI

1. **Install Vercel CLI** (if not installed):
   ```bash
   npm i -g vercel
   ```

2. **Login:**
   ```bash
   cd instrumentation-shell-api
   vercel login
   ```

3. **Link Project:**
   ```bash
   vercel link
   ```
   - Create new project
   - Project name: `instrumentation-shell-api`
   - **Root Directory:** Leave default or set to current directory

4. **Set Environment Variables:**
   ```bash
   vercel env add INSTRUMENTATION_API_KEY production
   # Paste your API key when prompted
   
   vercel env add NODE_ENV production
   # Enter: production
   ```

5. **Deploy:**
   ```bash
   vercel --prod
   ```

---

## Step 3: Verify Deployment

After deployment, test the API:

### Status Endpoint (Public):
```bash
curl https://your-project-name.vercel.app/api/instrumentation/status
```

**Expected Response:**
```json
{
  "success": true,
  "status": "active",
  "version": "1.0.0",
  "octave": "instrumentation-core"
}
```

---

## 📋 Important Notes

1. **Separate Project Required:**
   - The Instrumentation Shell API is in a subdirectory
   - It needs its own Vercel project with Root Directory set to `instrumentation-shell-api`
   - It's **NOT** the same project as your main Syntheverse app

2. **Project Name Search:**
   - Look for: `instrumentation-shell-api`
   - Or check all projects linked to `Syntheverse_PoC_Contributer_UI_Vercel_Stripe` repository
   - Check which ones have Root Directory = `instrumentation-shell-api`

3. **Build Issues:**
   - If the project exists but build failed, check:
     - Project Settings → Deployments → Latest deployment logs
     - Verify `package.json` exists in `instrumentation-shell-api/` directory
     - Test build locally: `cd instrumentation-shell-api && npm install && npm run build`

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Create New Project:** https://vercel.com/new
- **GitHub Repository:** https://github.com/FractiAI/Syntheverse_PoC_Contributer_UI_Vercel_Stripe

---

## ✅ Checklist

- [ ] Checked Vercel Dashboard for project named `instrumentation-shell-api`
- [ ] Checked all projects linked to `Syntheverse_PoC_Contributer_UI_Vercel_Stripe` repo
- [ ] If not found, created new project with Root Directory = `instrumentation-shell-api`
- [ ] Set environment variables (`INSTRUMENTATION_API_KEY`, `NODE_ENV`)
- [ ] Deployment succeeded
- [ ] Status endpoint returns `{"success": true, "status": "active"}`

---

**If you still can't find it, it may not have been deployed yet. Follow the steps above to create it.**
