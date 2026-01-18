# Fix Vercel Deployment for Instrumentation Shell API

## 🔴 Problem

Vercel is building from old code with `seed: false` (boolean) but the type expects `number | null`.

**The fix is already pushed** to: `https://github.com/FractiAI/Instrumentation-Shell-API.git` (commit `e704032`)

## ✅ Solution: Update Vercel Project Configuration

Since `instrumentation-shell-api` is a **separate git repository** (not just a directory), Vercel should deploy **directly from that repository**.

### Option 1: Update Vercel Project to Use Instrumentation-Shell-API Repository (Recommended)

1. **Go to Vercel Dashboard:** https://vercel.com/dashboard
2. **Find your Instrumentation Shell API project**
3. **Go to Settings → Git**
4. **Disconnect** the current repository
5. **Connect** to: `https://github.com/FractiAI/Instrumentation-Shell-API.git`
6. **Root Directory:** Leave empty (or set to `/`)
7. **Save and redeploy**

This ensures Vercel always deploys from the latest commit of the Instrumentation-Shell-API repository.

### Option 2: Trigger Manual Redeploy (Quick Fix)

1. **Go to Vercel Dashboard**
2. **Find your Instrumentation Shell API project**
3. **Go to Deployments tab**
4. **Click "Redeploy"** on the latest deployment
5. **Or:** Go to Settings → Git → **"Redeploy"**

This will force Vercel to rebuild from the latest code.

### Option 3: Create New Vercel Project from Instrumentation-Shell-API Repository

If you can't update the existing project:

1. **Go to:** https://vercel.com/new
2. **Import:** `https://github.com/FractiAI/Instrumentation-Shell-API.git`
3. **Configure:**
   - Project Name: `instrumentation-shell-api`
   - Framework: Next.js
   - Root Directory: `/` (leave empty)
4. **Environment Variables:**
   - `INSTRUMENTATION_API_KEY` = (your API key)
   - `NODE_ENV` = `production`
5. **Deploy**

## 🔍 Verify the Fix is Applied

After redeploy, check the build logs. You should see:
- ✅ No TypeScript errors about `seed: false`
- ✅ Build succeeds
- ✅ Status endpoint works: `https://your-api.vercel.app/api/instrumentation/status`

## 📝 Current Status

- ✅ Fix committed: `e704032` - "Fix TypeScript error: change seed from boolean false to null"
- ✅ Fix pushed to: `https://github.com/FractiAI/Instrumentation-Shell-API.git`
- ⏳ Waiting for Vercel to pick up latest commit

---

**Quick Action:** Go to Vercel Dashboard → Find Instrumentation Shell API project → Click "Redeploy"
