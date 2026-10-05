# App Instructions: trip1day_Route_v3 (AGENTS.md)

## 1. ROLE ของแอปนี้
- เป็น **Central Admin Console** บน Cloudflare Workers (`trip1day-admin`)
- หน้าที่: ให้ Admin/HR จัดการ Master Site, Master Route, Users Profile, ดูสถิติ Dashboard และส่งออกรายงาน Excel (.xlsx)

## 2. ขอบเขตงาน (Scope)
- **อนุญาต:** แก้ไขเฉพาะไฟล์ภายในโฟลเดอร์ `trip1day_Route_v3/` เท่านั้น
- **ห้าม:** แตะต้องหรือแก้ไขไฟล์ใน `trip1day_v3/` หรือ `trip1day_approve_v3/` เด็ดขาด

## 3. Stack และ Convention ที่ใช้อยู่จริง
- **Backend Runtime:** Cloudflare Workers (TypeScript 5.6.2, `@cloudflare/workers-types` ^5.20260918.1, `wrangler` ^4.135.0, `nodejs_compat`)
- **Dependencies:** `xlsx` (^0.18.5) สำหรับการประมวลผลไฟล์ Excel
- **Frontend:** Vanilla JS, HTML5, CSS3, Chart.js (CDN), FontAwesome (CDN)
- **Authentication:** ตรวจสอบ Header `X-Admin-Token` กับค่า SHA-256 Hash ของรหัสผ่าน Admin (`src/index.ts:68`)
- **API Response:** โค้ดปัจจุบันส่งคืนแบบ PascalCase/Mixed (`Site_ID`, `Transaction_ID`, `Req_Name`)

## 4. Entity ที่แอปนี้แตะได้และข้อจำกัด
- `master_site`: **Full CRUD** (ตรวจชื่อซ้ำ case-insensitive `LOWER(TRIM(site_name))`)
- `master_routes`: **Full CRUD** (ผูก FK กับ `master_site` แบบ `ON DELETE CASCADE`, ตรวจชื่อเส้นทางซ้ำต่อไซต์)
- `users_profile`: **Full CRUD** (เพิ่ม/แก้ไข/ลบ line_uid, requester_name, car_no, group_car, emp_no)
- `transactions`: **Read Only** (ห้าม INSERT/UPDATE/DELETE จากแอปนี้ ใช้เฉพาะ Query กรอง Dashboard และ Export Excel)

## 5. คำสั่ง Dev / Build / Test จริง
- **คำสั่ง Dev:** `npm run dev` (`wrangler dev`)
- **คำสั่ง Build:** `npm run build` (`tsc --noEmit`)
- **คำสั่ง Deploy:** `npm run deploy` (`wrangler deploy`) -> `https://trip1day-admin.pingly69.workers.dev`
- **คำสั่ง Test:** สคริปต์เดี่ยว `node test_export.js` และ `python verify_database.py` (ไม่มี test framework ใน npm)

## 6. Definition of Done (DoD)
ก่อนรายงานว่าแก้ไขงานในแอปนี้เสร็จสิ้น ต้องผ่านเกณฑ์ต่อไปนี้:
1. รัน `npm run build` ในโฟลเดอร์ `trip1day_Route_v3` แล้วได้ **Exit Code 0 (Zero Errors)**
2. หากมีการแก้ไข `master_site` หรือ `master_routes` ต้องแจ้งเตือนให้ Deploy `trip1day_v3` ตาม Impact Matrix
3. หากมีการแก้ไข `users_profile` ต้องแจ้งเตือนให้ Deploy ทั้ง 3 แอป

## 7. หนี้ทางเทคนิค (ยังไม่แก้)
- (ไม่มีหนี้ทางเทคนิคคงค้างในแอปนี้ - ระบบใช้มาตรฐาน snake_case ตาม D1 100%)

## 8. ข้อที่ยังไม่แน่ใจ — รอยืนยัน
- [ ] ติดตั้ง Automated Test Runner (เช่น vitest) สำหรับทดสอบการคำนวณและ Export Excel
