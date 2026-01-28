# Cloud connectivity, DB access, PayPal

This repo is **only** for:

1. **Cloud connectivity** — Gateway entry point. Deploy to Vercel (or any Node host). Other systems call in here for separation.
2. **DB access** — Pass-through pipe to the user UI and API calls. This repo does not own the DB or schema; it pipes through so the UI and API can read/write the backing database.
3. **PayPal** — Solitary pipe to PayPal only (@PrudencioMendez924). All payments go through this pipe.

Everything else (evaluation, operator UI, PoC flows, etc.) is built elsewhere and connects into here.

## API

| Endpoint | Purpose |
|----------|---------|
| `GET /api/health` | Cloud connectivity check — gateway is up |
| `GET /api/db/status` | DB pass-through pipe status — reachable for UI/API (requires `DATABASE_URL`) |
| `GET /api/payments/methods` | Returns PayPal only (solitary pipe) |
| `POST /api/payments/process` | Body: `{ amount, currency?, method? }` → returns `payment.redirectUrl` (PayPal.Me) |

## Env

- **`DATABASE_URL`** — Required for the DB pass-through pipe (PostgreSQL). Set in Vercel or `.env` so the user UI and API calls can use the pipe.
- **`NEXT_PUBLIC_SITE_URL`** — Optional; for absolute URLs (e.g. in emails).

No env required for PayPal pipe (PayPal.Me link is fixed).

## Run

```bash
npm install
npm run build
npm start
```

Deploy to Vercel; set `DATABASE_URL` in project settings if you use the DB pass-through pipe.
