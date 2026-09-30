# O2 SAFE — Hospital Oxygen Leak Detection & Monitoring System
> **ระบบตรวจจับการรั่วไหลของออกซิเจนและติดตามสภาพแวดล้อมระดับโรงพยาบาล**  
> ดีไซน์ใหม่สไตล์ Premium High-Tech Medical SaaS พร้อมฐานข้อมูล SQLite และระบบยืนยันตัวตน (Auth) ในตัว

---

## 🚀 วิธีเริ่มต้นใช้งาน (Quick Start)

### 1. รันระบบพร้อมกันทั้ง Frontend & Backend ด้วยคำสั่งเดียว:
```bash
npm run dev
```
- **หน้าเว็บระบบ (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API Backend & SQLite:** [http://localhost:5000/api](http://localhost:5000/api)

---

## 🔐 บัญชีผู้ใช้งานเริ่มต้นในฐานข้อมูล (Demo Accounts)

ระบบเตรียมฐานข้อมูล SQLite (`data/o2safe.db`) พร้อม Seed บัญชีและข้อมูลประวัติการตรวจวัด 24 ชั่วโมงไว้ให้เรียบร้อยแล้ว:

| อีเมล (Email) | รหัสผ่าน (Password) | ระดับสิทธิ์ (Role) | แผนก / ตำแหน่ง |
| :--- | :--- | :--- | :--- |
| **admin@o2safe.hospital** | `admin123` | **Super Admin** | หัวหน้างานวิศวกรรมความปลอดภัย |
| **engineer@o2safe.hospital** | `eng123` | **Biomedical Engineer** | วิศวกรชีวการแพทย์ชำนาญการ |
| **nurse@o2safe.hospital** | `nurse123` | **Safety Operator** | พยาบาลหัวหน้าเวร ICU |
| **viewer@o2safe.hospital** | `view123` | **Viewer** | เจ้าหน้าที่ตรวจสอบความปลอดภัย |

*(หน้าล็อกอินมีปุ่มกดสลับบัญชีทดสอบด่วนได้ทันทีในคลิกเดียว)*

---

## 🖥️ หน้าการทำงานทั้ง 7 หน้า + หน้า Login

1. **เข้าสู่ระบบ (Sign In):** ระบบ Authentication ควบคุม Session และ Role-based access
2. **หน้าแรก (Dashboard):** 4 การ์ดสรุป KPI, 3 การ์ดเซ็นเซอร์พร้อมมาตรวัด O2 Arc Gauge และค่าอุณหภูมิ/ความชื้น, กราฟ 24 ชม. ระบุช่วงปลอดภัย (Safe Band 19.5% - 23.5%), ฟีดแจ้งเตือน และตารางเกณฑ์ความปลอดภัย
3. **ข้อมูลแบบเรียลไทม์ (Real-time Telemetry):** เลือกความเร็วสตรีมสด (1s / 2s / 5s หรือ Pause), 3 แผงเซ็นเซอร์ขนาดใหญ่พร้อมเกจ์ละเอียด, กราฟ Waveform 5 นาที, สถานะ Node ฮาร์ดแวร์ และปุ่มทดสอบจำลองเหตุการณ์รั่วไหล (Leak Test)
4. **ประวัติข้อมูลย้อนหลัง (Historical Analytics):** ตัวกรองเลือกเซ็นเซอร์/ค่า/ช่วงเรคอร์ด, แบนเนอร์ 4 ค่าสถิติ (Total, Mean, Min, Max), กราฟ Time-series ละเอียด และ**ปุ่มส่งออกเป็นไฟล์ CSV**
5. **การแจ้งเตือน (Alert Incident Log):** ตารางประวัติเหตุการณ์เตือนทั้งหมด, ตัวกรองระดับความรุนแรง, สถานะการส่งบอท Telegram / LINE OA, ปุ่มกดรับทราบ (Acknowledge) และ Modal ดูรายละเอียด
6. **รายงานสรุป (Reports):** เลือกช่วงเวลาสร้างรายงาน, Uptime 99.98%, ตารางวิเคราะห์เชิงสถิติรายเซ็นเซอร์, **ปุ่มพิมพ์/บันทึกเป็นเอกสาร PDF ในตัว (Print to PDF)** พร้อมหัวจดหมายโรงพยาบาลและช่องลงนาม
7. **ตั้งค่าระบบ (Settings):** ข้อมูลทั่วไป, ตั้งค่าเซ็นเซอร์ 3 จุดพร้อม Offset, **แถบสเปกตรัมพรีวิวเกณฑ์ O2 แบบเรียลไทม์**, การตั้งค่า Telegram Bot และ LINE OA พร้อมปุ่มทดสอบส่งข้อความจริง
8. **จัดการผู้ใช้ (User Management):** สถิติผู้ใช้งาน, Modal เพิ่มผู้ใช้ใหม่พร้อมตัวสุ่มรหัสผ่าน, ปุ่มเปิด/ระงับการใช้งาน, ปุ่มรีเซ็ตรหัสผ่าน และการลบผู้ใช้

---

## 📡 การรับส่งข้อมูลกับ Raspberry Pi (IoT Ingestion API)

อุปกรณ์ Raspberry Pi สามารถส่งข้อมูลเซ็นเซอร์ O2, อุณหภูมิ, ความชื้น เข้ามายังระบบได้โดยตรงผ่าน HTTP POST:

- **Endpoint:** `POST http://<SERVER_IP>:5000/api/telemetry/ingest`
- **Headers:** `Content-Type: application/json`
- **Body ตัวอย่าง:**
```json
{
  "sensor_code": "sensor_01",
  "o2_level": 20.95,
  "temperature": 22.4,
  "humidity": 55.2
}
```
*ระบบจะเปรียบเทียบกับเกณฑ์ความปลอดภัยอัตโนมัติ หากพบค่าวิกฤตจะบันทึกลง Incident Log และส่งสัญญาณแจ้งเตือนเข้า Telegram/LINE ทันที*

---

## 📁 โครงสร้างโปรเจกต์ (File Structure)

```text
webproject_iot/
├── data/
│   └── o2safe.db              # ฐานข้อมูล SQLite แบบฝังในระบบ (Persistent)
├── server/
│   ├── db.js                  # ตาราง Users, Sensors, Readings, Alerts, Settings
│   └── server.js              # REST API Backend (Express + SQLite)
├── src/
│   ├── components/            # Navbar, Sidebar, O2Gauge, KPICard
│   ├── context/               # AuthContext, ThemeContext
│   ├── pages/                 # ครบทั้ง 7 หน้า + หน้า Login
│   ├── services/              # API Client fetch
│   ├── types/                 # โครงสร้าง TypeScript
│   ├── App.tsx                # Routing & Shell
│   ├── index.css              # Tailwind + Animations
│   └── main.tsx
├── package.json
└── tailwind.config.js
```
