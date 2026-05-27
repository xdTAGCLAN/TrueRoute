const { sql, userFromRows } = require('../../lib/db');
const { hashPassword, setSessionCookie } = require('../../lib/auth');
const { json, method, readBody } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;

  const { name, email, password } = readBody(req);
  const cleanName = String(name || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '');

  if (cleanName.length < 2) return json(res, 400, { error: 'Name must be at least 2 characters.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return json(res, 400, { error: 'Enter a valid email address.' });
  if (cleanPassword.length < 8) return json(res, 400, { error: 'Password must be at least 8 characters.' });

  try {
    const passwordHash = await hashPassword(cleanPassword);
    const userResult = await sql`
      insert into users (name, email, password_hash)
      values (${cleanName}, ${cleanEmail}, ${passwordHash})
      returning id, name, email
    `;
    const user = userResult.rows[0];
    const statsResult = await sql`
      insert into profile_stats (user_id)
      values (${user.id})
      returning *
    `;
    setSessionCookie(res, user.id);
    return json(res, 201, { user: userFromRows(user, statsResult.rows[0]) });
  } catch (error) {
    if (String(error.message || '').includes('duplicate key')) {
      return json(res, 409, { error: 'An account with that email already exists.' });
    }
    console.error(error);
    return json(res, 500, { error: 'Could not create account.' });
  }
};
