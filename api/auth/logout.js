const { clearSessionCookie } = require('../../lib/auth');
const { json, method } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
};
