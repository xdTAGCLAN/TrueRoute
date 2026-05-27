const { sql } = require('../../lib/db');
const { clearSessionCookie, requireUser } = require('../../lib/auth');
const { json, method } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;

  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: 'Not signed in.' });

  try {
    await sql`delete from users where id = ${user.id}`;
    clearSessionCookie(res);
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Could not delete account.' });
  }
};
