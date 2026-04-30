const { createEstimate, prependGithubRecord, sendJson } = require('./_shared');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const estimate = createEstimate(req.body || {}, req);
    await prependGithubRecord(
      'data/production-rental-estimates.json',
      estimate,
      `Record rental estimate ${estimate.id}`
    );
    sendJson(res, 201, { ok: true, estimate });
  } catch (error) {
    sendJson(res, error.statusCode || 400, { ok: false, error: error.message || 'Invalid rental estimate payload' });
  }
};
