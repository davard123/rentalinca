const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const INQUIRIES_FILE = path.join(DATA_DIR, 'inquiries.json');
const ESTIMATES_FILE = path.join(DATA_DIR, 'rental-estimates.json');
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(INQUIRIES_FILE)) fs.writeFileSync(INQUIRIES_FILE, '[]\n');
  if (!fs.existsSync(ESTIMATES_FILE)) fs.writeFileSync(ESTIMATES_FILE, '[]\n');
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        req.destroy();
        reject(new Error('Request body is too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(payload));
}

function sanitizeInquiry(input) {
  const clean = {};
  [
    'source',
    'name',
    'phone',
    'email',
    'serviceNeeded',
    'city',
    'notes',
    'propertyType',
    'areaSqft',
    'estimatedRent',
    'estimateId',
    'page'
  ].forEach(key => {
    if (input[key] !== undefined && input[key] !== null) {
      clean[key] = String(input[key]).trim().slice(0, 2000);
    }
  });
  return clean;
}

const RENTAL_DATA = {
  irvine: { name: 'Irvine 尔湾', '1bd': [2300, 2800], '2bd': [3000, 3800], '3bd': [3800, 5000], sfr: [5500, 8000] },
  'los-angeles': { name: 'Los Angeles 洛杉矶', '1bd': [2000, 2600], '2bd': [2500, 3500], '3bd': [3500, 5000], sfr: [5000, 8500] },
  arcadia: { name: 'Arcadia 阿凯迪亚', '1bd': [1800, 2200], '2bd': [2500, 3200], '3bd': [3200, 4200], sfr: [4500, 6500] },
  pasadena: { name: 'Pasadena 帕萨迪纳', '1bd': [2200, 2800], '2bd': [2700, 3500], '3bd': [3600, 4800], sfr: [5200, 7500] },
  'san-gabriel': { name: 'San Gabriel 圣盖博', '1bd': [1800, 2300], '2bd': [2300, 3000], '3bd': [3000, 4200], sfr: [4200, 6200] },
  'rowland-heights': { name: 'Rowland Heights 罗兰岗', '1bd': [1600, 2000], '2bd': [2200, 2800], '3bd': [2800, 3600], sfr: [3800, 5000] },
  'diamond-bar': { name: 'Diamond Bar 钻石吧', '1bd': [1700, 2100], '2bd': [2300, 2900], '3bd': [2900, 3800], sfr: [4000, 5500] },
  'chino-hills': { name: 'Chino Hills 奇诺岗', '1bd': [1800, 2200], '2bd': [2400, 3000], '3bd': [3000, 3900], sfr: [4200, 5800] },
  riverside: { name: 'Riverside 河滨市', '1bd': [1400, 1800], '2bd': [1900, 2400], '3bd': [2400, 3200], sfr: [3200, 4500] }
};

const PROPERTY_TYPE_LABELS = {
  '1bd': '1BD / 1BA',
  '2bd': '2BD / 2BA',
  '3bd': '3BD / 2BA',
  sfr: 'Single Family Home'
};

const TYPICAL_SQFT = {
  '1bd': 750,
  '2bd': 1050,
  '3bd': 1450,
  sfr: 2200
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundToNearest50(value) {
  return Math.round(value / 50) * 50;
}

function createRentalEstimate(input, req) {
  ensureStore();
  const cityKey = String(input.city || '');
  const propertyType = String(input.propertyType || '');
  const areaSqft = Number(input.areaSqft);
  const city = RENTAL_DATA[cityKey];

  if (!city || !city[propertyType] || !Number.isFinite(areaSqft) || areaSqft < 300 || areaSqft > 10000) {
    const error = new Error('Invalid rental estimate input');
    error.statusCode = 400;
    throw error;
  }

  const baseRange = city[propertyType];
  const areaFactor = clamp(Math.sqrt(areaSqft / TYPICAL_SQFT[propertyType]), 0.8, 1.25);
  const minRent = roundToNearest50(baseRange[0] * areaFactor);
  const maxRent = roundToNearest50(baseRange[1] * areaFactor);
  const estimate = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
    cityKey,
    cityName: city.name,
    propertyType,
    propertyTypeLabel: PROPERTY_TYPE_LABELS[propertyType],
    areaSqft,
    minRent,
    maxRent,
    displayRange: `$${minRent.toLocaleString()} - $${maxRent.toLocaleString()}/mo`
  };

  const estimates = JSON.parse(fs.readFileSync(ESTIMATES_FILE, 'utf8'));
  estimates.unshift(estimate);
  fs.writeFileSync(ESTIMATES_FILE, JSON.stringify(estimates, null, 2) + '\n');
  return estimate;
}

function saveInquiry(input, req) {
  ensureStore();
  const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
  const inquiry = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent'] || '',
    ...sanitizeInquiry(input)
  };
  inquiries.unshift(inquiry);
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2) + '\n');
  return inquiry;
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const pathname = decodedPath === '/' ? '/index.html' : decodedPath;
  const filePath = path.resolve(ROOT, pathname.slice(1));

  if (!filePath.startsWith(ROOT) || filePath.includes(`${path.sep}data${path.sep}`)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(error.code === 'ENOENT' ? 404 : 500);
      res.end(error.code === 'ENOENT' ? 'Not found' : 'Server error');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'POST' && url.pathname === '/api/inquiries') {
    try {
      const body = await readJsonBody(req);
      const inquiry = saveInquiry(body, req);
      sendJson(res, 201, { ok: true, id: inquiry.id });
    } catch (error) {
      sendJson(res, 400, { ok: false, error: 'Invalid inquiry payload' });
    }
    return;
  }

  if (req.method === 'POST' && url.pathname === '/api/rental-estimate') {
    try {
      const body = await readJsonBody(req);
      const estimate = createRentalEstimate(body, req);
      sendJson(res, 201, { ok: true, estimate });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { ok: false, error: 'Invalid rental estimate payload' });
    }
    return;
  }

  if (req.method === 'GET' && url.pathname === '/api/inquiries') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || url.searchParams.get('token') || '';
    if (ADMIN_TOKEN && token !== ADMIN_TOKEN) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }
    ensureStore();
    const inquiries = JSON.parse(fs.readFileSync(INQUIRIES_FILE, 'utf8'));
    sendJson(res, 200, { ok: true, inquiries });
    return;
  }

  if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`rentalinca.com local server running at http://localhost:${PORT}`);
  console.log(`Inquiry admin page: http://localhost:${PORT}/admin.html`);
});
