# rentalinca.com

Southern California real estate website for David Dai.

## Local Development

```powershell
node server.js
```

Open:

- Website: http://localhost:3000
- Admin: http://localhost:3000/admin.html

## Production Environment Variables

For Vercel deployment, set:

- `ADMIN_TOKEN`: password/token for `/admin.html`
- `GITHUB_TOKEN`: GitHub token with private repo issue read/write access
- `GITHUB_DATA_REPO`: private repository used for backend records, e.g. `davard123/rentalinca-data`
- `TELEGRAM_BOT_TOKEN`: Telegram bot token for backend notifications
- `TELEGRAM_CHAT_ID`: Telegram chat ID that should receive backend notifications
- `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret; when set, public POST endpoints require a valid token
- `CRM_WEBHOOK_URL`: optional CRM ingestion endpoint for dual-write migration
- `CRM_WEBHOOK_TOKEN`: optional bearer token for the CRM webhook

Production customer records are stored as private GitHub Issues so new inquiries do not trigger redeploys and do not become static site files.

Production API endpoints:

- `POST /api/rental-estimate`
- `POST /api/inquiries`
- `GET /api/inquiries` with `Authorization: Bearer <ADMIN_TOKEN>`

## Customer journey additions

- Contact submissions carry estimator/calculator context and a preferred callback time.
- `/tenants.html` includes a structured rental-search assistant and printable materials checklist.
- `/privacy.html` documents collection, use, retention, and deletion requests.
- Set `window.RENTALINCA_TURNSTILE_SITE_KEY` in a deployment config script to render the public Turnstile widget. The backend remains usable locally when the secret is unset.
- Admin inquiries support `page`, `limit`, and status updates (`new`, `contacted`, `qualified`, `closed`).
