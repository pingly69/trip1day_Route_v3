# คู่มือและรายงานการเตรียมข้อมูล Import สู่ Cloudflare D1 (SQLite)
**โครงการ:** ระบบบันทึกเบิกค่าเดินทาง (Mileage Reimbursement System)  
**บทบาท:** Senior Database Administrator (DBA)  
**วันที่ตรวจสอบ:** 19 กันยายน 2026  
**แหล่งข้อมูลต้นฉบับ:** `trip1day_data_old.xlsx` (Google Sheets Export)

---

## 1. ผลการตรวจความถูกต้องของ Spec กับข้อมูลจริง (DBA Audit Findings)


### 1.1 ตาราง `users_profile`
* **ข้อมูลเดิมใน Sheet:** มี 46 แถว คอลัมน์ประกอบด้วย `Line_uid`, `requester_name`, `car_no`, `group_car`, และ **`emp_no`** (เช่น `M00050`, `D0154`, `D0032`)
* **ปัญหาใน Spec เดิม:** ใน Spec v1 ไม่ได้ระบุคอลัมน์ `emp_no` ไว้ หากตัดทิ้ง ข้อมูลรหัสพนักงานจะสูญหาย และหากฝ่ายบุคคล (HR) ต้องการใช้งานในอนาคตจะต้องสั่ง `ALTER TABLE` ซึ่งยุ่งยากบน Production
* **การแก้ไขโดย DBA:** เพิ่ม `emp_no TEXT NOT NULL DEFAULT ''` ลงใน `users_profile` ทั้งใน Spec และ DDL เรียบร้อยแล้ว
* **Foreign Key Check:** ใน `Transactions` มี 1 ผู้ใช้งานที่ไม่มีใน `users_profile` คือ `IMG_HR & Safety` (`U0b548b2aad82fdd5ba268f43f24c3294`) ซึ่งเป็น User บัญชีทดสอบของระบบ DBA ได้ทำการเพิ่มเข้าไปใน Seed Data ให้เรียบร้อย รวมเป็น **47 รายการ**

### 1.2 แผ่นงาน `Master_Site` vs `สำเนาของ Master_Site`
* **ข้อมูลใน Sheet:** มี 2 แผ่นงาน คือ `Master_Site` (36 รายการ) และ `สำเนาของ Master_Site` (42 รายการ)
* **การวิเคราะห์ของ DBA:** 
  * แผ่นงาน `Master_Site` (36 รายการ) คือ **Master Data ตัวจริงที่เป็นปัจจุบัน** มีไซต์งานใหม่ที่ใช้อยู่จริง (เช่น Lemon Green Mart, กาฬสินธุ์ Yadea, ตลาดนิคมพัฒนา FC)
  * ไซต์งานทั้งหมดใน `Master_Routes` และ `Transactions` (ทั้ง 256 รายการ) **ตรงกับ `Master_Site` 100% ไม่มี Foreign Key หลุดเลยแม้แต่รายการเดียว**
  * แผ่นงาน `สำเนาของ Master_Site` เป็นเพียงไฟล์สำเนาเก่าที่มีไซต์ปิดไปแล้ว (`Active=False`) จึงให้ใช้ `Master_Site` เป็น Single Source of Truth

### 1.3 ตาราง `master_routes`
* **ข้อมูลเดิมใน Sheet:** มี 21 รายการ
* **การวิเคราะห์:** ทุกเส้นทางมี `site_id` ที่มีอยู่จริงใน `master_site` (Foreign Key Integrity 100%) และทุกเส้นทางประเภท `FIX` ที่ถูกอ้างอิงใน `Transactions.trip_details` มีอยู่จริงในตารางนี้ครบถ้วน

### 1.4 การจัดการรายการซ้ำ (Duplicate Bug) และ Unique Index ของ `Transactions`
* **กฎของระบบ:** 1 คน + 1 วัน + 1 Site = 1 Record เท่านั้น:
  ```sql
  CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_date_user_site
    ON transactions (req_date, req_line_user_id, site_id);
  ```
* **สิ่งที่พบในข้อมูลเก่า:** ในประวัติการบันทึกเดิม พบ **1 กรณีที่มีการเบิกซ้ำเนื่องจากระบบเก่า (Google Sheet) ไม่มีระบบตรวจสอบและเกิด Bug ส่งเบิกซ้ำ**:
  * **วันที่:** `2026-09-12`
  * **ผู้เบิก:** `อภิรัตน์ ชมสาร` (`Ue9670f93e876ed2b4cd219e11e4dc06a`)
  * **Site:** `A12602026` (ตลาดนิคมพัฒนา FC)
* **การดำเนินการตามคำสั่ง:** 
  * ได้ทำการ**ตัดทิ้งรายการที่ส่งซ้ำออก 1 รายการ** คือ `TX-e9bc408e-4369-466b-b85e-9ab6ed6439e8` (Row 103 ใน Sheet ซึ่งส่งซ้ำเมื่อ 21:19 น.) และคงรายการหลัก `TX-bfa84366-bf40-4696-9179-2d39c2818531` ไว้
  * ยอด Transactions ทั้งหมดที่นำเข้าจึงเป็น **255 รายการ**
  * โครงสร้าง Index ใช้แบบ **Pure UNIQUE Index** แบบไม่มีเงื่อนไข (`CREATE UNIQUE INDEX idx_transactions_date_user_site ON transactions (req_date, req_line_user_id, site_id)`) เพื่อรับประกัน Data Integrity 100% สำหรับทุกช่วงเวลา

### 1.5 การแปลง Type ข้อมูล (Data Cleansing & Type Casting)
1. **`Plate_No`:** ใน Excel บางแถวที่เป็นตัวเลขล้วน (เช่น `1234.0`) ถูกแปลงเป็น String `'1234'` ไม่ให้มีจุดทศนิยม
2. **`Req_Date`:** แปลงจาก `datetime` (`2026-08-13 00:00:00`) ให้เป็น ISO Date Format `'YYYY-MM-DD'` ตามข้อกำหนด SQLite
3. **`Approve_Datetime`:** แถวที่มีสถานะ `PENDING` มีค่าเป็น `NULL`, แถวที่อนุมัติแล้วแปลงเป็น `'YYYY-MM-DD HH:MM:SS'`
4. **`Image_URL`:** ข้อมูลเดิมว่าง (NULL) แปลงเป็น Empty String `''` เพื่อรองรับ `NOT NULL DEFAULT ''`
5. **`Active` (Boolean):** แปลงจาก `True`/`False` เป็น `1`/`0` (SQLite Integer)
6. **`Trip_Details` JSON:** ในบาง Record เดิม ค่าระยะทาง `km` ของ Custom Trip ถูกเก็บเป็นข้อความ (เช่น `"km": "30"`) ทาง DBA ได้ Clean ข้อมูลให้เป็นตัวเลข (`"km": 30`) ทั้งหมด เพื่อป้องกันปัญหา Type Mismatch ตอนประมวลผลคำนวณเงินใน Cloudflare Workers

---

## 2. ไฟล์ SQL ที่เตรียมไว้สำหรับทีมงาน

ไฟล์ทั้งหมดถูกสร้างและเก็บไว้ในโฟลเดอร์:  
`c:\Antigravity_Data\trip1day\skills\d1_migration\`

| ชื่อไฟล์ | จำนวนแถว | วัตถุประสงค์ |
|---|---|---|
| `01_schema.sql` | - | โครงสร้างตาราง (DDL) ครบทั้ง 7 ตาราง พร้อม Index ทั้งหมด (Pure UNIQUE Index + คอลัมน์ `emp_no`) |
| `02_seed_master.sql` | 115 แถว | ข้อมูล Master ทั้งหมด (`master_config`, `rate_car`, `master_site`, `master_routes`, `approve_users`, `users_profile`) |
| `03_import_transactions.sql` | 255 แถว | ข้อมูล Transactions ทั้งหมดที่ Clean, Format Type และตัดแถว Bug ซ้ำออกแล้ว |
| `full_migration.sql` | รวมทุกอย่าง | ไฟล์ All-in-One สำหรับรันจบในคำสั่งเดียว สะดวกสำหรับ Local Dev หรือ Production Initial Setup |

---

## 3. ขั้นตอนการ Import ข้อมูลเข้า Cloudflare D1

### 3.1 สำหรับ Local Development (ทดสอบในเครื่อง)
```bash
# รันไฟล์ทั้งหมดเข้า Local D1
npx wrangler d1 execute Trip1Day-db --local --file=skills/d1_migration/full_migration.sql
```

หรือรันแยกทีละขั้นตอน:
```bash
# 1. รัน Schema
npx wrangler d1 execute Trip1Day-db --local --file=skills/d1_migration/01_schema.sql

# 2. นำเข้า Master Data
npx wrangler d1 execute Trip1Day-db --local --file=skills/d1_migration/02_seed_master.sql

# 3. นำเข้า Transaction Data
npx wrangler d1 execute Trip1Day-db --local --file=skills/d1_migration/03_import_transactions.sql
```

### 3.2 สำหรับ Production (Cloudflare Remote D1)
```bash
# รันเข้าฐานข้อมูลจริงบน Cloudflare D1
npx wrangler d1 execute Trip1Day-db --remote --file=skills/d1_migration/full_migration.sql
```

---

## 4. ผลการทดสอบความถูกต้องอัตโนมัติ (Automated Test Suite: 29/29 ผ่าน 100%)
ได้ทำการสร้างสคริปต์ทดสอบอัตโนมัติ `verify_database.py` รันบน SQLite Engine โดยเปิด `PRAGMA foreign_keys = ON;` ผลการทดสอบปรากฏดังนี้:
* `users_profile`: นำเข้าสำเร็จ **47 แถว** (มี `emp_no` ครบทุกแถว)
* `master_site`: นำเข้าสำเร็จ **36 แถว** (รหัส Site เป็น ERP Code โดยผู้ใช้ตาม `OLD_UI`)
* `master_routes`: นำเข้าสำเร็จ **21 แถว** (ผูก Cascade Delete กับ `master_site`)
* `master_config`: นำเข้าสำเร็จ **3 แถว**
* `rate_car`: นำเข้าสำเร็จ **3 แถว**
* `approve_users`: นำเข้าสำเร็จ **5 แถว**
* `transactions`: นำเข้าสำเร็จ **255 แถว** (ลบรายการซ้ำ 1 แถวเรียบร้อย)
* **Foreign Key Violations:** `0` (ผ่าน 100%)
* **Cascade Delete Test:** ลบ Site ใน Master แล้ว Route ถูก Cascade ลบตามจริง 100%
* **Historical Snapshot Safety:** ลบ Site ใน Master แล้ว Transaction ในอดีตคงอยู่ ไม่ Error และไม่สูญหาย
* **Uniqueness Constraints:** บล็อก Site ซ้ำ (Trim/Case-insensitive), บล็อก Route ซ้ำใน Site เดียวกัน, และบล็อกการเบิกซ้ำ 1 วัน 1 คน 1 ไซต์ 100%
* **Data Formatting:** ISO Date `YYYY-MM-DD` และ `trip_details` JSON Array ถูกต้องสมบูรณ์ 100%
