# Stripe Test Troubleshooting

## ✅ Test Succeeded - What Happened

If you see this in the console:

```
✅ Success! {success: true, checkout_url: "https://checkout.stripe.com/...", ...}
🔗 Opening Stripe Checkout...
```

**This means the test is working!** The checkout session was created successfully.

## What Should Happen Next

1. **A new tab/window should open** with Stripe Checkout
2. **Check your browser tabs** - look for a new tab with Stripe's payment form
3. **Check for popup blockers** - some browsers block `window.open()` calls

## If You Don't See the Checkout Page

### Option 1: Check Browser Tabs

- Look for a new tab that opened (might be behind other windows)
- Check if you have multiple browser windows open

### Option 2: Popup Blocker

- Your browser might have blocked the popup
- Look for a popup blocker notification in your browser's address bar
- Click "Allow popups for this site" if prompted

### Option 3: Manual Open

- Copy the `checkout_url` from the console output
- Open a new tab and paste the URL
- Example: `https://checkout.stripe.com/c/pay/cs_live_...`

### Option 4: Use the URL Directly

Run this in console to get the URL:

```javascript
fetch('/api/test/stripe-small', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ amount_cents: 50 }),
})
  .then((res) => res.json())
  .then((data) => {
    if (data.checkout_url) {
      console.log('🔗 Checkout URL:', data.checkout_url);
      console.log('💡 Copy this URL and open it in a new tab');
      // Or prompt to copy
      navigator.clipboard.writeText(data.checkout_url).then(() => {
        console.log('✅ URL copied to clipboard!');
      });
    }
  });
```

## What You Should See in Stripe Checkout

Once the checkout page loads, you should see:

1. **Stripe Checkout Form**
   - Amount: $0.50 USD
   - Payment form with card fields
   - "Pay" button

2. **Test the Payment**
   - Use a real credit card (will charge $0.50)
   - Complete the payment
   - You'll be redirected back to your app

3. **Verify in Stripe Dashboard**
   - Go to https://dashboard.stripe.com
   - Navigate to **Payments**
   - Look for a $0.50 payment
   - Check that it shows as "Succeeded"

## Common Issues

### Issue: "Seems to hang"

**Solution**: The checkout page is likely loading in a new tab. Check your browser tabs or disable popup blockers.

### Issue: Popup blocked

**Solution**: Allow popups for your domain, or manually copy/paste the checkout URL.

### Issue: Can't find the checkout URL

**Solution**: Run the test again and copy the `checkout_url` value from the console output.

### Issue: Payment not showing in Stripe Dashboard

**Solution**:

1. Make sure you're logged into the correct Stripe account
2. Check the payment status in Stripe Dashboard
3. Verify the payment was completed (not just the checkout session created)

## Next Steps After Successful Test

1. ✅ Verify the payment appears in Stripe Dashboard
2. ✅ Check that webhook events are received (check Vercel logs)
3. ✅ Verify the redirect URL works after payment
4. ✅ Consider refunding the test transaction if desired

---

**Remember**: The test succeeded if you see the success message. The "hanging" is just the checkout page loading in a new tab!
