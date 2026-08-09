const { createEstimate, prependGithubRecord, sendCrmRecord, sendJson, sendTelegramNotification, enforceRateLimit, verifyTurnstile } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    enforceRateLimit(req, 'estimate', 20, 10 * 60 * 1000);
    await verifyTurnstile(req.body?.turnstileToken, req);
    const estimate = createEstimate(req.body || {}, req);
    await prependGithubRecord(
      'data/production-rental-estimates.json',
      estimate,
      `Record rental estimate ${estimate.id}`
    );
    await sendTelegramNotification('rental-estimate', estimate);
    sendCrmRecord('rental-estimate', estimate).catch(err => console.error('CRM error:', err.message));
    sendJson(res, 201, { ok: true, estimate });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { ok: false, error: error.message || 'Invalid rental estimate payload' });
  }
};
