const { sql, statsFromRow } = require('../../lib/db');
const { requireUser } = require('../../lib/auth');
const { json, method } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: 'Not signed in.' });

  const result = await sql`
    update profile_stats
    set reroutes_accepted = reroutes_accepted + 1, updated_at = now()
    where user_id = ${user.id}
    returning *
  `;

  return json(res, 200, { stats: statsFromRow(result.rows[0]) });
};
