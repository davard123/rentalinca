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
- `GITHUB_TOKEN`: GitHub token with repo contents read/write access
- `GITHUB_DATA_REPO`: repository used for JSON record storage, e.g. `davard123/rentalinca`
- `GITHUB_DATA_BRANCH`: optional, defaults to `main`

Production API endpoints:

- `POST /api/rental-estimate`
- `POST /api/inquiries`
- `GET /api/inquiries` with `Authorization: Bearer <ADMIN_TOKEN>`
