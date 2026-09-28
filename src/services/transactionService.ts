import { TransactionFilters, TransactionRow } from '../db';

export async function getTransactions(db: D1Database, filters: TransactionFilters) {
  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  // 1. Created_At Range (Stored as ISO: YYYY-MM-DDTHH:MM:SS.sss+07:00)
  if (filters.startCreatedAt) {
    let s = filters.startCreatedAt.trim().replace(' ', 'T');
    if (s.length === 10) s += 'T00:00:00';
    else if (s.length === 16) s += ':00';
    conditions.push('t.created_at >= ?');
    bindings.push(s);
  }
  if (filters.endCreatedAt) {
    let s = filters.endCreatedAt.trim().replace(' ', 'T');
    if (s.length === 10) s += 'T23:59:59.999+07:00';
    else if (s.length === 16) s += ':59.999+07:00';
    else if (s.length === 19) s += '.999+07:00';
    conditions.push('t.created_at <= ?');
    bindings.push(s);
  }

  // 2. Req_Date Range (Stored as YYYY-MM-DD)
  if (filters.startReqDate) {
    const s = filters.startReqDate.trim().slice(0, 10);
    conditions.push('t.req_date >= ?');
    bindings.push(s);
  }
  if (filters.endReqDate) {
    const s = filters.endReqDate.trim().slice(0, 10);
    conditions.push('t.req_date <= ?');
    bindings.push(s);
  }

  // 3. Approve_Datetime Range (Stored as YYYY-MM-DD HH:MM:SS with space)
  if (filters.startApprove) {
    let s = filters.startApprove.trim().replace('T', ' ');
    if (s.length === 10) s += ' 00:00:00';
    else if (s.length === 16) s += ':00';
    conditions.push('t.approve_datetime >= ?');
    bindings.push(s);
  }
  if (filters.endApprove) {
    let s = filters.endApprove.trim().replace('T', ' ');
    if (s.length === 10) s += ' 23:59:59';
    else if (s.length === 16) s += ':59';
    conditions.push('t.approve_datetime <= ?');
    bindings.push(s);
  }

  // 4. Exact matches
  if (filters.siteId && filters.siteId !== '') {
    conditions.push('t.site_id = ?');
    bindings.push(filters.siteId);
  }
  if (filters.status && filters.status !== 'ALL') {
    conditions.push('t.status = ?');
    bindings.push(filters.status);
  }

  // 5. Partial searches
  if (filters.reqName && filters.reqName.trim() !== '') {
    const term = `%${filters.reqName.trim().toLowerCase()}%`;
    conditions.push('(LOWER(t.req_name) LIKE ? OR LOWER(COALESCE(u.emp_no, "")) LIKE ?)');
    bindings.push(term, term);
  }
  if (filters.plateNo && filters.plateNo.trim() !== '') {
    conditions.push('LOWER(t.plate_no) LIKE ?');
    bindings.push(`%${filters.plateNo.trim().toLowerCase()}%`);
  }
  if (filters.approver && filters.approver.trim() !== '') {
    conditions.push('LOWER(t.approver) LIKE ?');
    bindings.push(`%${filters.approver.trim().toLowerCase()}%`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const sql = `
    SELECT 
      t.transaction_id,
      t.req_name,
      t.req_line_user_id,
      t.req_date,
      t.plate_no,
      t.site_id,
      t.site_name,
      t.travel_purpose,
      t.image_url,
      t.total_km,
      t.toll_fee,
      t.park_fee,
      t.flat_rate_fee,
      t.net_total,
      t.approver,
      t.status,
      t.approve_datetime,
      t.trip_details,
      t.created_at,
      u.emp_no
    FROM transactions t
    LEFT JOIN users_profile u ON t.req_line_user_id = u.line_uid
    ${whereClause}
    ORDER BY t.created_at DESC
  `;

  const stmt = db.prepare(sql);
  const bound = bindings.length > 0 ? stmt.bind(...bindings) : stmt;
  const { results } = await bound.all<TransactionRow>();

  // Map to the object schema expected by OLD_UI table & excel export
  return results.map(r => ({
    Transaction_ID: r.transaction_id,
    Req_Date: r.req_date,
    Emp_No: r.emp_no || '',
    Req_LINE_UserId: r.req_line_user_id,
    Req_Name: r.req_name,
    Plate_No: r.plate_no,
    Site_ID: r.site_id,
    Site_Name: r.site_name,
    Travel_Purpose: r.travel_purpose,
    Image_URL: r.image_url,
    Trip_Details: r.trip_details,
    Total_KM: r.total_km,
    Toll_Fee: r.toll_fee,
    Park_Fee: r.park_fee,
    Flat_Rate_Fee: r.flat_rate_fee,
    Net_Total: r.net_total,
    Approver: r.approver,
    Status: r.status,
    Approve_Datetime: r.approve_datetime,
    Created_At: r.created_at,
  }));
}
