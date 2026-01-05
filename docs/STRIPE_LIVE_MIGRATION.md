# Stripe Live Mode Migration Guide

## Overview

This guide walks through migrating from Stripe test/sandbox mode to live/production mode. The codebase already supports live keys - we just need to update environment variables and webhook configuration.

## Prerequisites

✅ Code already supports both test and live keys (validates `sk_test_` or `sk_live_`)  
✅ All Stripe initialization code is mode-agnostic  
⚠️ You need access to Stripe Dashboard with live mode enabled  
⚠️ You need to activate your Stripe account for live payments

---

## What You Need from Stripe Dashboard

### Step 1: Get Live API Keys

1. **Go to Stripe Dashboard**
   - Visit: https://dashboard.stripe.com/
   - **Toggle to "Live mode"** (switch in top right corner - should say "Live mode" when active)

2. **Get Secret Key**
   - Navigate to: **Developers** → **API keys**
   - Under **"Secret key"** section
   - Click **"Reveal test key"** or **"Reveal live key"** (depending on mode)
   - Copy the key that starts with `sk_live_...`
   - ⚠️ **Keep this secret!** Never commit it to Git

3. **Get Publishable Key**
   - Still in **Developers** → **API keys**
   - Under **"Publishable key"** section
   - Copy the key that starts with `pk_live_...`
   - This is safe to expose in client-side code

**✅ You need:**

- [ ] `sk_live_...` (Secret key)
- [ ] `pk_live_...` (Publishable key)

---

### Step 2: Create Live Webhook Endpoint

1. **Go to Webhooks in Live Mode**
   - Make sure you're in **"Live mode"** (toggle in top right)
   - Navigate to: **Developers** → **Webhooks**
   - Or directly: https://dashboard.stripe.com/webhooks

2. **Add Endpoint (or Edit Existing)**
   - Click **"+ Add endpoint"** button
   - **Endpoint URL**: `https://syntheverse-poc.vercel.app/webhook/stripe`
   - (Or your production domain if you have one)
   - **Description** (optional): "Syntheverse PoC Production Webhook"

3. **Select Events to Listen To**
   Select all of these events:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. **Save the Webhook**
   - Click **"Add endpoint"** or **"Save"**

5. **Get Webhook Signing Secret**
   - Click on your newly created webhook endpoint
   - Scroll to **"Signing secret"** section
   - Click **"Reveal"** or **"Click to reveal"**
   - Copy the secret that starts with `whsec_...`
   - ⚠️ **Keep this secret!**

**✅ You need:**

- [ ] `whsec_...` (Webhook signing secret from LIVE mode)

---

## Migration Steps

### Step 1: Update Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to: https://vercel.com/dashboard/fractiais-projects/syntheverse-poc/settings/environment-variables

2. **Update STRIPE_SECRET_KEY (Production)**
   - Find `STRIPE_SECRET_KEY` in the list
   - Click **Edit**
   - **Environment**: Select **Production** only (or Preview if you want to test)
   - **Value**: Paste your `sk_live_...` key
   - ⚠️ Make sure:
     - Key starts with `sk_live_` (not `sk_test_`)
     - No extra spaces or newlines
     - Copy the exact key from Stripe Dashboard
   - Click **Save**

3. **Update NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (Production)**
   - Find `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Click **Edit**
   - **Environment**: Select **Production** (and Preview/Development if you want)
   - **Value**: Paste your `pk_live_...` key
   - ⚠️ Make sure it starts with `pk_live_` (not `pk_test_`)
   - Click **Save**

4. **Update STRIPE_WEBHOOK_SECRET (Production)**
   - Find `STRIPE_WEBHOOK_SECRET`
   - Click **Edit**
   - **Environment**: Select **Production** only
   - **Value**: Paste your `whsec_...` secret from **live mode** webhook
   - ⚠️ Make sure:
     - Secret starts with `whsec_`
     - No extra spaces or newlines
     - This is from the **live mode** webhook (not test mode)
   - Click **Save**

**✅ Checklist:**

- [ ] `STRIPE_SECRET_KEY` = `sk_live_...` (Production environment)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (Production environment)
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (Production environment, from live webhook)

---

### Step 2: Verify Test Mode Still Works (Optional)

If you want to keep test mode for Preview/Development environments:

- Keep test keys (`sk_test_`, `pk_test_`) for Preview and Development
- Only update Production environment with live keys
- This allows you to test in preview deployments without affecting live payments

---

### Step 3: Redeploy Application

1. **Trigger Deployment**
   - Go to Vercel Dashboard → **Deployments**
   - Click **"Redeploy"** on the latest deployment
   - Or push a new commit to trigger automatic deployment

2. **Wait for Deployment**
   - Wait for the build to complete
   - Ensure the deployment succeeds

---

### Step 4: Test Live Mode

1. **Verify Keys Are Active**
   - Visit: `https://syntheverse-poc.vercel.app/api/test-stripe`
   - Check that it shows live keys (starts with `sk_live_`, `pk_live_`)

2. **Test Webhook (Optional)**
   - Go to Stripe Dashboard → **Webhooks** (in Live mode)
   - Click on your webhook endpoint
   - Click **"Send test webhook"**
   - Select `checkout.session.completed`
   - Click **"Send test webhook"**
   - Check Vercel logs to verify it's received

3. **Test Actual Payment Flow (Small Amount)**
   - ⚠️ **Only do this if you're ready for real charges**
   - Try a small transaction to verify the flow works
   - Monitor Stripe Dashboard for the transaction
   - Check Vercel logs for any errors

---

## Important Notes

### ⚠️ Security Warnings

1. **Never commit live keys to Git**
   - Live keys charge real money
   - Always use environment variables
   - Review code before committing

2. **Keep keys secure**
   - Don't share keys in chat/email
   - Rotate keys if compromised
   - Use restricted API keys when possible

3. **Test mode vs Live mode**
   - Test keys (`sk_test_`, `pk_test_`) don't charge real money
   - Live keys (`sk_live_`, `pk_live_`) charge REAL money
   - Make sure you're in the right mode in Stripe Dashboard

### 🔄 Mode Switching

- You can toggle between test and live mode in Stripe Dashboard
- Test mode: Use test cards (e.g., `4242 4242 4242 4242`)
- Live mode: Requires real payment methods
- Webhook secrets are different for test vs live mode

### 📊 Monitoring

After migrating to live mode:

1. **Monitor Stripe Dashboard**
   - Watch for failed payments
   - Check webhook delivery status
   - Review customer transactions

2. **Monitor Vercel Logs**
   - Check function logs for errors
   - Monitor webhook processing
   - Watch for API errors

3. **Set up Alerts** (Recommended)
   - Stripe Dashboard → Settings → Notifications
   - Set up email alerts for failed payments
   - Set up alerts for webhook failures

---

## Rollback Plan

If you need to rollback to test mode:

1. **Update Vercel Environment Variables**
   - Change `STRIPE_SECRET_KEY` back to `sk_test_...` (Production)
   - Change `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` back to `pk_test_...` (Production)
   - Change `STRIPE_WEBHOOK_SECRET` back to test mode webhook secret

2. **Redeploy**
   - Trigger a new deployment in Vercel

3. **Verify**
   - Check that test keys are being used
   - Test with test cards

---

## Troubleshooting

### Keys Not Working

**Issue**: Payments failing or API errors

**Solutions**:

- Verify keys are copied correctly (no spaces/newlines)
- Check you're using live keys (`sk_live_`, `pk_live_`)
- Verify Stripe account is activated for live payments
- Check Stripe Dashboard for account status

### Webhook Not Working

**Issue**: Webhook events not being received

**Solutions**:

- Verify webhook URL is correct
- Check webhook secret matches live mode webhook
- Ensure you're using live mode webhook secret (not test mode)
- Check Vercel logs for webhook errors
- Verify webhook endpoint is created in live mode (not test mode)

### Mixed Mode Errors

**Issue**: Using test keys with live webhook or vice versa

**Solutions**:

- Test keys must use test webhook secret
- Live keys must use live webhook secret
- Don't mix test and live keys/webhooks
- Double-check all environment variables match the mode

---

## Checklist Summary

Before going live, verify:

- [ ] Stripe account is activated for live payments
- [ ] You have live API keys (`sk_live_...`, `pk_live_...`)
- [ ] Live webhook endpoint is created in Stripe Dashboard
- [ ] You have live webhook secret (`whsec_...`)
- [ ] All Vercel environment variables are updated for Production
- [ ] Application is redeployed
- [ ] You've tested the flow (small amount recommended)
- [ ] Monitoring/alerts are set up
- [ ] Team is aware of the migration

---

## Need Help?

- **Stripe Support**: https://support.stripe.com/
- **Stripe Dashboard**: https://dashboard.stripe.com/
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Check Logs**: Vercel Dashboard → Functions → Logs

---

**Once you complete these steps, your application will be using Stripe live mode!** 🎉
