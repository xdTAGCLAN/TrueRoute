const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sql, userFromRows } = require('./db');

const COOKIE_NAME = 'trueroute_session';

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable');
  }
  return process.env.JWT_SECRET;
}

function cookieOptions() {
  const secure = process.env.VERCEL_ENV === 'production';
  return [
    'HttpOnly',
    'Path=/',
    'SameSite=Lax',
    secure ? 'Secure' : '',
    'Max-Age=2592000'
  ].filter(Boolean).join('; ');
}

function setSessionCookie(res, userId) {
  const token = jwt.sign({ sub: userId }, getJwtSecret(), { expiresIn: '30d' });
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=${token}; ${cookieOptions()}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

function getCookie(req, name) {
  const raw = req.headers.cookie || '';
  return raw.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.split('=').slice(1).join('=');
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function requireUser(req) {
  const token = getCookie(req, COOKIE_NAME);
  if (!token) return null;
  let payload;
  try {
    payload = jwt.verify(token, getJwtSecret());
  } catch (e) {
    return null;
  }
  const userResult = await sql`select id, name, email from users where id = ${payload.sub}`;
  if (userResult.rowCount === 0) return null;
  const statsResult = await sql`select * from profile_stats where user_id = ${payload.sub}`;
  return userFromRows(userResult.rows[0], statsResult.rows[0]);
}

module.exports = {
  clearSessionCookie,
  hashPassword,
  requireUser,
  setSessionCookie,
  verifyPassword
};
