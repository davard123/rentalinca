const { prependGithubRecord, sanitizeInquiry, sendJson, sendTelegramNotification, sendResendAutoReply, sendCrmRecord, safeEqual, enforceRateLimit, verifyTurnstile, updateGithubRecordStatus } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      enforceRateLimit(req, 'inquiry', 6, 10 * 60 * 1000);
      await verifyTurnstile(req.body?.turnstileToken, req);
      const inquiry = sanitizeInquiry(req.body || {}, req);
      await prependGithubRecord(
        'data/production-inquiries.json',
        inquiry,
        `Record inquiry ${inquiry.id}`
      );
      await sendTelegramNotification('inquiry', inquiry);
      sendCrmRecord('inquiry', inquiry).catch(err => console.error('CRM error:', err.message));
      sendResendAutoReply(inquiry).catch(err => console.error('Resend error:', err.message));
      sendJson(res, 201, { ok: true, id: inquiry.id });
    } catch (error) {
      sendJson(res, error.statusCode || 400, { ok: false, error: error.message || 'Invalid inquiry payload' });
    }
    return;
  }

  if (req.method === 'PATCH') {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, '') || '';
    const adminToken = String(process.env.ADMIN_TOKEN || '').trim();
    if (!adminToken || !safeEqual(token.trim(), adminToken)) {
      sendJson(res, 401, { ok: false, error: 'Unauthorized' });
      return;
    }
    try {
      const result = await updateGithubRecordStatus(String(req.body?.id || ''), String(req.body?.status || 'new'));
      sendJson(res, 200, { ok: true, ...result });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message || 'Unable to update status' });
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
      const all = Array.isArray(data) ? data : [];
      const page = Math.max(1, Number(req.query?.page || 1));
      const limit = Math.min(100, Math.max(1, Number(req.query?.limit || 25)));
      const start = (page - 1) * limit;
      sendJson(res, 200, { ok: true, inquiries: all.slice(start, start + limit), page, limit, total: all.length, pages: Math.max(1, Math.ceil(all.length / limit)) });
    } catch (error) {
      sendJson(res, error.statusCode || 500, { ok: false, error: error.message || 'Unable to read inquiries' });
    }
    return;
  }

  sendJson(res, 405, { ok: false, error: 'Method not allowed' });
};
