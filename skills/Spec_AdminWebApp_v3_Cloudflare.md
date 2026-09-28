# 📄 Detailed System Specification & Architecture (Admin Web App) — v3 (Cloudflare Migration)
**Project:** Trip1Day - Admin Web Application  
**Stack:** Cloudflare Workers + TypeScript + D1 (SQLite)  
**Target Users:** HR / Admin (Desktop/Notebook)  
**อ้างอิงจาก:** Spec v2 (Google Apps Script + Google Sheet) — Business Logic และ UI/UX คงเดิมทั้งหมด

> เอกสารฉบับนี้เป็นการ **Migration** จาก Google Apps Script + Google Sheet ไปยัง **Cloudflare Workers + TypeScript + D1 (SQLite)** โดย:
> - ✅ **Business Logic** คงเดิม 100% (Validation, Cascade Delete, Uniqueness, Sorting, Date Filter ฯลฯ)
> - ✅ **UI/UX และหน้าจอ** คงเดิม 100% (Layout, Modal, Badge, Export Excel ฯลฯ)
> - ❌ **ตัดออก:** Cache Management ทั้งหมด (Cloudflare Workers มี Cold Start < 1ms ไม่จำเป็น)
> - ❌ **ตัดออก:** LockService (D1 + SQL Transactions ทำ Atomicity ได้โดยธรรมชาติ)
> - ✅ **เพิ่มใหม่:** SQL Schema พร้อม Index, SQL Query สำหรับทุก Operation, REST API pattern

---

## 🔄 Changelog จากฉบับ v2

| # | หัวข้อ | v2 (GAS + Sheet) | v3 (Cloudflare + SQLite) |
|---|---|---|---|
| 1 | Backend Runtime | Google Apps Script | Cloudflare Workers (TypeScript) |
| 2 | Database | Google Sheet | D1 SQLite (Cloudflare) |
| 3 | Concurrency | LockService 10 วินาที | SQL Transaction (Atomic by default) |
| 4 | Cache | CacheService + Clear Cache Button | **ไม่มี** — ตัดออก (Workers ไม่จำเป็น) |
| 5 | UUID | `Utilities.getUuid()` | `crypto.randomUUID()` (Web Crypto API) |
| 6 | Deployment | GAS Web App Deploy | `wrangler deploy` |
| 7 | API Style | `google.script.run` | REST API (`fetch`) JSON over HTTP |
| 8 | Date/Time | GAS `Utilities.formatDate()` | ISO 8601 ใน SQLite, format ที่ Client |
| 9 | Auth Guard | Passcode ใน `Config.gs` | Passcode hash ใน `wrangler secret` |
| 10 | Performance | ช้า (Sheet I/O + Lock) | เร็วมาก (SQLite index + Edge network) |

---

## 📌 Business Requirements (คงเดิมจาก v2 — ห้ามเปลี่ยน)

### 1. การจัดการ Site (Master_Site)
- [ ] **Create/Update:** Admin เพิ่ม/แก้ไข Site ได้ ข้อมูลอัปเดตลง SQLite ถูกต้อง
- [ ] **Uniqueness:** ห้ามสร้าง/แก้ไข Site ให้มี `Site_Name` ซ้ำกับที่มีอยู่แล้ว (case-insensitive, trim ช่องว่าง) — เช็คที่ SQL `WHERE LOWER(TRIM(site_name)) = ?`
- [ ] **Sorting:** รายชื่อ Site ใน Dropdown และตาราง เรียงตามตัวอักษรไทย ก-ฮ / A-Z (`Intl.Collator('th')` ฝั่ง Client เหมือนเดิม — ดูข้อ 4.2)
- [ ] **Delete (Cascade):** ลบ Site แล้ว Route ที่ผูกอยู่ถูกลบตามทั้งหมด ผ่าน SQL `ON DELETE CASCADE` — มี Alert ยืนยันก่อนลบเสมอ
- [ ] **Active Status:** เปิด-ปิด Site ได้ และ Record ที่ Inactive ยังแสดงในตารางพร้อม Badge (ไม่หายไปจากตาราง)

### 2. การจัดการ Route (Master_Routes)
- [ ] **Relation:** ทุก Route ผูกกับ `Site_ID` ได้
- [ ] **Uniqueness:** ห้ามสร้าง Route ที่มี `Route_Name` ซ้ำกัน **ภายใน Site เดียวกัน** (ต่าง Site ชื่อซ้ำกันได้) — เช็คที่ SQL `WHERE site_id = ? AND LOWER(TRIM(route_name)) = ?`
- [ ] **Create/Update:** ระยะทางบันทึกเป็นทศนิยม 1 ตำแหน่งเสมอ (ปัดทั้ง Client และ Server เหมือนกัน)
- [ ] **Filtering in Admin:** กรองดู Route เฉพาะ Site ที่เลือกได้ (ฝั่ง Client จาก data ที่โหลดมาแล้ว)
- [ ] **Active Status:** เปิด-ปิดได้ และแสดง Badge เหมือน Site

### 3. หน้ารายงาน (Dashboard / Transactions)
- [ ] **View All:** ดูรายการเบิกค่าเดินทางครบทุกคอลัมน์สำคัญ
- [ ] **Filter - Created_At:** กรองช่วงเวลาบันทึกเข้าระบบได้ (ตัวกรองหลักของ HR)
- [ ] **Filter - Dates:** กรอง `Req_Date` และ `Approve_Datetime` ได้
- [ ] **Filter - Text/Dropdown:** กรองชื่อผู้เบิก, ทะเบียนรถ, ผู้อนุมัติ, Site, Status ได้
- [ ] **Export Excel:** Export เฉพาะข้อมูลที่ Filter อยู่ หัวคอลัมน์เป็นภาษาไทย ครบทุกคอลัมน์

### 4. สถาปัตยกรรมและการตั้งค่าระบบ
- [ ] **Access & Authentication:** Passcode Guard ฝั่ง Client (เก็บ hash ใน env secret `ADMIN_PASSCODE_HASH`) + `sessionStorage` (คงเดิม)
- [ ] **UI/UX & Code Structure:** Sidebar ซ้าย, Modular file structure (คงเดิม)

> **หมายเหตุ:** ไม่มีปุ่ม "Clear Cache" อีกต่อไป — ตัดออกจาก menu และ UI ทั้งหมด

---

## 0. 🚀 Project Setup & Deployment

### 0.1 Prerequisites
```bash
npm install -g wrangler
wrangler login
```

### 0.2 สร้างโปรเจกต์ใหม่
```bash
npm create cloudflare@latest trip1day-admin -- --template hello-world
cd trip1day-admin
```

### 0.3 โครงสร้าง `wrangler.toml`
```toml
name = "trip1day-admin"
main = "src/index.ts"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "trip1day"
database_id = "<YOUR_D1_DATABASE_ID>"

[vars]
TIMEZONE = "Asia/Bangkok"
# ADMIN_PASSCODE_HASH เก็บเป็น Secret (ไม่ใส่ใน toml ตรงๆ)
# ตั้งค่าด้วย: wrangler secret put ADMIN_PASSCODE_HASH

[site]
bucket = "./public"
```

### 0.4 สร้าง D1 Database
```bash
wrangler d1 create trip1day
# จดค่า database_id แล้วใส่ใน wrangler.toml

# รัน Migration (สร้าง schema)
wrangler d1 execute trip1day --file=./migrations/0001_init.sql
```

### 0.5 Deploy
```bash
npm run build        # build Frontend ไปที่ ./public
wrangler deploy      # deploy Worker + static files
```

### 0.6 มาตรการความปลอดภัย (คงจากข้อ 0 v2)
1. **ห้าม hardcode URL** ของ Worker ไว้ในที่สาธารณะ — เก็บ URL ไว้ในช่องทางปิดเท่านั้น
2. **ชื่อ Worker** เลี่ยงชื่อที่เดาทางได้ง่าย (เช่นเลี่ยง `hr-admin`, `payroll`)
3. **ทุก request ที่เข้า Worker ให้ log**: timestamp + method + path (ดู Cloudflare Dashboard > Workers > Logs)
4. เป็นการตัดสินใจของฝ่าย Business ที่ยอมรับความเสี่ยงแล้ว — หากต้องการยกระดับ ให้เพิ่ม Cloudflare Access บน Worker ได้โดยไม่กระทบ Business Logic

---

## 1. 🗂️ File Structure

### 1.1 Backend (Cloudflare Worker — TypeScript)
```
src/
├── index.ts          — Entry point: ลงทะเบียน Routes ทั้งหมด, middleware (CORS, Auth)
├── config.ts         — CONFIG object (แทน Config.gs)
├── db.ts             — D1 Database helper & type bindings
├── routes/
│   ├── sites.ts      — GET/POST/PUT/DELETE /api/sites
│   ├── routes.ts     — GET/POST/PUT/DELETE /api/routes
│   └── transactions.ts — GET /api/transactions
├── services/
│   ├── siteService.ts    — Business Logic: validation, uniqueness, cascade
│   ├── routeService.ts   — Business Logic: validation, uniqueness
│   └── transactionService.ts — Business Logic: filtering, date range
└── utils.ts          — Helper functions (แทน Admin_Utils.gs)
```

### 1.2 Database Migrations
```
migrations/
└── 0001_init.sql     — Schema + Index ทั้งหมด (ดูข้อ 2)
```

### 1.3 Frontend (Static Files — เหมือนเดิม)
```
public/
├── index.html        — Layout, Sidebar, Content area
├── css/
│   └── styles.css    — Bootstrap 5, Custom Styles
└── js/
    ├── main.js       — SPA Router, AdminState
    ├── apiClient.js  — fetch() Promise wrapper (แทน google.script.run)
    ├── dashboard.js  — Dashboard view logic
    ├── masterSite.js — Master Site view logic
    └── masterRoute.js — Master Route view logic
```

---

## 2. 🗄️ Database Architecture (SQLite / D1)

> **ไฟล์:** `migrations/0001_init.sql`  
> รัน: `wrangler d1 execute trip1day --file=./migrations/0001_init.sql`

### 2.1 Table: `master_site`

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS master_site (
  site_id   TEXT PRIMARY KEY,               -- UUID (crypto.randomUUID())
  site_name TEXT NOT NULL,                  -- Unique (case-insensitive)
  active    INTEGER NOT NULL DEFAULT 1      -- 1 = Active, 0 = Inactive (SQLite ไม่มี BOOLEAN)
);

-- Index หลัก: Uniqueness check ด้วย site_name (case-insensitive)
-- UNIQUE index นี้ทำหน้าที่ทั้ง enforce uniqueness และเร่ง query ค้นหา
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_name_lower
  ON master_site (LOWER(TRIM(site_name)));

-- Index: กรองตาม active status
CREATE INDEX IF NOT EXISTS idx_site_active
  ON master_site (active);
```

### 2.2 Table: `master_route`

```sql
CREATE TABLE IF NOT EXISTS master_route (
  route_id     TEXT PRIMARY KEY,            -- UUID
  site_id      TEXT NOT NULL,
  route_name   TEXT NOT NULL,
  origin       TEXT NOT NULL,
  destination  TEXT NOT NULL,
  distance_km  REAL NOT NULL,               -- REAL = float, เก็บ 1 ตำแหน่งทศนิยม
  active       INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (site_id)
    REFERENCES master_site (site_id)
    ON DELETE CASCADE                       -- Cascade Delete อัตโนมัติ (แทน reverse-loop ใน GAS)
);

-- Index หลัก: JOIN กับ master_site และกรองตาม site
CREATE INDEX IF NOT EXISTS idx_route_site_id
  ON master_route (site_id);

-- Index: Uniqueness check ของ route_name ภายใน site เดียวกัน (case-insensitive)
-- UNIQUE composite index บน (site_id, lower_route_name) — ต่าง site ซ้ำกันได้
CREATE UNIQUE INDEX IF NOT EXISTS idx_route_name_per_site
  ON master_route (site_id, LOWER(TRIM(route_name)));

-- Index: กรองตาม active status
CREATE INDEX IF NOT EXISTS idx_route_active
  ON master_route (active);
```

### 2.3 Table: `transactions` (Admin อ่านอย่างเดียว — ห้าม Write จากระบบนี้)

```sql
CREATE TABLE IF NOT EXISTS transactions (
  transaction_id    TEXT PRIMARY KEY,
  req_line_user_id  TEXT,
  req_date          TEXT,                   -- ISO date string 'YYYY-MM-DD'
  req_name          TEXT,
  plate_no          TEXT,
  site_id           TEXT,
  site_name         TEXT,                   -- snapshot ณ เวลาที่บันทึก (ไม่ join live)
  total_km          REAL,
  toll_fee          REAL,
  park_fee          REAL,
  flat_rate_fee     REAL,
  net_total         REAL,
  approver          TEXT,
  status            TEXT,                   -- 'DRAFT'|'PENDING'|'APPROVED'|'REJECTED'
  approve_datetime  TEXT,                   -- ISO datetime string
  created_at        TEXT NOT NULL           -- ISO datetime string
);

-- Index หลัก: กรอง Created_At (ตัวกรองที่ HR ใช้บ่อยที่สุด)
CREATE INDEX IF NOT EXISTS idx_tx_created_at
  ON transactions (created_at);

-- Index: กรอง Req_Date
CREATE INDEX IF NOT EXISTS idx_tx_req_date
  ON transactions (req_date);

-- Index: กรอง Approve_Datetime
CREATE INDEX IF NOT EXISTS idx_tx_approve_datetime
  ON transactions (approve_datetime);

-- Index: กรอง Site + Status (เงื่อนไขที่มักใช้คู่กัน)
CREATE INDEX IF NOT EXISTS idx_tx_site_status
  ON transactions (site_id, status);

-- Index: กรอง Status เดี่ยว
CREATE INDEX IF NOT EXISTS idx_tx_status
  ON transactions (status);
```

> **หมายเหตุ:** `site_name` ใน `transactions` เป็น snapshot — ถ้าลบ Site ภายหลัง ข้อมูล Transaction เก่ายังแสดงชื่อ Site ได้ปกติ (ไม่ใช่ live join) เหมือน v2 ทุกประการ

### 2.4 D1 Binding & Config (`src/config.ts`)

```typescript
export const CONFIG = {
  TIMEZONE: 'Asia/Bangkok',
  TRANSACTION_STATUS: {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
} as const;

// Type สำหรับ Cloudflare Worker Bindings
export interface Env {
  DB: D1Database;
  ADMIN_PASSCODE_HASH: string; // Secret จาก: wrangler secret put ADMIN_PASSCODE_HASH
  TIMEZONE: string;
}
```

---

## 3. ⚙️ Backend API (Cloudflare Worker — REST)

### 3.0 กติกาบังคับสำหรับทุก API

#### Response Format (คงเดิมจาก v2)
ทุก endpoint คืนค่าในรูปแบบเดิมเสมอ ทีม Frontend ไม่ต้องเปลี่ยนโครงสร้างการอ่าน response:
```typescript
// Success
{ status: 'success', data: T }

// Error
{ status: 'error', message: string }
```

#### Error Handling Pattern
```typescript
// src/index.ts — ทุก route handler ครอบด้วย try/catch
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

// ทุก handler ครอบ try/catch เสมอ:
async function handleSomething(req: Request, env: Env): Promise<Response> {
  try {
    const result = await someService(env.DB, payload);
    return jsonResponse({ status: 'success', data: result });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal Server Error';
    return jsonResponse({ status: 'error', message }, 400);
  }
}
```

#### Concurrency
**ไม่ต้องใช้ LockService** — D1 รองรับ WAL mode และ SQL Transaction ทำให้ทุก write เป็น Atomic โดยอัตโนมัติ

#### ไม่มี Cache
**ไม่มี Cache ใดๆ** — ตัด CacheService, Clear Cache button, `MASTER_SITE_ACTIVE`, `MASTER_ROUTES_ACTIVE` ออกทั้งหมด  
Workers อยู่บน Edge network ใกล้ผู้ใช้ ความเร็วในการ query SQLite ด้วย Index เพียงพอ

---

### 3.1 Auth Middleware

**Endpoint: `POST /api/auth`** — ตรวจ passcode, คืน token

```typescript
// src/index.ts
async function handleAuth(request: Request, env: Env): Promise<Response> {
  const { passcode } = await request.json<{ passcode: string }>();
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(passcode));
  const hashHex = Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  if (hashHex !== env.ADMIN_PASSCODE_HASH) {
    return jsonResponse({ status: 'error', message: 'รหัสผ่านไม่ถูกต้อง' }, 401);
  }
  // คืน token = passcode hash เอง (stateless)
  return jsonResponse({ status: 'success', token: hashHex });
}

// Middleware: ทุก /api/* (ยกเว้น /api/auth) ต้องมี X-Admin-Token header
async function requireAuth(request: Request, env: Env): Promise<Response | null> {
  const token = request.headers.get('X-Admin-Token') ?? '';
  if (token !== env.ADMIN_PASSCODE_HASH) {
    return jsonResponse({ status: 'error', message: 'Unauthorized' }, 401);
  }
  return null; // null = ผ่าน middleware
}
```

> **การตั้งค่า ADMIN_PASSCODE_HASH:**
> ```bash
> # คำนวณ SHA-256 ของ passcode ที่ต้องการ แล้วตั้งเป็น secret
> # PowerShell: [System.Security.Cryptography.SHA256]::Create().ComputeHash([Text.Encoding]::UTF8.GetBytes("YOUR_PASSCODE")) | ForEach-Object { $_.ToString("x2") } | Join-String
> wrangler secret put ADMIN_PASSCODE_HASH
> # วาง hex string ของ hash ที่ได้
> ```

---

### 3.2 `GET /api/sites` — ดึง Site ทั้งหมด

**SQL:**
```sql
SELECT site_id, site_name, active
FROM master_site
ORDER BY site_name;
```

**TypeScript (Service Layer):**
```typescript
// src/services/siteService.ts
export async function getAllSites(db: D1Database) {
  const { results } = await db
    .prepare('SELECT site_id, site_name, active FROM master_site ORDER BY site_name')
    .all<{ site_id: string; site_name: string; active: number }>();

  return results.map(row => ({
    Site_ID: row.site_id,
    Site_Name: row.site_name,
    Active: row.active === 1,   // แปลง 0/1 เป็น boolean (แทน toBoolean())
  }));
}
```

**Return:** `{ status: 'success', data: [{Site_ID, Site_Name, Active}, ...] }`

**QA Test Case:**
- [ ] Site ที่ Active=false ยังอยู่ใน response (ไม่ถูกกรองออกที่ Backend)
- [ ] field `Active` เป็น boolean จริง ไม่ใช่ 0/1

---

### 3.3 `POST /api/sites` (สร้างใหม่) / `PUT /api/sites/:id` (แก้ไข)

**Payload:** `{ Site_Name: string, Active: boolean }` (POST) หรือ `{ Site_Name, Active }` (PUT)

**Logic (ทำตามลำดับเป๊ะ — คงจาก v2):**
```typescript
// src/services/siteService.ts
export async function saveSite(db: D1Database, payload: {
  Site_ID?: string;
  Site_Name: string;
  Active: boolean;
}) {
  // 1. Trim + Required check
  const name = payload.Site_Name?.trim() ?? '';
  if (!name) throw new Error('กรุณาระบุชื่อ Site');

  const isUpdate = !!payload.Site_ID;

  // 2. Uniqueness check (case-insensitive, ยกเว้นแถวตัวเอง)
  const duplicate = await db.prepare(`
    SELECT site_id FROM master_site
    WHERE LOWER(TRIM(site_name)) = LOWER(TRIM(?))
      AND site_id != ?
  `).bind(name, payload.Site_ID ?? '').first<{ site_id: string }>();

  if (duplicate) throw new Error('ชื่อ Site นี้มีอยู่แล้ว');

  // 3. Insert หรือ Update
  if (!isUpdate) {
    const newId = crypto.randomUUID();
    await db.prepare(
      'INSERT INTO master_site (site_id, site_name, active) VALUES (?, ?, ?)'
    ).bind(newId, name, payload.Active ? 1 : 0).run();
    return newId;
  } else {
    await db.prepare(
      'UPDATE master_site SET site_name = ?, active = ? WHERE site_id = ?'
    ).bind(name, payload.Active ? 1 : 0, payload.Site_ID).run();
    return payload.Site_ID;
  }
}
```

**QA Test Case:**
- [ ] สร้าง Site ชื่อซ้ำ (case ต่างกัน / มี space นำ-ตาม) → ถูกปฏิเสธ `'ชื่อ Site นี้มีอยู่แล้ว'`
- [ ] แก้ไข Site ตัวเอง โดยไม่เปลี่ยนชื่อ → Save ผ่าน (ไม่ชนกับ uniqueness ตัวเอง)
- [ ] ชื่อว่าง/มีแต่ space → ถูกปฏิเสธ

---

### 3.4 `DELETE /api/sites/:id` — ลบ Site (Cascade อัตโนมัติ)

> **สำคัญ:** D1 ต้อง enable `PRAGMA foreign_keys = ON` ทุกครั้งที่เปิด connection  
> (SQLite ปิด FK enforcement โดย default — ต้องสั่งทุก connection ไม่ใช่แค่ตอนสร้าง schema)

**TypeScript:**
```typescript
export async function deleteSite(db: D1Database, siteId: string) {
  // Enable FK enforcement ก่อนทุกครั้ง (สำคัญมาก)
  await db.prepare('PRAGMA foreign_keys = ON').run();

  const result = await db
    .prepare('DELETE FROM master_site WHERE site_id = ?')
    .bind(siteId)
    .run();

  if (result.meta.changes === 0) {
    throw new Error('ไม่พบ Site ที่ต้องการลบ');
  }
  // D1 จะ CASCADE ลบ master_route ที่มี site_id ตรงกันทั้งหมดอัตโนมัติ
}
```

**QA Test Case:**
- [ ] ลบ Site ที่มี Route ผูกอยู่ 3 เส้น → Route ทั้ง 3 หายจาก `master_route` จริง (query ตรวจ)
- [ ] ลบ Site ที่ไม่มี Route ผูก → ลบสำเร็จ ไม่ error
- [ ] ลบ Site ID ที่ไม่มีอยู่จริง → return error `'ไม่พบ Site ที่ต้องการลบ'`
- [ ] Transaction เก่าที่เคยอ้างอิง Site ที่ถูกลบ ยังแสดงใน Dashboard ได้ปกติ (snapshot ไม่ใช่ live join)

---

### 3.5 `GET /api/routes` — ดึง Route ทั้งหมด (JOIN site_name)

**SQL:**
```sql
-- LEFT JOIN เพื่อป้องกัน Route กำพร้าหายไป
-- COALESCE คืน '(ไม่พบ Site)' ถ้า site ถูกลบไปแล้ว (คงพฤติกรรมเดิมจาก v2)
SELECT
  r.route_id,
  r.site_id,
  COALESCE(s.site_name, '(ไม่พบ Site)') AS site_name,
  r.route_name,
  r.origin,
  r.destination,
  r.distance_km,
  r.active
FROM master_route r
LEFT JOIN master_site s ON r.site_id = s.site_id
ORDER BY r.route_name;
```

**TypeScript:**
```typescript
export async function getAllRoutes(db: D1Database) {
  const { results } = await db.prepare(`
    SELECT r.route_id, r.site_id,
           COALESCE(s.site_name, '(ไม่พบ Site)') AS site_name,
           r.route_name, r.origin, r.destination, r.distance_km, r.active
    FROM master_route r
    LEFT JOIN master_site s ON r.site_id = s.site_id
    ORDER BY r.route_name
  `).all<RouteRow>();

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
```

**QA Test Case:**
- [ ] Route ที่ `site_id` อ้างถึง Site ที่ไม่มีอยู่ → แสดง `Site_Name: '(ไม่พบ Site)'` ไม่ crash

---

### 3.6 `POST /api/routes` (สร้างใหม่) / `PUT /api/routes/:id` (แก้ไข)

**Payload:** `{ Route_ID?, Site_ID, Route_Name, Origin, Destination, Distance_KM, Active }`

**Logic (ทำตามลำดับ — คงจาก v2):**
```typescript
export async function saveRoute(db: D1Database, payload: RoutePayload) {
  // 1. Required check (ทุก field)
  if (!payload.Site_ID) throw new Error('กรุณาเลือก Site');
  const routeName = payload.Route_Name?.trim() ?? '';
  if (!routeName) throw new Error('กรุณาระบุชื่อเส้นทาง');
  const origin = payload.Origin?.trim() ?? '';
  if (!origin) throw new Error('กรุณาระบุต้นทาง');
  const destination = payload.Destination?.trim() ?? '';
  if (!destination) throw new Error('กรุณาระบุปลายทาง');

  // 2. Distance format + validate
  const distanceKM = Math.round(parseFloat(String(payload.Distance_KM)) * 10) / 10;
  if (isNaN(distanceKM) || distanceKM <= 0) throw new Error('ระยะทางต้องมากกว่า 0');

  // 3. Uniqueness check (ภายใน Site เดียวกัน เท่านั้น — ต่าง Site ซ้ำได้)
  const duplicate = await db.prepare(`
    SELECT route_id FROM master_route
    WHERE site_id = ?
      AND LOWER(TRIM(route_name)) = LOWER(TRIM(?))
      AND route_id != ?
  `).bind(payload.Site_ID, routeName, payload.Route_ID ?? '').first();

  if (duplicate) throw new Error('ชื่อเส้นทางนี้มีอยู่แล้วใน Site นี้');

  // 4. Insert หรือ Update
  if (!payload.Route_ID) {
    const newId = crypto.randomUUID();
    await db.prepare(`
      INSERT INTO master_route (route_id, site_id, route_name, origin, destination, distance_km, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(newId, payload.Site_ID, routeName, origin, destination, distanceKM, payload.Active ? 1 : 0).run();
    return newId;
  } else {
    await db.prepare(`
      UPDATE master_route
      SET site_id = ?, route_name = ?, origin = ?, destination = ?, distance_km = ?, active = ?
      WHERE route_id = ?
    `).bind(payload.Site_ID, routeName, origin, destination, distanceKM, payload.Active ? 1 : 0, payload.Route_ID).run();
    return payload.Route_ID;
  }
}
```

**QA Test Case:**
- [ ] สร้าง Route ชื่อเดียวกันคนละ Site → Save ผ่านทั้งคู่
- [ ] สร้าง Route ชื่อซ้ำใน Site เดียวกัน → ถูกปฏิเสธ
- [ ] กรอก Distance_KM = 0 หรือค่าติดลบ → ถูกปฏิเสธ
- [ ] กรอก Distance_KM = `"15.567"` → บันทึกเป็น `15.6`

---

### 3.7 `DELETE /api/routes/:id` — ลบ Route

**SQL:**
```sql
DELETE FROM master_route WHERE route_id = ?;
```

**หมายเหตุ:** ไม่มี Cascade เพราะ `transactions` ไม่มี FK อ้างถึง `route_id` — Transaction เก็บแค่ snapshot ของ `site_name` (คงเดิมจาก v2)

**QA Test Case:**
- [ ] ลบ Route → หายจากตารางทันที ไม่กระทบ Transaction เก่า

---

### 3.8 `GET /api/transactions` — ดึง + กรอง Transaction

**Query Parameters:**
```
?startCreatedAt=2024-01-01&endCreatedAt=2024-01-31
&startReqDate=&endReqDate=
&startApprove=&endApprove=
&reqName=&plateNo=&approver=
&siteId=&status=
```
(ค่าไหนไม่ส่งมา หรือส่งมาเป็น empty string = ไม่กรอง field นั้น)

**SQL Strategy — ใช้ประโยชน์จาก Index เต็มที่:**
```typescript
export async function getTransactions(db: D1Database, filters: TransactionFilters) {
  const conditions: string[] = [];
  const bindings: (string | number)[] = [];

  // Date range — ใช้ Index ได้ (ISO string comparison = chronological)
  if (filters.startCreatedAt) {
    conditions.push("created_at >= ?");
    bindings.push(filters.startCreatedAt);
  }
  if (filters.endCreatedAt) {
    // บวก end-of-day ถ้า input เป็นแค่ YYYY-MM-DD (คง Algorithm เดิมจาก v2)
    const endVal = filters.endCreatedAt.length === 10
      ? filters.endCreatedAt + 'T23:59:59.999Z'
      : filters.endCreatedAt;
    conditions.push("created_at <= ?");
    bindings.push(endVal);
  }
  if (filters.startReqDate) {
    conditions.push("req_date >= ?");
    bindings.push(filters.startReqDate);
  }
  if (filters.endReqDate) {
    conditions.push("req_date <= ?");
    bindings.push(filters.endReqDate);
  }
  if (filters.startApprove) {
    conditions.push("approve_datetime >= ?");
    bindings.push(filters.startApprove);
  }
  if (filters.endApprove) {
    const endVal = filters.endApprove.length === 10
      ? filters.endApprove + 'T23:59:59.999Z'
      : filters.endApprove;
    conditions.push("approve_datetime <= ?");
    bindings.push(endVal);
  }

  // Exact match — ใช้ Index ได้
  if (filters.siteId) {
    conditions.push("site_id = ?");
    bindings.push(filters.siteId);
  }
  if (filters.status) {
    conditions.push("status = ?");
    bindings.push(filters.status);
  }

  // Partial text search — LIKE พร้อม LOWER (case-insensitive เหมือนเดิม)
  if (filters.reqName) {
    conditions.push("LOWER(req_name) LIKE ?");
    bindings.push(`%${filters.reqName.toLowerCase()}%`);
  }
  if (filters.plateNo) {
    conditions.push("LOWER(plate_no) LIKE ?");
    bindings.push(`%${filters.plateNo.toLowerCase()}%`);
  }
  if (filters.approver) {
    conditions.push("LOWER(approver) LIKE ?");
    bindings.push(`%${filters.approver.toLowerCase()}%`);
  }

  const whereClause = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const sql = `SELECT * FROM transactions ${whereClause} ORDER BY created_at DESC`;

  const stmt = db.prepare(sql);
  const bound = bindings.length > 0 ? stmt.bind(...bindings) : stmt;
  const { results } = await bound.all<TransactionRow>();

  return results; // แปลง field name ที่ Response handler ถ้าจำเป็น
}
```

> **หมายเหตุ Performance:** filter ใน SQL ใช้ Index ได้ทันที ต่างจาก v2 ที่อ่านทั้ง Sheet แล้ว filter ใน memory — รองรับ > 100,000 แถวได้สบาย

**QA Test Case:**
- [ ] กรอง `startCreatedAt` = `endCreatedAt` = วันเดียว → ได้ Transaction ทั้งวัน (รวม 23:59 น.) ไม่ตกหล่น
- [ ] ไม่ส่ง filter ใดๆ → คืนข้อมูลทั้งหมด เรียงตาม `created_at DESC`
- [ ] ส่ง `siteId` ที่ไม่มี Transaction → คืน array ว่าง ไม่ error
- [ ] Filter หลายตัวพร้อมกัน (Site + Status + ช่วงวันที่) → ผลลัพธ์ตรง AND ทุกเงื่อนไข

---

## 4. 💻 Frontend Logic & UI Requirements

> **หมายเหตุ:** UI/UX คงเดิมทุกอย่างจาก v2 — เปลี่ยนเฉพาะ **API Call Layer** จาก `google.script.run` เป็น `fetch()` REST API

### 4.0 Auth Guard (Passcode — คงเดิม)

```javascript
// js/main.js
async function checkAuth() {
  if (sessionStorage.getItem('admin_authed') === 'true') return;

  const { value: passcode } = await Swal.fire({
    title: 'เข้าสู่ระบบ Admin',
    input: 'password',
    inputLabel: 'รหัสผ่านแอดมิน',
    allowOutsideClick: false,
  });

  const res = await fetch('/api/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  const json = await res.json();

  if (json.status !== 'success') {
    await Swal.fire('รหัสผ่านไม่ถูกต้อง', '', 'error');
    return checkAuth(); // ถามซ้ำจนกว่าจะถูก
  }

  sessionStorage.setItem('admin_authed', 'true');
  sessionStorage.setItem('admin_token', json.token);
}
```

### 4.1 Layout & Theme (`index.html`)
Bootstrap 5, 2 คอลัมน์: Sidebar (Dashboard, Master Site, Master Routes) + Main Content  
**หมายเหตุ:** เมนู "ตั้งค่า / Clear Cache" ถูกลบออก — ไม่มีอีกต่อไป

#### 4.1.1 Router Logic (คงเดิม)
คลิกเมนู → ซ่อนทุก page → แสดงเฉพาะ page ที่เลือก

#### 4.1.2 State Management Pattern (คงเดิมจาก v2)
```javascript
// js/main.js
const AdminState = {
  sites: [], routes: [],
  sitesLoaded: false, routesLoaded: false
};

async function loadSitesIfNeeded() {
  if (AdminState.sitesLoaded) return AdminState.sites;
  const res = await ApiClient.get('/api/sites');
  // re-sort ด้วย Intl.Collator เหมือนเดิม (SQLite ORDER BY ไม่รู้จักภาษาไทย)
  const collator = new Intl.Collator('th');
  AdminState.sites = res.data.sort((a, b) => collator.compare(a.Site_Name, b.Site_Name));
  AdminState.sitesLoaded = true;
  return AdminState.sites;
}

// หลัง save/delete สำเร็จ: invalidate แล้ว re-fetch เสมอ (คงกติกาเดิม)
function invalidateSites()  { AdminState.sitesLoaded = false; }
function invalidateRoutes() { AdminState.routesLoaded = false; }
```

#### 4.1.3 ApiClient — เปลี่ยนจาก `google.script.run` เป็น `fetch`

```javascript
// js/apiClient.js
const ApiClient = {
  _token: () => sessionStorage.getItem('admin_token') ?? '',

  async get(path) {
    const res = await fetch(path, { headers: { 'X-Admin-Token': this._token() } });
    return this._handle(res);
  },
  async post(path, body) {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': this._token() },
      body: JSON.stringify(body),
    });
    return this._handle(res);
  },
  async put(path, body) {
    const res = await fetch(path, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-Admin-Token': this._token() },
      body: JSON.stringify(body),
    });
    return this._handle(res);
  },
  async del(path) {
    const res = await fetch(path, { method: 'DELETE', headers: { 'X-Admin-Token': this._token() } });
    return this._handle(res);
  },
  async _handle(res) {
    const json = await res.json();
    if (json.status !== 'success') throw new Error(json.message);
    return json;
  }
};
```

### 4.2 หน้า Master Site (คงเดิมจาก v2)
- ตาราง: คอลัมน์ Site_Name, **Active/Inactive Badge** (`<span class="badge bg-success">Active</span>` / `bg-secondary`), ปุ่มแก้ไข/ลบ
- ปุ่ม "เพิ่ม Site ใหม่" มุมขวาบน
- Modal: Input `Site_Name` (Text, required), `Active` (Switch, default = true)
- **Client-side validation:** `Site_Name.trim() !== ''` → SweetAlert2 เตือนทันที ไม่รอ Backend
- Delete: SweetAlert2 ยืนยัน "ลบ Site นี้ใช่หรือไม่? (เส้นทางทั้งหมดที่ผูกกับ Site นี้จะถูกลบไปด้วย)" → `ApiClient.del('/api/sites/' + siteId)` → `invalidateSites()` + `invalidateRoutes()` → โหลดตารางใหม่

### 4.3 หน้า Master Routes (คงเดิมจาก v2)
- ตาราง: คอลัมน์ Site_Name, Active/Inactive Badge
- Filter Dropdown บนตาราง (Client-side filter จาก `AdminState.routes` — ไม่ยิง API ซ้ำ)
- Modal: `Site_ID` (Dropdown จาก `AdminState.sites` — **แสดงเฉพาะ Site ที่ Active=true**), `Route_Name`, `Origin`, `Destination` (Text), `Distance_KM` (Number, `step="0.1"`, `min="0.01"`), `Active` (Switch)
- **Client-side validation:** ทุก field required ต้องไม่ว่าง, `Distance_KM > 0`
- Delete: SweetAlert2 ยืนยัน → `ApiClient.del('/api/routes/' + routeId)` → `invalidateRoutes()` → โหลดตารางใหม่

### 4.4 หน้า Dashboard / Reports (คงเดิมจาก v2)

- Filter Panel: `Req_Date` (date range), `Created_At` (datetime-local range — **ตัวกรองสำคัญสุด**), `Approve_Datetime` (datetime-local range), `Site_ID` (dropdown), `Status` (ALL/DRAFT/PENDING/APPROVED/REJECTED), `reqName`/`plateNo`/`approver` (text), ปุ่ม "ค้นหา"
- Table: `table-responsive`, scroll แนวนอน

**API Call สำหรับ Dashboard:**
```javascript
// js/dashboard.js
let currentFilteredData = []; // เก็บไว้ใน memory สำหรับ Export

async function dashboard_search() {
  const params = new URLSearchParams();
  const start = document.getElementById('startCreatedAt').value;
  if (start) params.set('startCreatedAt', start);
  // ... ทำซ้ำกับทุก filter field ...

  const res = await ApiClient.get('/api/transactions?' + params.toString());
  currentFilteredData = res.data;
  renderTransactionTable(currentFilteredData);
}
```

**Export Excel — Header Mapping (คงเดิม 100%):**
```javascript
const HEADER_MAP = {
  transaction_id: 'รหัสรายการ', req_date: 'วันที่เดินทาง', req_name: 'ชื่อผู้เบิก',
  plate_no: 'ทะเบียนรถ', site_name: 'สถานที่', total_km: 'ระยะทาง (กม.)',
  toll_fee: 'ค่าทางด่วน', park_fee: 'ค่าจอดรถ', flat_rate_fee: 'ค่าเหมาจ่าย',
  net_total: 'ยอดสุทธิ', approver: 'ผู้อนุมัติ', status: 'สถานะ',
  approve_datetime: 'วันเวลาที่อนุมัติ', created_at: 'วันเวลาที่บันทึก'
};

function mapForExport(dataArray) {
  return dataArray.map(row => {
    const mapped = {};
    Object.keys(HEADER_MAP).forEach(key => { mapped[HEADER_MAP[key]] = row[key]; });
    return mapped;
  });
}
// Export จาก memory ไม่ใช่จาก DOM table
const ws = XLSX.utils.json_to_sheet(mapForExport(currentFilteredData));
```

---

## 5. 📝 Naming Conventions & Code Rules

### 5.1 REST API Endpoints Summary

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth` | ตรวจ passcode, คืน token |
| GET | `/api/sites` | ดึง Site ทั้งหมด |
| POST | `/api/sites` | สร้าง Site ใหม่ |
| PUT | `/api/sites/:id` | แก้ไข Site |
| DELETE | `/api/sites/:id` | ลบ Site (Cascade อัตโนมัติ) |
| GET | `/api/routes` | ดึง Route ทั้งหมด (JOIN site_name) |
| POST | `/api/routes` | สร้าง Route ใหม่ |
| PUT | `/api/routes/:id` | แก้ไข Route |
| DELETE | `/api/routes/:id` | ลบ Route |
| GET | `/api/transactions` | ดึง Transaction พร้อม Filter |

### 5.2 TypeScript Interfaces (`src/db.ts`)

```typescript
export interface SiteRow {
  site_id: string;
  site_name: string;
  active: number; // 0 | 1
}

export interface RouteRow {
  route_id: string;
  site_id: string;
  site_name: string; // จาก COALESCE ใน JOIN
  route_name: string;
  origin: string;
  destination: string;
  distance_km: number;
  active: number;
}

export interface TransactionRow {
  transaction_id: string;
  req_line_user_id: string | null;
  req_date: string | null;
  req_name: string | null;
  plate_no: string | null;
  site_id: string | null;
  site_name: string | null;
  total_km: number | null;
  toll_fee: number | null;
  park_fee: number | null;
  flat_rate_fee: number | null;
  net_total: number | null;
  approver: string | null;
  status: string | null;
  approve_datetime: string | null;
  created_at: string;
}

export interface TransactionFilters {
  startCreatedAt?: string;
  endCreatedAt?: string;
  startReqDate?: string;
  endReqDate?: string;
  startApprove?: string;
  endApprove?: string;
  reqName?: string;
  plateNo?: string;
  approver?: string;
  siteId?: string;
  status?: string;
}
```

### 5.3 Timezone Handling
- D1 เก็บ datetime เป็น ISO 8601 string
- Date range comparison ใน SQL ทำงานถูกต้องกับ ISO string (lexicographic = chronological)
- **ห้ามเทียบ Date object ดิบข้าม timezone** — เหมือน v2
- การแสดงผลฝั่ง Client: `new Date(isoString).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })`

---

## 6. ✅ Field Validation Rules (คงเดิมจาก v2)

| Field | Required | Rule |
| :--- | :--- | :--- |
| `Site_Name` | ✅ | Trim, ไม่ว่าง, ไม่ซ้ำ case-insensitive — เช็คด้วย `LOWER(TRIM(?))` |
| `Route_Name` | ✅ | Trim, ไม่ว่าง, ไม่ซ้ำภายใน Site เดียวกัน — composite UNIQUE index |
| `Site_ID` (ของ Route) | ✅ | ต้องมีอยู่จริงใน `master_site` และ `active = 1` ตอนสร้างใหม่ |
| `Distance_KM` | ✅ | ตัวเลข, > 0, ปัดทศนิยม 1 ตำแหน่ง (`Math.round(val * 10) / 10`) |
| `Origin` / `Destination` | ✅ | ไม่ว่าง (ไม่บังคับ unique) |
| `Active` | ✅ | boolean ฝั่ง Client, แปลงเป็น `0`/`1` ก่อน INSERT/UPDATE |

---

## 7. 🧪 QA/QC Sign-off Checklist (สำหรับ Admin ตรวจรับงานรอบสุดท้าย)

- [ ] ทดสอบเรียง Site ภาษาไทย ≥ 5 ชื่อที่มีสระ/วรรณยุกต์ยาก (เช่น "ไก่", "ก่อน", "ขอนแก่น", "แกลง", "ก้าว") — ต้องเรียงถูกตามพจนานุกรมไทยจริง
- [ ] ทดสอบ Uniqueness ทั้ง Site และ Route (ชื่อซ้ำ, ชื่อซ้ำต่างตัวพิมพ์, ชื่อซ้ำมี space นำ/ตาม)
- [ ] ทดสอบ Cascade Delete: ลบ Site ที่มี Route ผูกอยู่ ≥ 2 เส้น → query `SELECT * FROM master_route WHERE site_id = '<deleted_id>'` ต้องได้ 0 แถว
- [ ] ทดสอบ Concurrent Write: เปิด 2 tab กด Save Site พร้อมกัน → ไม่มีข้อมูลเพี้ยน (D1 Atomic)
- [ ] Export Excel: หัวคอลัมน์ภาษาไทยครบ 14 คอลัมน์ ตรงกับข้อมูลที่ Filter อยู่บนจอ
- [ ] Filter `Created_At` แบบวันเดียว (start=end): รายการที่บันทึก 23:50 น. ต้องไม่ตกหล่น
- [ ] Refresh หน้า Admin (F5) → Passcode Guard ต้องขึ้นถามใหม่ (sessionStorage cleared)
- [ ] ลบ Site แล้ว Transaction เก่าที่มี `site_name` ของ Site นั้น ยังแสดงใน Dashboard ปกติ
- [ ] ตรวจ Cloudflare Dashboard > Workers > Logs ว่ามีการ log ทุก request เข้า API
- [ ] `PRAGMA foreign_keys = ON` ทำงาน: ทดสอบโดยลบ Site แล้วตรวจ `master_route` ว่า Cascade ลบจริง
- [ ] ไม่มีปุ่ม Clear Cache ในระบบอีกต่อไป (ตัดออกจาก UI แล้ว)

---

## 8. 🗝️ Data Migration (จาก Google Sheet → D1 SQLite)

> **ทำครั้งเดียวตอน Go-Live** — migrate ข้อมูลที่มีอยู่ใน Sheet เดิมไปยัง D1

### ขั้นตอน:
1. **Export ข้อมูล** จาก Sheet ทั้ง 3 ตาราง (`Master_Site`, `Master_Routes`, `Transactions`) เป็น CSV
2. **แปลงเป็น SQL INSERT** (ใช้ script หรือ tool เช่น Python + csv module)
3. **ลำดับ Insert** (สำคัญ — ต้องทำตามลำดับนี้เพราะ FK):
   ```sql
   -- ลำดับที่ 1
   INSERT INTO master_site ...
   -- ลำดับที่ 2
   INSERT INTO master_route ...
   -- ลำดับที่ 3
   INSERT INTO transactions ...
   ```
4. รัน Migration: `wrangler d1 execute trip1day --file=./migrations/0002_seed.sql`

### ข้อควรระวัง:
- `Active` ใน Sheet อาจเป็น `"TRUE"`/`"FALSE"` (text) → แปลงเป็น `1`/`0` ก่อน insert
- `Distance_KM` ผ่าน `Math.round(val * 10) / 10` ก่อน insert เพื่อให้ทศนิยม 1 ตำแหน่งเสมอ
- **UUID ต้องใช้ของเดิม** — ห้ามสร้างใหม่ เพราะ Transaction เก่าอ้างอิง `site_id` ที่มีอยู่
- ตรวจสอบ `PRAGMA foreign_keys = ON` ก่อนรัน seed ถ้าต้องการให้ D1 ตรวจ FK ระหว่าง import

---

*เอกสารนี้ล็อก Business Decision ทั้งหมดไว้แล้ว ทีม Developer สามารถเริ่ม Setup Cloudflare Worker + D1 และพัฒนาได้ทันที โดยไม่ต้องสอบถามเรื่อง Logic เพิ่มเติม — Business Logic และ UI/UX คงเดิม 100% จาก v2 เปลี่ยนเฉพาะ Stack และ Database Layer เท่านั้น*
