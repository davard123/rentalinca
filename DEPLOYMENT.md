# Deployment

## GitHub

Repository:

https://github.com/davard123/rentalinca

The default branch is `main`.

## Vercel

Import the GitHub repository into Vercel:

1. New Project
2. Import `davard123/rentalinca`
3. Framework Preset: Other
4. Build Command: empty/default
5. Output Directory: empty/default

Set these environment variables in Vercel:

- `ADMIN_TOKEN`
- `GITHUB_TOKEN`
- `GITHUB_DATA_REPO=davard123/rentalinca-data`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Production API:

- `POST /api/rental-estimate`
- `POST /api/inquiries`
- `GET /api/inquiries`

Admin page:

- `/admin.html`

## Domain

After the Vercel project is deployed, add:

- `rentalinca.com`
- `www.rentalinca.com`

Set `rentalinca.com` as the primary domain.
