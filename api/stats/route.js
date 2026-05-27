const { sql, statsFromRow } = require('../../lib/db');
const { requireUser } = require('../../lib/auth');
const { json, method, readBody } = require('../../lib/http');

const MODES = new Set(['car', 'bike', 'walk']);

module.exports = async function handler(req, res) {
  if (!method(req, res, ['POST'])) return;
  const user = await requireUser(req);
  if (!user) return json(res, 401, { error: 'Not signed in.' });

  const body = readBody(req);
  const distanceM = Math.max(0, Number(body.distanceM || 0));
  const computeMs = Math.max(0, Number(body.computeMs || 0));
  const nodesVisited = Math.max(0, Math.round(Number(body.nodesVisited || 0)));
  const roadSegments = Math.max(0, Math.round(Number(body.roadSegments || 0)));
  const mode = MODES.has(body.mode) ? body.mode : 'car';

  const currentModes = user.stats.routeModes || { car: 0, bike: 0, walk: 0 };
  currentModes[mode] = (currentModes[mode] || 0) + 1;
  const favoriteMode = Object.entries(currentModes).sort((a, b) => b[1] - a[1])[0][0];

  const result = await sql`
    update profile_stats
    set
      routes_generated = routes_generated + 1,
      generated_distance_m = generated_distance_m + ${distanceM},
      total_compute_ms = total_compute_ms + ${computeMs},
      nodes_visited = nodes_visited + ${nodesVisited},
      road_segments = road_segments + ${roadSegments},
      longest_route_m = greatest(longest_route_m, ${distanceM}),
      route_modes = ${JSON.stringify(currentModes)}::jsonb,
      favorite_mode = ${favoriteMode},
      last_route_at = now(),
      updated_at = now()
    where user_id = ${user.id}
    returning *
  `;

  return json(res, 200, { stats: statsFromRow(result.rows[0]) });
};
