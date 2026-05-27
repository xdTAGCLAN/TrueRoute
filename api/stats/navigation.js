const { sql, statsFromRow } = require('../../lib/db');
const { requireUser } = require('../../lib/auth');
const { json, method, readBody } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: 'Not signed in.' });

  const body = readBody(req);
  const distanceM = Math.max(0, Math.min(50000, Number(body.distanceM || 0)));
  const sessionIncrement = body.startedSession ? 1 : 0;

  const result = await sql`
    update profile_stats
    set
      navigated_distance_m = navigated_distance_m + ${distanceM},
      navigation_sessions = navigation_sessions + ${sessionIncrement},
      updated_at = now()
    where user_id = ${user.id}
    returning *
  `;

  return json(res, 200, { stats: statsFromRow(result.rows[0]) });
};
