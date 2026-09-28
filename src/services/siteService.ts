import { SiteRow } from '../db';

export async function getAllSites(db: D1Database) {
  const { results } = await db
    .prepare('SELECT site_id, site_name, active FROM master_site ORDER BY site_name')
    .all<SiteRow>();

  return results.map(row => ({
    Site_ID: row.site_id,
    Site_Name: row.site_name,
    Active: row.active === 1,
  }));
}

export async function saveSite(
  db: D1Database,
  payload: {
    isEdit?: boolean;
    Site_ID: string;
    Site_Name: string;
    Active: boolean;
  }
) {
  const siteId = payload.Site_ID?.trim() ?? '';
  const name = payload.Site_Name?.trim() ?? '';
  const active = payload.Active ? 1 : 0;
  const isEdit = !!payload.isEdit;

  if (!siteId) {
    throw new Error('กรุณาระบุรหัส Site (Site ID / ERP Code)');
  }
  if (!name) {
    throw new Error('กรุณาระบุชื่อ Site');
  }

  // Uniqueness check for Site_Name (case-insensitive & trim)
  const nameDuplicate = await db
    .prepare(
      `SELECT site_id FROM master_site 
       WHERE LOWER(TRIM(site_name)) = LOWER(TRIM(?)) 
         AND site_id != ?`
    )
    .bind(name, siteId)
    .first<{ site_id: string }>();

  if (nameDuplicate) {
    throw new Error('ชื่อ Site นี้มีอยู่แล้วในระบบ');
  }

  if (!isEdit) {
    // Check if Site_ID already exists
    const idExists = await db
      .prepare('SELECT site_id FROM master_site WHERE site_id = ?')
      .bind(siteId)
      .first<{ site_id: string }>();

    if (idExists) {
      throw new Error(`รหัส Site '${siteId}' มีอยู่แล้วในระบบ`);
    }

    await db
      .prepare('INSERT INTO master_site (site_id, site_name, active) VALUES (?, ?, ?)')
      .bind(siteId, name, active)
      .run();

    return siteId;
  } else {
    const result = await db
      .prepare('UPDATE master_site SET site_name = ?, active = ? WHERE site_id = ?')
      .bind(name, active, siteId)
      .run();

    if (result.meta.changes === 0) {
      throw new Error('ไม่พบ Site ที่ต้องการแก้ไข');
    }

    return siteId;
  }
}

export async function deleteSite(db: D1Database, siteId: string) {
  // Ensure Foreign Keys are enabled for CASCADE deletion of routes
  await db.prepare('PRAGMA foreign_keys = ON;').run();

  const result = await db
    .prepare('DELETE FROM master_site WHERE site_id = ?')
    .bind(siteId)
    .run();

  if (result.meta.changes === 0) {
    throw new Error('ไม่พบ Site ที่ต้องการลบ');
  }

  return { success: true, siteId };
}
