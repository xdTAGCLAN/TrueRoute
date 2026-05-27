const { sql, userFromRows } = require('../../lib/db');
const { setSessionCookie, verifyPassword } = require('../../lib/auth');
const { json, method, readBody } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;

  const { email, password } = readBody(req);
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  const userResult = await sql`select id, name, email, password_hash from users where email = ${cleanEmail}`;
  if (userResult.rowCount === 0) return json(res, 401, { error: 'Invalid email or password.' });

  const user = userResult.rows[0];
  const ok = await verifyPassword(cleanPassword, user.password_hash);
  if (!ok) return json(res, 401, { error: 'Invalid email or password.' });

  const statsResult = await sql`select * from profile_stats where user_id = ${user.id}`;
  setSessionCookie(res, user.id);
  return json(res, 200, { user: userFromRows(user, statsResult.rows[0]) });
};
