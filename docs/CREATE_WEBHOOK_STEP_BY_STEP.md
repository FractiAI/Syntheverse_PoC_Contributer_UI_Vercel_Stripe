# Create Stripe Webhook - Step-by-Step Walkthrough

## Step 1: Go to Stripe Dashboard

1. **Open your browser**
2. **Go to:** https://dashboard.stripe.com/
3. **⚠️ IMPORTANT:** Make sure the toggle in the **top right corner** says **"Live mode"**
   - If it says "Test mode", click it to switch to "Live mode"
   - The toggle should be blue/orange when in Live mode

---

## Step 2: Navigate to Webhooks

1. **In the left sidebar**, look for **"Developers"**
   - It might be at the bottom of the sidebar
   - Click on **"Developers"**

2. **In the Developers menu**, click on **"Webhooks"**
   - You should see a page titled "Webhooks"

3. **Direct link** (if you want): https://dashboard.stripe.com/webhooks
   - Make sure you're in Live mode when using this link

---

## Step 3: Create New Webhook Endpoint

1. **Look for the button** in the top right corner
   - It should say **"+ Add endpoint"** or **"+ Add"**
   - Click this button

2. **You'll see a form** to create a new endpoint

---

## Step 4: Configure the Endpoint URL

1. **Find the "Endpoint URL" field**
2. **Enter this URL:**

   ```
   https://syntheverse-poc.vercel.app/webhook/stripe
   ```

   - Copy and paste this exactly
   - Make sure there are no extra spaces

3. **Optional: Description field**
   - You can enter: "Syntheverse PoC Production Webhook"
   - Or leave it blank

---

## Step 5: Select Events

1. **Look for "Events to send" or "Select events" section**
   - You might see a button that says **"Select events"** or **"Add events"**
   - Click this button

2. **A dialog/modal will open** showing a list of events

3. **Search for and select these events** (check the boxes):

   **Required Events:**
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. **How to find events:**
   - You can scroll through the list
   - Or use the search box at the top to search for each event
   - Type "checkout" to find checkout events
   - Type "subscription" to find subscription events
   - Type "invoice" to find invoice events

5. **After selecting all events:**
   - Look for a button that says **"Add events"** or **"Done"**
   - Click it to confirm your selections

---

## Step 6: Create the Endpoint

1. **Review your settings:**
   - Endpoint URL: `https://syntheverse-poc.vercel.app/webhook/stripe`
   - Events: 6 events selected (or more if you selected all)

2. **Click the "Add endpoint" button** (usually at the bottom of the form)

3. **Stripe will create the webhook**
   - You'll be redirected to the webhook details page

---

## Step 7: Get the Webhook Signing Secret

1. **You should now be on the webhook details page**
   - This shows information about your new webhook

2. **Scroll down** to find the **"Signing secret" section**

3. **You'll see:**
   - Text that says "Signing secret"
   - A value that might be hidden: `whsec_...` (partially visible or hidden)
   - A button that says **"Reveal"** or **"Click to reveal"**

4. **Click the "Reveal" button**

5. **Copy the secret:**
   - The full secret will be shown (starts with `whsec_...`)
   - Click the **copy icon** (📋) next to it, or
   - Select all the text and copy it (Cmd+C on Mac, Ctrl+C on Windows)
   - **IMPORTANT:** Copy the ENTIRE secret - it's a long string

6. **Save it securely:**
   - Paste it somewhere safe temporarily
   - You'll need it to update Vercel
   - ⚠️ **You can only see it once!** If you leave this page, you'll need to regenerate it

---

## Step 8: Verify Your Webhook

1. **Check the webhook details:**
   - **Endpoint URL:** Should show `https://syntheverse-poc.vercel.app/webhook/stripe`
   - **Status:** Should show "Enabled" or similar
   - **Events:** Should list the 6 events you selected

2. **Optional: Test the webhook:**
   - Look for a button that says **"Send test webhook"**
   - Click it
   - Select event type: `checkout.session.completed`
   - Click "Send test webhook"
   - (This will fail until you update Vercel with the secret, but that's OK)

---

## What You Should Have Now

✅ **Webhook Endpoint Created** in Live mode  
✅ **Webhook URL:** `https://syntheverse-poc.vercel.app/webhook/stripe`  
✅ **6 Events Selected:** checkout.session.completed, customer.subscription._, invoice._  
✅ **Webhook Signing Secret:** `whsec_...` (you copied this)

---

## Next Step: Update Vercel

Once you have the webhook secret (`whsec_...`), we'll update it in Vercel.

**Just paste the secret here and I'll update it for you using the Vercel CLI!**

Or if you prefer to do it yourself:

```bash
echo "whsec_YOUR_SECRET_HERE" | vercel env add STRIPE_WEBHOOK_SECRET production --force --token sFGpBCc64T0Qn5aGCOksY7zm
```

---

## Troubleshooting

### Can't find "Developers" in sidebar?

- Scroll down the sidebar - it's usually at the bottom
- Or use the search bar at the top of the dashboard

### Can't see "Live mode" toggle?

- Look in the top right corner of the Stripe Dashboard
- It should be a toggle switch or button
- Make sure you're logged into the correct account

### Events not showing up?

- Try using the search box in the events dialog
- Make sure you're selecting the exact event names listed above
- You can select more events if you want - these 6 are the minimum required

### Webhook secret not showing?

- Make sure you've actually created the endpoint (clicked "Add endpoint")
- Scroll down on the webhook details page
- Look for "Signing secret" section
- Click "Reveal" button

---

**Take your time and follow each step. Once you have the `whsec_...` secret, paste it here and I'll help you update Vercel!** 🎉
