const { requireUser } = require('../../lib/auth');
const { json, method } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['GET'])) return;
  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: 'Not signed in.' });
  return json(res, 200, { user });
};
