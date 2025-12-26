# Clear PoC Archive Instructions

## Method 1: Browser Console (Easiest)

1. **Log into the dashboard** at https://syntheverse-poc.vercel.app/dashboard
2. **Open Browser Developer Tools** (F12 or Cmd+Option+I)
3. **Go to the Console tab**
4. **Run this command:**

```javascript
fetch('/api/admin/clear-archive', {
  method: 'DELETE',
  credentials: 'include'
})
.then(res => res.json())
.then(data => {
  console.log('✅ Archive cleared:', data);
  console.log('Deleted:', data.deleted);
  console.log('Remaining:', data.remaining);
})
.catch(err => console.error('❌ Error:', err));
```

## Method 2: Script (Requires DATABASE_URL)

If you have `DATABASE_URL` in your `.env.local` file:

```bash
npx tsx scripts/clear-poc-archive.ts
```

## Method 3: API Endpoint (Production)

For production, you can call the API endpoint directly:

```bash
# Using curl (requires session cookie)
curl -X DELETE https://syntheverse-poc.vercel.app/api/admin/clear-archive \
  -H "Cookie: your-session-cookie"
```

## What Gets Deleted

- ✅ All contributions (PoC submissions)
- ✅ All allocations (token allocations)
- ✅ All PoC logs (evaluation logs)

## What Stays

- ✅ User accounts
- ✅ Tokenomics state
- ✅ Epoch balances
- ✅ User plans and Stripe data

## Verification

After clearing, check the archive:

```javascript
fetch('/api/archive/contributions')
.then(res => res.json())
.then(data => {
  console.log('Contributions count:', data.count);
  console.log('Contributions:', data.contributions);
});
```

