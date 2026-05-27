const { sql } = require('@vercel/postgres');

function statsFromRow(row) {
  if (!row) return null;
  return {
    routesGenerated: row.routes_generated || 0,
    generatedDistanceM: Number(row.generated_distance_m || 0),
    navigatedDistanceM: Number(row.navigated_distance_m || 0),
    navigationSessions: row.navigation_sessions || 0,
    reroutesAccepted: row.reroutes_accepted || 0,
    totalComputeMs: Number(row.total_compute_ms || 0),
    nodesVisited: Number(row.nodes_visited || 0),
    roadSegments: Number(row.road_segments || 0),
    longestRouteM: Number(row.longest_route_m || 0),
    routeModes: row.route_modes || { car: 0, bike: 0, walk: 0 },
    favoriteMode: row.favorite_mode || 'car',
    lastRouteAt: row.last_route_at,
    createdAt: row.created_at
  };
}

function userFromRows(user, stats) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    stats: statsFromRow(stats)
  };
}

module.exports = { sql, statsFromRow, userFromRows };
