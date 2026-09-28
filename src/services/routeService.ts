import { RouteRow } from '../db';

export async function getAllRoutes(db: D1Database) {
  const { results } = await db
    .prepare(
      `SELECT r.route_id, r.site_id, COALESCE(s.site_name, '(ไม่พบ Site)') AS site_name,
              r.route_name, r.origin, r.destination, r.distance_km, r.active
       FROM master_routes r
       LEFT JOIN master_site s ON r.site_id = s.site_id
       ORDER BY r.route_name`
    )
    .all<RouteRow>();

  return results.map(row => ({
    Route_ID: row.route_id,
    Site_ID: row.site_id,
    Site_Name: row.site_name,
    Route_Name: row.route_name,
    Origin: row.origin,
    Destination: row.destination,
    Distance_KM: row.distance_km,
    Active: row.active === 1,
  }));
}

export async function saveRoute(
  db: D1Database,
  payload: {
    Route_ID?: string;
    Site_ID: string;
    Route_Name: string;
    Origin: string;
    Destination: string;
    Distance_KM: number | string;
    Active: boolean;
  }
) {
  const siteId = payload.Site_ID?.trim() ?? '';
  const routeName = payload.Route_Name?.trim() ?? '';
  const origin = payload.Origin?.trim() ?? '';
  const destination = payload.Destination?.trim() ?? '';
  const routeId = payload.Route_ID?.trim() ?? '';
  const active = payload.Active ? 1 : 0;

  if (!siteId) throw new Error('กรุณาเลือก Site');
  if (!routeName) throw new Error('กรุณาระบุชื่อเส้นทาง');
  if (!origin || !destination) throw new Error('กรุณาระบุต้นทางและปลายทาง');

  const distNum = parseFloat(String(payload.Distance_KM));
  if (isNaN(distNum) || distNum <= 0) {
    throw new Error('ระยะทางต้องมากกว่า 0');
  }
  const distanceKM = Math.round(distNum * 10) / 10;

  // Uniqueness check: within the same Site (case-insensitive & trim)
  const duplicate = await db
    .prepare(
      `SELECT route_id FROM master_routes
       WHERE site_id = ?
         AND LOWER(TRIM(route_name)) = LOWER(TRIM(?))
         AND route_id != ?`
    )
    .bind(siteId, routeName, routeId)
    .first<{ route_id: string }>();

  if (duplicate) {
    throw new Error('ชื่อเส้นทางนี้มีอยู่แล้วใน Site นี้');
  }

  if (!routeId) {
    const newId = crypto.randomUUID();
    await db
      .prepare(
        `INSERT INTO master_routes (route_id, site_id, route_name, origin, destination, distance_km, active)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(newId, siteId, routeName, origin, destination, distanceKM, active)
      .run();

    return newId;
  } else {
    const result = await db
      .prepare(
        `UPDATE master_routes
         SET site_id = ?, route_name = ?, origin = ?, destination = ?, distance_km = ?, active = ?
         WHERE route_id = ?`
      )
      .bind(siteId, routeName, origin, destination, distanceKM, active, routeId)
      .run();

    if (result.meta.changes === 0) {
      throw new Error('ไม่พบเส้นทางที่ต้องการแก้ไข');
    }

    return routeId;
  }
}

export async function deleteRoute(db: D1Database, routeId: string) {
  const result = await db
    .prepare('DELETE FROM master_routes WHERE route_id = ?')
    .bind(routeId)
    .run();

  if (result.meta.changes === 0) {
    throw new Error('ไม่พบเส้นทางที่ต้องการลบ');
  }

  return { success: true, routeId };
}
