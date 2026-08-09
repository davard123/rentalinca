const { prependGithubRecord, sanitizeInquiry, sendJson, sendTelegramNotification, sendResendAutoReply, safeEqual } = require('./_shared');

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

    // Fail CLOSED. The previous guard was `if (adminToken && ...)`, so an unset or
    // empty ADMIN_TOKEN skipped the check entirely and served every lead's name,
    // phone, email and IP to anyone who asked for it.
    if (!adminToken) {
      console.error('ADMIN_TOKEN is not configured — refusing to serve inquiries.');
      sendJson(res, 503, { ok: false, error: 'Admin access is not configured' });
      return;
    }
    if (!safeEqual(token.trim(), adminToken)) {
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
