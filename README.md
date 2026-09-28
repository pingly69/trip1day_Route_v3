# 🚗 Trip1Day Route & Admin Management System (v3.0)

> **Admin Web Application for Mileage Reimbursement Master Data & Route Management**  
> Built on **Cloudflare Workers + D1 Database (SQLite) + Vanilla Web Components**

[![GitHub Repository](https://img.shields.io/badge/GitHub-pingly69%2Ftrip1day__Route__v3-blue?logo=github)](https://github.com/pingly69/trip1day_Route_v3)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://trip1day-admin.pingly69.workers.dev)
[![D1 Database](https://img.shields.io/badge/Cloudflare-D1-yellow?logo=sqlite)](https://developers.cloudflare.com/d1/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?logo=typescript)](https://www.typescriptlang.org/)

---

## 🌐 Production URLs & Deployment
* **Admin Web App:** [https://trip1day-admin.pingly69.workers.dev](https://trip1day-admin.pingly69.workers.dev)
* **GitHub Repository:** [https://github.com/pingly69/trip1day_Route_v3](https://github.com/pingly69/trip1day_Route_v3)
* **Cloudflare D1 Database:** `IMG_DB` (`4db03e65-cc9d-458e-81f7-b8119669dd17` in region APAC)
* **Wrangler Binding:** `IMG_DB` (รองรับ `DB` ด้วย)

---

## 🌟 ฟังก์ชันหลักของระบบ (Key Features)

1. **Dashboard & Analytics:** สรุปยอดเบิกจ่ายค่าเดินทาง สถิติระยะทาง ยอดรวมเงิน และสถานะรายการ (Pending, Approved, Rejected)
2. **Master Route Management:** จัดการข้อมูลเส้นทางมาตรฐาน (ต้นทาง-ปลายทาง, ระยะทาง กม., สถานะเปิด/ปิดการใช้งาน)
3. **Master Site Management:** จัดการสถานที่/หน่วยงาน/สาขาที่พนักงานเดินทางไปปฏิบัติงาน
4. **Users Profile Management:** ตรวจสอบและบริหารจัดการโปรไฟล์ผู้ใช้งาน และการผูกบัญชี LINE User ID
5. **Transactions History & Excel Export:** ค้นหา กรองประวัติการเดินทาง และส่งออกรายงานเป็นไฟล์ Excel (.xlsx)

---

## 📚 สารบัญเอกสารสำคัญในโปรเจกต์

1. **[D1_DATABASE_INTEGRATION_SPEC.md](./D1_DATABASE_INTEGRATION_SPEC.md)** ⭐ *(สำคัญสำหรับการเชื่อมต่อระหว่างระบบ)*
   * ข้อกำหนดการเชื่อมต่อฐานข้อมูล D1 กลาง
   * SQL Queries สำหรับ **ระบบขอเบิกค่าเดินทาง (Requester / LIFF)**
   * SQL Queries สำหรับ **ระบบอนุมัติค่าเดินทาง (Approver)**
   * กฎเหล็ก Data Formats, Unique Constraints, Date Time Normalization

2. **[skills/Spec_AdminWebApp_v3_Cloudflare.md](./skills/Spec_AdminWebApp_v3_Cloudflare.md)**
   * สเปกระบบ Admin Web Application ฉบับเต็ม (Business Logic, UI/UX, Security)

3. **[skills/d1_migration/README.md](./skills/d1_migration/README.md)**
   * รายงานการตรวจและ Clean ข้อมูลย้อนหลัง 255 รายการ
   * ไฟล์ Script Migration DDL & Seed Data

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
trip1day_Route_v3/
├── public/                           # Frontend Static Assets (HTML5, Vanilla JS, CSS)
│   ├── css/                          # สไตล์ชีทและการจัด Layout
│   ├── js/
│   │   ├── apiClient.js              # REST API Client & Request Wrapper
│   │   ├── dashboard.js              # Dashboard Charts & Summary Metrics
│   │   ├── main.js                   # Main Navigation & App Bootstrapper
│   │   ├── masterRoute.js            # จัดการ Master Route CRUD
│   │   ├── masterSite.js             # จัดการ Master Site CRUD
│   │   └── usersProfile.js           # จัดการ Users Profile
│   └── index.html                    # Admin Web Application Single Page
├── skills/                           # ข้อกำหนดระบบและฐานข้อมูล
│   ├── Spec_AdminWebApp_v3_Cloudflare.md
│   └── d1_migration/                 # SQL Migration & Database Seeds
│       ├── 01_schema.sql
│       ├── 02_seed_master.sql
│       ├── 03_import_transactions.sql
│       ├── full_migration.sql
│       └── README.md
├── src/                              # Backend Cloudflare Workers (TypeScript)
│   ├── services/
│   │   ├── routeService.ts           # Route Business Logic
│   │   ├── siteService.ts            # Site Business Logic
│   │   ├── transactionService.ts     # Transactions Query & Export Logic
│   │   └── userService.ts            # User Management Logic
│   ├── config.ts                     # Runtime Environment Configuration
│   ├── db.ts                         # Cloudflare D1 Helper & Wrapper
│   └── index.ts                      # Cloudflare Workers Router & Endpoints
├── OLD_UI/                           # Legacy UI Reference Files
├── D1_DATABASE_INTEGRATION_SPEC.md   # D1 Central Integration Specification
├── wrangler.toml                     # Cloudflare Workers & D1 Configuration
├── tsconfig.json                     # TypeScript Configuration
├── package.json                      # Project Dependencies & Scripts
└── README.md
```

---

## 🛠️ คำสั่งพัฒนาและทดสอบ (Commands)

```bash
# 1. ติดตั้ง Dependencies
npm install

# 2. รัน Local Development Server (พอร์ต 8787)
npm run dev

# 3. ตรวจสอบ TypeScript Build
npm run build

# 4. Deploy ขึ้น Cloudflare Workers Production
npm run deploy

# 5. ทดสอบหรือ Reset ฐานข้อมูล D1
npm run d1:local:init    # Local D1
npm run d1:remote:init   # Cloudflare Remote D1
```

---

## 🔒 Environment & Variables

กำหนดผ่าน `wrangler.toml` หรือ Cloudflare Dashboard / Wrangler Secret:

| Variable | Description | Default |
|---|---|---|
| `TIMEZONE` | เขตเวลาของระบบ | `Asia/Bangkok` |
| `ADMIN_PASSWORD` | รหัสผ่านผู้ดูแลระบบ (Admin Passcode) | ตั้งค่าผ่าน Wrangler Secret |
| `IMG_DB` | D1 Database Binding Name | `4db03e65-cc9d-458e-81f7-b8119669dd17` |
