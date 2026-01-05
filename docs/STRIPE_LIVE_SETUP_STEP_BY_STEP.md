# Stripe Live Mode Setup - Step-by-Step Guide

## Current Status

✅ **Publishable Key:** (Set in Vercel environment variables)  
✅ **Secret Key:** (Set in Vercel environment variables)

---

## Step 1: Get Your Secret Key (Standard Key is Fine)

### Option A: Use Standard Secret Key (Recommended for Now)

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/
   - Make sure you're in **"Live mode"** (toggle in top right should say "Live mode")

2. **Navigate to API Keys**
   - Click **"Developers"** in the left sidebar
   - Click **"API keys"**
   - Or go directly: https://dashboard.stripe.com/apikeys

3. **Get the Secret Key**
   - You'll see two keys:
     - **Publishable key** (you already have this: `pk_live_...`)
     - **Secret key** (starts with `sk_live_...`)
   - Under **"Secret key"** section, click **"Reveal live key"** button
   - Copy the entire key (starts with `sk_live_...`)
   - ⚠️ **Keep this secret!** Never share it publicly

**✅ You'll get:** `sk_live_...` (copy this entire key)

---

### Option B: Create Restricted Key (Advanced - Optional)

If you want extra security with a restricted key:

1. **Still in API Keys section**
   - Click **"Create restricted key"** button (top right)

2. **Configure Restrictions**
   - **Name:** "Syntheverse PoC Production" (or any name you like)
   - **Permissions:** Select:
     - ✅ **Customers** - Read and write
     - ✅ **Subscriptions** - Read and write
     - ✅ **Checkout Sessions** - Read and write
     - ✅ **Invoices** - Read and write
     - ✅ **Webhooks** - Read (optional, for viewing webhook events)
   - **IP address restriction:** Leave empty (unless you have specific IPs)

3. **Create the Key**
   - Click **"Create key"** button
   - Copy the key immediately (starts with `rk_live_...` or `sk_live_...`)
   - ⚠️ **You can only see it once!** Save it securely

**✅ You'll get:** `rk_live_...` or `sk_live_...` (restricted key)

**Note:** Your code supports restricted keys - it validates `rk_live_` format too!

---

## Step 2: Create Live Webhook Endpoint

1. **Navigate to Webhooks**
   - In Stripe Dashboard, click **"Developers"** in left sidebar
   - Click **"Webhooks"**
   - Or go directly: https://dashboard.stripe.com/webhooks
   - ⚠️ **Make sure you're in Live mode!** (toggle in top right)

2. **Add Endpoint**
   - Click **"+ Add endpoint"** button (top right)

3. **Configure Endpoint**
   - **Endpoint URL:**
     ```
     https://syntheverse-poc.vercel.app/webhook/stripe
     ```
   - **Description (optional):** "Syntheverse PoC Production Webhook"

4. **Select Events**
   Click **"Select events"** or **"Add events"** and select:

   **Required Events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

   (You can also select "Select all events" if you want to capture everything)

5. **Create the Endpoint**
   - Click **"Add endpoint"** button
   - Stripe will create the webhook

6. **Get the Webhook Secret**
   - After creating, click on your new webhook endpoint
   - Scroll down to **"Signing secret"** section
   - Click **"Reveal"** or **"Click to reveal"** button
   - Copy the secret (starts with `whsec_...`)
   - ⚠️ **You'll need this!** Save it securely

**✅ You'll get:** `whsec_...` (webhook signing secret)

---

## Step 3: Update Vercel Environment Variables

Now that you have all the keys, update Vercel:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables

2. **Update STRIPE_SECRET_KEY**
   - Find `STRIPE_SECRET_KEY` in the list
   - Click **Edit** (or create if it doesn't exist)
   - **Environments:** Select **Production** (and Preview if you want)
   - **Value:** Paste your secret key (`sk_live_...` or `rk_live_...`)
   - Click **Save**

3. **Update NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   - Find `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Click **Edit**
   - **Environments:** Select **Production** (and Preview/Development if you want)
   - **Value:** Paste your publishable key (`pk_live_...`)
   - Click **Save**

4. **Update STRIPE_WEBHOOK_SECRET**
   - Find `STRIPE_WEBHOOK_SECRET`
   - Click **Edit**
   - **Environments:** Select **Production** only
   - **Value:** Paste your webhook secret (`whsec_...`)
   - Click **Save**

---

## Step 4: Redeploy

1. **Trigger Deployment**
   - Go to Vercel Dashboard → **Deployments**
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit to trigger auto-deployment

2. **Wait for Deployment**
   - Wait for build to complete
   - Verify deployment succeeds

---

## Step 5: Verify (Optional but Recommended)

1. **Check Keys Are Active**
   - Visit: `https://syntheverse-poc.vercel.app/api/test-stripe`
   - Should show live keys (`sk_live_`, `pk_live_`)

2. **Test Webhook**
   - Go to Stripe Dashboard → Webhooks (Live mode)
   - Click on your webhook endpoint
   - Click **"Send test webhook"**
   - Select `checkout.session.completed`
   - Click **"Send test webhook"**
   - Check Vercel logs to verify it's received

---

## Summary: What You Need

From Stripe Dashboard (Live mode):

- [x] **Publishable Key:** ✅ (obtained)
- [ ] **Secret Key:** `sk_live_...` or `rk_live_...` (get from API keys)
- [ ] **Webhook Secret:** `whsec_...` (get after creating webhook)

---

## Quick Checklist

- [ ] Got secret key from Stripe Dashboard → Developers → API keys
- [ ] Created webhook endpoint in Live mode
- [ ] Got webhook signing secret
- [ ] Updated `STRIPE_SECRET_KEY` in Vercel (Production)
- [ ] Updated `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel (Production)
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in Vercel (Production)
- [ ] Redeployed application
- [ ] Verified keys are working

---

**You're almost there! Follow the steps above and you'll be on live mode.** 🎉
