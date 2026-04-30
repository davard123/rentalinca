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
- `GITHUB_DATA_REPO`: private repository used for backend records, e.g. `davard123/rentalinca`

Production customer records are stored as private GitHub Issues so new inquiries do not trigger redeploys and do not become static site files.

Production API endpoints:

- `POST /api/rental-estimate`
- `POST /api/inquiries`
- `GET /api/inquiries` with `Authorization: Bearer <ADMIN_TOKEN>`
