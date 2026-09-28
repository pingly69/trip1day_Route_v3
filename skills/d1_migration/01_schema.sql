-- ====================================================================
-- Cloudflare D1 (SQLite) Schema Migration
-- Database: Trip1Day-db
-- Updated based on Technical Alignment on 2026-09-19
-- ====================================================================

PRAGMA foreign_keys = ON;

-- 1. Table: users_profile
CREATE TABLE IF NOT EXISTS users_profile (
  line_uid          TEXT NOT NULL PRIMARY KEY,  -- LINE userId ตรวจสอบจาก LIFF
  requester_name    TEXT NOT NULL,              -- ชื่อผู้ขอเบิก
  car_no            TEXT NOT NULL DEFAULT '',   -- ทะเบียนรถ (auto-fill ได้ แก้ไขได้เสมอ)
  group_car         INTEGER NOT NULL DEFAULT 1, -- กลุ่มอัตรา (1=group_car1, 2=group_car2)
  emp_no            TEXT NOT NULL DEFAULT '',   -- รหัสพนักงาน (HR Employee ID)
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Table: master_site
CREATE TABLE IF NOT EXISTS master_site (
  site_id    TEXT NOT NULL PRIMARY KEY,         -- ERP Code ระบุโดยผู้ใช้ (ห้ามซ้ำ)
  site_name  TEXT NOT NULL,                     -- ชื่อ Site
  active     INTEGER NOT NULL DEFAULT 1         -- 1=TRUE, 0=FALSE (SQLite ไม่มี BOOLEAN)
);

-- Unique index ป้องกันชื่อ Site ซ้ำ (case-insensitive, trim space)
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_name_lower
  ON master_site (LOWER(TRIM(site_name)));

CREATE INDEX IF NOT EXISTS idx_master_site_active_name
  ON master_site (active, site_name);

-- 3. Table: master_routes
CREATE TABLE IF NOT EXISTS master_routes (
  route_id      TEXT NOT NULL PRIMARY KEY,
  site_id       TEXT NOT NULL REFERENCES master_site(site_id) ON DELETE CASCADE, -- Cascade Delete อัตโนมัติเมื่อลบ Site
  route_name    TEXT NOT NULL,
  origin        TEXT NOT NULL DEFAULT '',
  destination   TEXT NOT NULL DEFAULT '',
  distance_km   REAL NOT NULL DEFAULT 0,        -- ทศนิยม 1 ตำแหน่ง
  active        INTEGER NOT NULL DEFAULT 1
);

-- Unique composite index ป้องกันชื่อเส้นทางซ้ำภายใน Site เดียวกัน
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_name_per_site
  ON master_routes (site_id, LOWER(TRIM(route_name)));

CREATE INDEX IF NOT EXISTS idx_master_routes_site_active
  ON master_routes (site_id, active);

-- 4. Table: master_config
CREATE TABLE IF NOT EXISTS master_config (
  key    TEXT NOT NULL PRIMARY KEY,
  value  TEXT NOT NULL                          -- เก็บเป็น TEXT, แปลงเป็น Number ใน Application Layer
);

-- 5. Table: rate_car
CREATE TABLE IF NOT EXISTS rate_car (
  dt_date     TEXT NOT NULL PRIMARY KEY,        -- วันที่เริ่มมีผล (ISO: YYYY-MM-DD)
  group_car1  REAL NOT NULL,                    -- อัตรา บาท/กม. กลุ่ม 1
  group_car2  REAL NOT NULL DEFAULT 0          -- เตรียมไว้สำหรับกลุ่ม 2
);

CREATE INDEX IF NOT EXISTS idx_rate_car_date_desc
  ON rate_car (dt_date DESC);

-- 6. Table: approve_users
CREATE TABLE IF NOT EXISTS approve_users (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  approve_request  TEXT NOT NULL,               -- ชื่อผู้อนุมัติ แสดงใน Dropdown
  line_profile     TEXT NOT NULL DEFAULT '',    -- รหัสอ้างอิงภายใน
  line_uid         TEXT NOT NULL DEFAULT '',    -- LINE UID ผู้อนุมัติ
  active           INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_approve_users_active
  ON approve_users (active);

-- 7. Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id    TEXT NOT NULL PRIMARY KEY,  -- UUID v4 สร้างโดย Backend
  req_name          TEXT NOT NULL,
  req_line_user_id  TEXT NOT NULL,              -- LINE userId ของผู้ขอเบิก
  req_date          TEXT NOT NULL,              -- YYYY-MM-DD
  plate_no          TEXT NOT NULL DEFAULT '',   -- ทะเบียนรถ
  site_id           TEXT NOT NULL,              -- ไม่ใส่ Hard FK เพื่อรองรับ Snapshot ประวัติเก่าและการย้าย service
  site_name         TEXT NOT NULL,              -- Denormalize snapshot ไว้เพื่อความเร็ว
  travel_purpose    TEXT NOT NULL DEFAULT '',
  image_url         TEXT NOT NULL DEFAULT '',
  total_km          REAL NOT NULL DEFAULT 0,
  toll_fee          REAL NOT NULL DEFAULT 0,
  park_fee          REAL NOT NULL DEFAULT 0,
  flat_rate_fee     REAL NOT NULL DEFAULT 0,
  net_total         REAL NOT NULL DEFAULT 0,
  approver          TEXT NOT NULL DEFAULT '',
  status            TEXT NOT NULL DEFAULT 'DRAFT'
                      CHECK (status IN ('DRAFT','PENDING','APPROVED','REJECTED')),
  approve_datetime  TEXT,
  trip_details      TEXT NOT NULL DEFAULT '[]',  -- JSON Array
  created_at        TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- INDEX 1: UNIQUE Constraint = "1 คน + 1 วัน + 1 Site = 1 Record เท่านั้น" (ป้องกัน Duplicate 100%)
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_date_user_site
  ON transactions (req_date, req_line_user_id, site_id);

-- INDEX 2: listTransactionsByDate ใช้ req_date + req_line_user_id
CREATE INDEX IF NOT EXISTS idx_transactions_date_user
  ON transactions (req_date, req_line_user_id);

-- INDEX 3: Filter Created_At สำหรับหน้า Dashboard ของ Admin / HR
CREATE INDEX IF NOT EXISTS idx_transactions_created_at
  ON transactions (created_at);

-- INDEX 4: Filter Req_Date
CREATE INDEX IF NOT EXISTS idx_transactions_req_date
  ON transactions (req_date);

-- INDEX 5: Filter Approve_Datetime
CREATE INDEX IF NOT EXISTS idx_transactions_approve_datetime
  ON transactions (approve_datetime);

-- INDEX 6: Filter Site + Status
CREATE INDEX IF NOT EXISTS idx_transactions_site_status
  ON transactions (site_id, status);
