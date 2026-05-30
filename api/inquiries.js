const { prependGithubRecord, sanitizeInquiry, sendJson, sendTelegramNotification, sendResendAutoReply } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const inquiry = sanitizeInquiry(req.body || {}, req);
      await prependGithubRecord(
        'data/production-inquiries.json',
        inquiry,
        `Record inquiry ${inquiry.id}`
      );
      await sendTelegramNotification('inquiry', inquiry);
      sendResendAutoReply(inquiry).catch(err => console.error('Resend error:', err.message));
      sendJson(res, 201, { ok: true, id: inquiry.id });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { ok: false, error: error.message || 'Invalid inquiry payload' });
    }
    return;
  }

  if (req.method === 'GET') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || req.query?.token || '';
    const adminToken = String(process.env.ADMIN_TOKEN || '').trim();
    if (adminToken && token.trim() !== adminToken) {
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
