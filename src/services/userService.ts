import { UserRow } from '../db';

export async function getAllUsers(db: D1Database) {
  const { results } = await db
    .prepare('SELECT line_uid, requester_name, car_no, group_car, emp_no FROM users_profile ORDER BY requester_name')
    .all<UserRow>();

  return results.map(row => ({
    line_uid: row.line_uid,
    emp_no: row.emp_no || '',
    requester_name: row.requester_name,
    car_no: row.car_no,
    group_car: row.group_car,
    // Backward compatibility aliases
    Line_uid: row.line_uid,
  }));
}

export async function saveUser(
  db: D1Database,
  payload: {
    isEdit?: boolean;
    line_uid?: string;
    Line_uid?: string;
    emp_no?: string;
    requester_name: string;
    car_no: string;
    group_car: number | string;
  }
) {
  const lineUid = (payload.line_uid || payload.Line_uid)?.trim() ?? '';
  const empNo = payload.emp_no?.trim() ?? '';
  const reqName = payload.requester_name?.trim() ?? '';
  const carNo = payload.car_no?.trim() ?? '';
  const groupCar = parseInt(String(payload.group_car), 10) || 1;
  const isEdit = !!payload.isEdit;

  if (!lineUid) throw new Error('กรุณาระบุ Line UID');
  if (!reqName) throw new Error('กรุณาระบุชื่อผู้ขอเบิก');
  if (!carNo) throw new Error('กรุณาระบุทะเบียนรถ');

  if (!isEdit) {
    const existing = await db
      .prepare('SELECT line_uid FROM users_profile WHERE line_uid = ?')
      .bind(lineUid)
      .first<{ line_uid: string }>();

    if (existing) {
      throw new Error(`Line UID '${lineUid}' มีอยู่ในระบบแล้ว`);
    }

    await db
      .prepare(
        `INSERT INTO users_profile (line_uid, requester_name, car_no, group_car, emp_no, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, datetime('now', '+7 hours'), datetime('now', '+7 hours'))`
      )
      .bind(lineUid, reqName, carNo, groupCar, empNo)
      .run();

    return lineUid;
  } else {
    const result = await db
      .prepare(
        `UPDATE users_profile
         SET requester_name = ?, car_no = ?, group_car = ?, emp_no = ?, updated_at = datetime('now', '+7 hours')
         WHERE line_uid = ?`
      )
      .bind(reqName, carNo, groupCar, empNo, lineUid)
      .run();

    if (result.meta.changes === 0) {
      throw new Error('ไม่พบข้อมูลผู้ใช้ที่ต้องการแก้ไข');
    }

    return lineUid;
  }
}

export async function deleteUser(db: D1Database, lineUid: string) {
  const result = await db
    .prepare('DELETE FROM users_profile WHERE line_uid = ?')
    .bind(lineUid)
    .run();

  if (result.meta.changes === 0) {
    throw new Error('ไม่พบข้อมูลผู้ใช้ที่ต้องการลบ');
  }

  return { success: true, lineUid };
}
