const { sql, statsFromRow } = require('../../lib/db');
const { requireUser } = require('../../lib/auth');
const { json, method } = require('../../lib/http');

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: 'Not signed in.' });

  const result = await sql`
    update profile_stats
    set
      routes_generated = 0,
      generated_distance_m = 0,
      navigated_distance_m = 0,
      navigation_sessions = 0,
      reroutes_accepted = 0,
      total_compute_ms = 0,
      nodes_visited = 0,
      road_segments = 0,
      longest_route_m = 0,
      route_modes = '{"car":0,"bike":0,"walk":0}'::jsonb,
      favorite_mode = 'car',
      last_route_at = null,
      updated_at = now()
    where user_id = ${user.id}
    returning *
  `;

  return json(res, 200, { stats: statsFromRow(result.rows[0]) });
};
