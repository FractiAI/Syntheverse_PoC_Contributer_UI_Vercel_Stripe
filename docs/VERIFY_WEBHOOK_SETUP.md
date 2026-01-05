# Verify and Update Stripe Webhook Setup

## Current Status

✅ **STRIPE_WEBHOOK_SECRET** exists in Vercel Production environment  
⏳ Need to verify if it's set to **live mode** webhook secret

---

## Step 1: Check Stripe Webhooks (Live Mode)

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/
   - **⚠️ IMPORTANT:** Make sure you're in **"Live mode"** (toggle in top right)

2. **Navigate to Webhooks**
   - Click **"Developers"** in left sidebar
   - Click **"Webhooks"**
   - Or directly: https://dashboard.stripe.com/webhooks

3. **Check Existing Webhooks**
   - Look for any webhook endpoints that point to: `https://syntheverse-poc.vercel.app/webhook/stripe`
   - Check if it's configured for **Live mode** (not Test mode)

---

## Step 2: Create or Verify Live Webhook Endpoint

### Option A: Webhook Already Exists in Live Mode

If you see a webhook endpoint with URL `https://syntheverse-poc.vercel.app/webhook/stripe`:

1. **Click on the webhook endpoint**
2. **Verify Events**
   Make sure these events are selected:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

3. **Get the Signing Secret**
   - Scroll down to **"Signing secret"** section
   - Click **"Reveal"** button
   - Copy the secret (starts with `whsec_...`)
   - This is what you'll use to update Vercel

### Option B: Need to Create New Webhook Endpoint

If no webhook exists in Live mode:

1. **Click "+ Add endpoint"** button (top right)

2. **Configure Endpoint**
   - **Endpoint URL:**
     ```
     https://syntheverse-poc.vercel.app/webhook/stripe
     ```
   - **Description (optional):** "Syntheverse PoC Production Webhook"

3. **Select Events**
   Click **"Select events"** and select:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
   - Click **"Add events"**

4. **Create the Endpoint**
   - Click **"Add endpoint"** button

5. **Get the Signing Secret**
   - After creating, click on your new webhook endpoint
   - Scroll to **"Signing secret"** section
   - Click **"Reveal"** button
   - Copy the secret (starts with `whsec_...`)

---

## Step 3: Update Vercel Webhook Secret

Once you have the **live mode** webhook secret:

1. **Copy the secret** from Stripe (starts with `whsec_...`)

2. **Update in Vercel via CLI:**

   ```bash
   echo "whsec_YOUR_SECRET_HERE" | vercel env add STRIPE_WEBHOOK_SECRET production --force --token YOUR_TOKEN
   ```

   (Replace `whsec_YOUR_SECRET_HERE` with your actual secret)

3. **Or update manually:**
   - Go to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables
   - Find `STRIPE_WEBHOOK_SECRET`
   - Edit for **Production** environment
   - Paste the new `whsec_...` secret
   - Save

---

## Step 4: Verify Webhook Configuration

### Check Webhook Secret Format

The webhook secret should:

- ✅ Start with `whsec_...`
- ✅ Be from **Live mode** webhook (not Test mode)
- ✅ Match the webhook endpoint you're using
- ✅ Have no extra spaces or newlines

### Test the Webhook

1. **In Stripe Dashboard** (Live mode)
   - Go to your webhook endpoint
   - Click **"Send test webhook"** button
   - Select event type: `checkout.session.completed`
   - Click **"Send test webhook"**

2. **Check Vercel Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Check logs for `/webhook/stripe`
   - Should see successful webhook processing

3. **Check Stripe Dashboard**
   - In your webhook endpoint page
   - Look at **"Recent events"** section
   - Should see successful delivery (200 status)

---

## Important Notes

### Test Mode vs Live Mode

- ⚠️ **Test mode webhooks** use test keys and test secrets
- ⚠️ **Live mode webhooks** use live keys and live secrets
- ⚠️ **Don't mix them!**
  - Live keys → Live webhook secret
  - Test keys → Test webhook secret

### Current Configuration

- ✅ You're using **live Stripe keys** (`sk_live_...`, `pk_live_...`)
- ✅ You need a **live mode webhook secret** (`whsec_...` from live webhook)
- ✅ The webhook endpoint URL is: `https://syntheverse-poc.vercel.app/webhook/stripe`

---

## Quick Checklist

- [ ] Verified you're in **Live mode** in Stripe Dashboard
- [ ] Checked if webhook endpoint exists for `https://syntheverse-poc.vercel.app/webhook/stripe`
- [ ] Created webhook endpoint if it doesn't exist
- [ ] Verified all required events are selected
- [ ] Got the webhook signing secret (`whsec_...`)
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in Vercel (Production environment)
- [ ] Tested webhook delivery
- [ ] Verified webhook works in Vercel logs

---

**Once you complete these steps, your Stripe webhook will be fully configured for live mode!** 🎉
