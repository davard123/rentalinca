const crypto = require('crypto');

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

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function getClientMeta(req) {
  return {
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    userAgent: req.headers['user-agent'] || ''
  };
}

function sanitizeString(value, maxLength = 2000) {
  if (value === undefined || value === null) return '';
  return String(value).trim().slice(0, maxLength);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function roundToNearest50(value) {
  return Math.round(value / 50) * 50;
}

function createEstimate(input, req) {
  const cityKey = sanitizeString(input.city, 80);
  const propertyType = sanitizeString(input.propertyType, 20);
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

  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...getClientMeta(req),
    cityKey,
    cityName: city.name,
    propertyType,
    propertyTypeLabel: PROPERTY_TYPE_LABELS[propertyType],
    areaSqft,
    minRent,
    maxRent,
    displayRange: `$${minRent.toLocaleString()} - $${maxRent.toLocaleString()}/mo`
  };
}

function sanitizeInquiry(input, req) {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...getClientMeta(req),
    source: sanitizeString(input.source, 80),
    name: sanitizeString(input.name, 120),
    phone: sanitizeString(input.phone, 80),
    email: sanitizeString(input.email, 160),
    serviceNeeded: sanitizeString(input.serviceNeeded, 200),
    city: sanitizeString(input.city, 160),
    notes: sanitizeString(input.notes, 2000),
    propertyType: sanitizeString(input.propertyType, 120),
    areaSqft: sanitizeString(input.areaSqft, 40),
    estimatedRent: sanitizeString(input.estimatedRent, 120),
    estimateId: sanitizeString(input.estimateId, 120),
    page: sanitizeString(input.page, 300)
  };
}

async function readGithubJson(filePath) {
  const repo = process.env.GITHUB_DATA_REPO;
  const branch = process.env.GITHUB_DATA_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;

  if (!repo || !token) {
    const error = new Error('Missing GitHub storage configuration');
    error.statusCode = 500;
    throw error;
  }

  const url = `https://api.github.com/repos/${repo}/contents/${filePath}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'rentalinca-api'
    }
  });

  if (response.status === 404) {
    return { data: [], sha: null };
  }

  if (!response.ok) {
    const error = new Error(`GitHub read failed: ${response.status}`);
    error.statusCode = 502;
    throw error;
  }

  const payload = await response.json();
  const content = Buffer.from(payload.content || '', 'base64').toString('utf8');
  return { data: content ? JSON.parse(content) : [], sha: payload.sha };
}

async function writeGithubJson(filePath, data, sha, message) {
  const repo = process.env.GITHUB_DATA_REPO;
  const branch = process.env.GITHUB_DATA_BRANCH || 'main';
  const token = process.env.GITHUB_TOKEN;
  const url = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  const body = {
    message,
    branch,
    content: Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf8').toString('base64')
  };
  if (sha) body.sha = sha;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': 'rentalinca-api'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = new Error(`GitHub write failed: ${response.status}`);
    error.statusCode = 502;
    throw error;
  }
}

async function prependGithubRecord(filePath, record, message) {
  const { data, sha } = await readGithubJson(filePath);
  const records = Array.isArray(data) ? data : [];
  records.unshift(record);
  await writeGithubJson(filePath, records, sha, message);
}

module.exports = {
  createEstimate,
  prependGithubRecord,
  readGithubJson,
  sanitizeInquiry,
  sendJson
};
