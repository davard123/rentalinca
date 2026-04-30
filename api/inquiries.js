const { prependGithubRecord, sanitizeInquiry, sendJson } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const inquiry = sanitizeInquiry(req.body || {}, req);
      await prependGithubRecord(
        'data/production-inquiries.json',
        inquiry,
        `Record inquiry ${inquiry.id}`
      );
      sendJson(res, 201, { ok: true, id: inquiry.id });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { ok: false, error: error.message || 'Invalid inquiry payload' });
    }
    return;
  }

  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token || '';
    if (process.env.ADMIN_TOKEN && token !== process.env.ADMIN_TOKEN) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }

    try {
      const { readGithubJson } = require('./_shared');
      const { data } = await readGithubJson('data/production-inquiries.json');
      sendJson(res, 200, { ok: true, inquiries: Array.isArray(data) ? data : [] });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message || 'Unable to read inquiries' });
    }
    return;
  }

  sendJson(res, 405, { ok: false, error: 'Method not allowed' });
};
