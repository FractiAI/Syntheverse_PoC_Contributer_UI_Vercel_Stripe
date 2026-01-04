# Email Setup for PoC Approval Notifications

## Overview

The Syntheverse PoC system automatically sends email notifications to administrators when a PoC qualifies for token allocation (pod_score >= 8000). The email includes approve/reject buttons that immediately update the status in the dashboard.

## Configuration

### 1. Resend API Key

1. Sign up for a Resend account at https://resend.com
2. Create an API key in your Resend dashboard
3. Add the API key to your Vercel environment variables:
   - Variable name: `RESEND_API_KEY`
   - Value: Your Resend API key (starts with `re_`)

### 2. Admin Email

The admin email is configured via environment variable:

- Variable name: `ADMIN_EMAIL`
- Default value: `espressolico@gmail.com`
- You can override this in Vercel environment variables

### 3. Site URL

Make sure `NEXT_PUBLIC_SITE_URL` is set in Vercel:

- For production: `https://your-domain.com`
- For preview deployments: Vercel automatically sets `VERCEL_URL`

## Email Flow

1. **PoC Submission**: When a PoC is submitted and evaluated
2. **Qualification Check**: If `pod_score >= 8000`, the PoC qualifies
3. **Email Sent**: An approval request email is automatically sent to the admin
4. **Admin Action**: Admin clicks approve or reject button in email
5. **Status Update**: Status is immediately updated in the database
6. **Dashboard Redirect**: Admin is redirected to dashboard with status message

## Email Content

The approval request email includes:

- PoC title and contributor
- PoD score (out of 10,000)
- Assigned metals (Gold/Silver/Copper)
- Submission hash
- Suggested token allocation (if available)
- Eligible epochs
- **Approve button** - Creates allocations and updates status
- **Reject button** - Marks allocation as rejected
- **View Details link** - Links to dashboard with submission details

## API Endpoints

### GET `/api/admin/approve-allocation`

Handles email link clicks:

- `?hash=<submission_hash>&action=approve` - Approve allocation
- `?hash=<submission_hash>&action=reject` - Reject allocation

### POST `/api/admin/approve-allocation`

Handles authenticated admin actions:

```json
{
  "submission_hash": "...",
  "action": "approve" // or "reject"
}
```

## Testing

1. Submit a PoC that scores >= 8000
2. Check the admin email inbox
3. Click the approve or reject button
4. Verify status updates in the dashboard

## Troubleshooting

### Email not sending

- Check `RESEND_API_KEY` is set in Vercel
- Verify Resend account is active
- Check server logs for email errors

### Buttons not working

- Verify `NEXT_PUBLIC_SITE_URL` is set correctly
- Check that the approval endpoint is accessible
- Review server logs for errors

### Status not updating

- Check database connection
- Verify allocation endpoint is working
- Review server logs for errors

## Security Notes

- Email links include tokens for basic security
- For production, consider adding:
  - Token expiration
  - Rate limiting
  - Admin role verification
  - IP whitelisting
