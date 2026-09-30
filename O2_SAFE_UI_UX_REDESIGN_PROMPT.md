# O2 SAFE — Master Prompt & UI/UX Redesign Specification
> **โครงการ:** ระบบตรวจจับการรั่วไหลของออกซิเจนและติดตามสภาวะแวดล้อมระดับโรงพยาบาล  
> **(Hospital Oxygen Leak Detection & Environmental Monitoring System)**  
> **อุปกรณ์ฮาร์ดแวร์:** Raspberry Pi Sensor Hub (O2, อุณหภูมิ, ความชื้น)  
> **ช่องทางแจ้งเตือน:** Telegram Bot & LINE Official Account (LINE OA)  
> **ตำแหน่งไฟล์:** `C:\Users\filmz\OneDrive\Desktop\webproject_iot\O2_SAFE_UI_UX_REDESIGN_PROMPT.md`

---

## สารบัญ (Table of Contents)
1. [ภาพรวมการออกแบบใหม่ (Design Vision & Strategy)](#1-ภาพรวมการออกแบบใหม่-design-vision--strategy)
2. [ระบบดีไซน์และโทนสีใหม่ (Design System & Color Tokens)](#2-ระบบดีไซน์และโทนสีใหม่-design-system--color-tokens)
3. [โครงสร้างเลย์เอาต์หลัก (Global Layout & Navigation)](#3-โครงสร้างเลย์เอาต์หลัก-global-layout--navigation)
4. [รายละเอียดการออกแบบรายหน้า ทั้ง 7 หน้า (Detailed Page Specs)](#4-รายละเอียดการออกแบบรายหน้า-ทั้ง-7-หน้า)
   - [หน้า 1: แดชบอร์ดภาพรวม (Dashboard Overview)](#หน้า-1-แดชบอร์ดภาพรวม-dashboard-overview)
   - [หน้า 2: ข้อมูลแบบเรียลไทม์ (Real-time Telemetry)](#หน้า-2-ข้อมูลแบบเรียลไทม์-real-time-telemetry)
   - [หน้า 3: ประวัติข้อมูลย้อนหลัง (Historical Data & Analytics)](#หน้า-3-ประวัติข้อมูลย้อนหลัง-historical-data--analytics)
   - [หน้า 4: บันทึกประวัติการแจ้งเตือน (Alert Incident Log)](#หน้า-4-บันทึกประวัติการแจ้งเตือน-alert-incident-log)
   - [หน้า 5: รายงานและสรุปผล (Compliance & Executive Reports)](#หน้า-5-รายงานและสรุปผล-compliance--executive-reports)
   - [หน้า 6: ตั้งค่าระบบและการเชื่อมต่อ (System Configuration & Integrations)](#หน้า-6-ตั้งค่าระบบและการเชื่อมต่อ-system-configuration--integrations)
   - [หน้า 7: จัดการผู้ใช้งานและสิทธิ์ (User Management & Access Control)](#หน้า-7-จัดการผู้ใช้งานและสิทธิ์-user-management--access-control)
5. [Master Prompt สำหรับส่งให้ AI หรือ Frontend Developer (Copy & Paste Ready)](#5-master-prompt-สำหรับส่งให้-ai-หรือ-frontend-developer)

---

## 1. ภาพรวมการออกแบบใหม่ (Design Vision & Strategy)

### 1.1 ปัญหาของดีไซน์เดิม
- ใช้โทนสีน้ำเงิน-เขียวแบบ Corporate ดั้งเดิม ดูเรียบแบน ขาดมิติทางสายตา และไม่สามารถแยกแยะระดับความเร่งด่วนของข้อมูลทางการแพทย์ได้ชัดเจน
- การจัดวางการ์ดและการแสดงผลแบบทั่วไป ขาดความรู้สึกของเครื่องมือ Monitoring ความแม่นยำสูงระดับ Mission-Critical

### 1.2 ทิศทางใหม่ (Modern Industrial & Clinical SaaS Dashboard)
- **สไตล์:** Clean, Minimalist, High-Tech Medical Grade SaaS (คล้าย Datadog, Vercel, Linear, Grafana Cloud)
- **บุคลิก:** น่าเชื่อถือ ปลอดภัย แม่นยำ ทันสมัย และลด Cognitive Load (ภาระการมองเห็น) ของเจ้าหน้าที่โรงพยาบาล/วิศวกรชีวการแพทย์
- **ความเด่นชัดของค่าฉุกเฉิน (Alert Dominance):** สภาวะปกติจะดูสงบ สะอาดตา (Subtle & Calibrated) แต่เมื่อเกิดการรั่วไหลของออกซิเจน (O2 Leak) ระบบจะสะกดสายตาทันทีด้วย Warning/Danger Visual Contrast แบบชัดเจน 100%
- **รองรับโหมดการทำงาน:** ออกแบบรองรับทั้ง **Modern Dark Mode** (สำหรับห้องควบคุม Control Room จอใหญ่) และ **Crisp Light Mode** (สำหรับเคาน์เตอร์พยาบาลและสำนักงาน)

---

## 2. ระบบดีไซน์และโทนสีใหม่ (Design System & Color Tokens)

### 2.1 โทนสีใหม่ (Color Palette)
หลีกเลี่ยงโทนน้ำเงิน-เขียวหม่นแบบเดิม เปลี่ยนมาใช้คู่สี Slate/Zinc ร่วมกับ Electric Ice Cyan และ Semantics Alerting:

| Token Name | Hex Code | ความหมายและการใช้งาน |
| :--- | :--- | :--- |
| **Surface Base (Dark)** | `#0A0D14` / `#0F172A` | พื้นหลังหลัก ลุ่มลึก ลดแสงสะท้อน สำหรับ Control Room |
| **Surface Base (Light)** | `#F8FAFC` / `#FFFFFF` | พื้นหลังโหมดสว่าง สะอาดตา คมชัด มาตรฐานโรงพยาบาล |
| **Surface Card** | `#161D2B` (Dark) / `#FFFFFF` (Light) | พื้นหลังการ์ด พร้อมเส้นขอบคมชัด `border-slate-800` หรือ `border-slate-200` |
| **Primary Brand (Ice Cyan)** | `#06B6D4` / `#0284C7` | สื่อถึงความบริสุทธิ์ของก๊าซออกซิเจน เทคโนโลยีทันสมัย สดชื่น |
| **Safe / Normal (Emerald)** | `#10B981` | ค่าปกติ (O2 20.0% – 22.0%), เซ็นเซอร์ออนไลน์ |
| **Elevated / Notice (Sky)** | `#38BDF8` | เริ่มมีความเปลี่ยนแปลงแต่ยังไม่ถึงขั้นเตือน |
| **Warning (Amber Gold)** | `#F59E0B` | ค่าเริ่มผิดปกติ/เตือน (O2 < 19.5% หรือ > 23.0%) |
| **Critical Danger (Crimson)** | `#EF4444` / `#DC2626` | อันตรายวิกฤต (ออกซิเจนรั่ว O2 > 23.5% เสี่ยงเพลิงไหม้ หรือ < 18% ขาดอากาศ) |
| **Offline / Neutral Gray** | `#64748B` | เซ็นเซอร์ขาดการเชื่อมต่อ หรือข้อมูลที่ไม่ได้โฟกัส |

### 2.2 ตัวพิมพ์ (Typography)
- **ข้อความภาษาไทย/อังกฤษทั่วไป:** Inter หรือ Plus Jakarta Sans ผสมผสานคู่กับ Prompt หรือ Kanit (Clean, Legible at a glance)
- **ตัวเลขแสดงค่าเซ็นเซอร์ (Data & Metrics):** JetBrains Mono หรือ Roboto Mono เพื่อให้ตัวเลขแบบ Monospace จัดหลักทศนิยมได้ตรงกัน ไม่กระตุกเวลา Real-time Update

### 2.3 องค์ประกอบ UI (Components & Visual Treats)
- **Borders & Shadows:** เส้นขอบขนาด 1px โทนสีสุภาพ (`border-slate-200/80` หรือ `border-slate-800/80`) พร้อม Drop Shadow แบบละมุน ไม่หนาเทอะทะ
- **Glow Accents:** ใช้เอฟเฟกต์ไฟสะท้อนเบาๆ (Subtle Radial Glow) ด้านหลังค่าเกจ์หรือตัวเลขวิกฤต
- **Pulsing Live Beacons:** จุดกลมกระพริบสีเขียวหรือแดง เพื่อบอกสถานะการเชื่อมต่อสดของ Raspberry Pi

---

## 3. โครงสร้างเลย์เอาต์หลัก (Global Layout & Navigation)

```
+-----------------------------------------------------------------------------------------------+
| [Logo: O2 SAFE]  |  Hospital: โรงพยาบาลศูนย์การแพทย์  |  Raspberry Pi Status: 🟢 Connected  |  User Profile |
+-----------------------------------------------------------------------------------------------+
| [Sidebar]       | [Main Content Area]                                                         |
| - หน้าแรก       |                                                                             |
| - ข้อมูลสด       |                                                                             |
| - ประวัติข้อมูล   |                                                                             |
| - การแจ้งเตือน  |                                                                             |
| - รายงาน        |                                                                             |
| - ตั้งค่าระบบ    |                                                                             |
| - จัดการผู้ใช้  |                                                                             |
+-----------------------------------------------------------------------------------------------+
```

- **Top Navigation Bar:**
  - แสดงชื่อระบบ **O2 SAFE** พร้อมไอคอนรูปโมเลกุลออกซิเจนคู่กับเกราะความปลอดภัย
  - ป้ายชื่อโรงพยาบาลและอาคารที่ติดตั้ง
  - **Live Heartbeat Pill:** แสดงสถานะการเชื่อมต่อกับ Raspberry Pi (เช่น `🟢 Raspberry Pi: Active (Ping 24ms)`)
  - **Notification Channels Status:** ไอคอน Telegram (`🟢 Active`) และ LINE OA (`🟢 Active`)
  - นาฬิกาดิจิทัลเวลาจริงระดับวินาที (Sync ตามเซิร์ฟเวอร์โรงพยาบาล)
  - โปรไฟล์ผู้ใช้งานพร้อมปุ่มสลับ Dark/Light Theme
- **Left Sidebar Navigation:**
  - สไตล์ Glass/Elevated แถบเมนูกว้างพอดีตา ไอคอนสไตล์ Lucide Icons
  - มี Badge นับจำนวนแจ้งเตือนที่ยังไม่ได้อ่านกำกับไว้ที่เมนู "การแจ้งเตือน"
  - ด้านล่างสุดมีปุ่ม Quick Switch หรือออกจากระบบ

---

## 4. รายละเอียดการออกแบบรายหน้า ทั้ง 7 หน้า

---

### หน้า 1: แดชบอร์ดภาพรวม (Dashboard Overview)
*จุดประสงค์: ดูสถานะทั้งโรงพยาบาลได้ครบจบในหน้าเดียวภายใน 5 วินาที*

#### 1. การ์ดสรุปสถานะระบบ 4 ใบ (Top KPI Summary Cards):
1. **สถานะระบบรวม (System Health):**
   - แสดงไอคอนโล่ความปลอดภัย สีเขียวมรกต "NORMAL - สภาวะปกติ" หรือสีแดงกระพริบ "CRITICAL LEAK DETECTED"
   - Subtext: ระบบตรวจวัดอัตโนมัติทำงาน 100% ไม่มีข้อผิดพลาด
2. **จำนวนเซ็นเซอร์ (Sensor Fleet):**
   - ตัวเลขขนาดใหญ่ เช่น `3 / 3 ออนไลน์`
   - แถบสถานะความพร้อมของบอร์ด Raspberry Pi ทั้ง 3 โซน
3. **การแจ้งเตือนวันนี้ (Today's Incidents):**
   - ตัวเลขแสดงจำนวนครั้งที่ส่งแจ้งเตือนออกไปใน 24 ชม. ล่าสุด (เช่น `0 ครั้ง` หรือ `2 ครั้ง - รับทราบแล้ว`)
   - มี Tag แยกย่อย: Danger: 0 | Warning: 2
4. **สภาพแวดล้อมโดยรวม (Environmental Summary):**
   - ค่าเฉลี่ยอุณหภูมิห้อง (`22.8 °C`) และความชื้นสัมพัทธ์เฉลี่ย (`54.2 %RH`)
   - สัญลักษณ์ระบุว่าอยู่ในเกณฑ์มาตรฐานห้องการแพทย์

#### 2. การ์ดเซ็นเซอร์ 3 จุดตรวจวัด (Sensor Station Cards):
- ออกแบบการ์ดขนาดใหญ่ 3 ใบ เรียง 3 คอลัมน์ (เช่น โซนคลังออกซิเจนเหลว, ห้องผ่าตัด ICU, ตึกผู้ป่วยใน ชั้น 3)
- **ภายในแต่ละการ์ดประกอบด้วย:**
  - **Radial Gauge วัดค่า O2 (%):**
    - เส้นมาตรวัดโค้งมน มี Scale แสดงขีดปลอดภัย (19.5% - 23.5%) และขีดมาตรฐาน (20.9%)
    - ตัวเลขแสดงผลขนาดใหญ่พิเศษ (เช่น `20.95 %`) ฟอนต์แบบ Monospace
  - **Status Badge:** `🟢 ปรกติ` / `🟡 เฝ้าระวัง` / `🔴 รั่วไหล`
  - **Mini Metrics แนวนอน:** ค่าอุณหภูมิ (°C) และความชื้น (%RH) ของจุดนั้นๆ
  - **Last Updated:** แสดงเวลาที่อัปเดตล่าสุด เช่น `เมื่อ 2 วินาทีที่แล้ว (Raspberry Pi Node 01)`

#### 3. กราฟแนวโน้ม O2 ย้อนหลัง 24 ชั่วโมง (24-Hour O2 Trend Graph):
- กราฟเส้นแบบ Multi-series แสดงทั้ง 3 เซ็นเซอร์พร้อมกัน ใช้สีเส้นชัดเจน แยกแยะง่าย
- มี **Shaded Safety Band** (แถบสีเขียวโปร่งแสงแสดงช่วงปลอดภัย 19.5% – 23.5%)
- มีเส้นประอ้างอิงระดับออกซิเจนในอากาศปกติ (Ambient Baseline 20.9%)
- ตัวกรองย่อย: เปิด/ปิดการแสดงผลรายเซ็นเซอร์ได้เพียงคลิกที่ Legend

#### 4. รายการแจ้งเตือนล่าสุด (Recent Alerts Feed) & ตารางเกณฑ์แจ้งเตือน (Threshold Reference):
- **ฝั่งซ้าย (Recent Alerts Feed):** รายการ 5 เหตุการณ์ล่าสุด แสดง Icon ตามระดับความรุนแรง, ชื่อโซน, ค่าที่ตรวจวัดได้, เวลาที่ตรวจพบ และปุ่ม "รับทราบ (Acknowledge)"
- **ฝั่งขวา (Threshold Quick Reference):** ตารางสรุปเกณฑ์มาตรฐานที่ระบบตั้งไว้ (O2 ปกติ/เตือน/อันตราย, อุณหภูมิ, ความชื้น) เพื่อให้ผู้ดูแดชบอร์ดตรวจสอบได้ทันที

---

### หน้า 2: ข้อมูลแบบเรียลไทม์ (Real-time Telemetry)
*จุดประสงค์: มอนิเตอร์สดแบบ Real-time Streaming สำหรับหน้างานและห้องวิศวกรรม*

#### องค์ประกอบและการจัดวาง:
1. **Control Header Bar:**
   - ปุ่มสลับความถี่การดึงข้อมูลสด (Stream 1s / 3s / 5s หรือ Pause เพื่อหยุดดูค่าชั่วคราว)
   - ป้ายแสดงสถานะ Socket/MQTT/HTTP Polling จาก Raspberry Pi
   - ปุ่ม "Ping All Nodes" เพื่อทดสอบการตอบสนองของฮาร์ดแวร์
2. **การ์ดเซ็นเซอร์ขนาดใหญ่เจาะลึก 3 ตัว (Sensor Master Panels):**
   - จัดวางแบบ 3 แถวยาว หรือ 3 กริดใหญ่ที่ให้รายละเอียดสูงสุด:
   - **ส่วนซ้ายของการ์ด:**
     - เกจ์วัด O2 แบบ Semi-Circular Gauge ขนาดใหญ่ เข็มหรือแถบสีแสดงผลลื่นไหล (Smooth CSS/Canvas Transition)
     - ตัวเลขทศนิยม 2 ตำแหน่ง พร้อม Delta indicator (เช่น `+0.02% จาก 1 นาทีก่อน`)
   - **ส่วนกลางของการ์ด:**
     - บล็อกมาตรวัดอุณหภูมิ (Digital Thermometer UI) พร้อมหน่วย °C
     - บล็อกมาตรวัดความชื้นสัมพัทธ์ (Hygrometer Droplet UI) พร้อมหน่วย %RH
   - **ส่วนขวาของการ์ด:**
     - **Live Micro Sparkline:** กราฟเส้นขนาดเล็กแสดงการเคลื่อนไหวของค่า O2 ใน 5 นาทีล่าสุดแบบไหลไปข้างหน้า (Real-time oscilloscope feel)
     - **ข้อมูลฮาร์ดแวร์ Raspberry Pi:**
       - Device ID / IP Address (เช่น `192.168.1.101`)
       - สถานะเซ็นเซอร์: `Online / Low Latency`
       - วันที่สอบเทียบหัววัดล่าสุด (Last Calibration Date)

---

### หน้า 3: ประวัติข้อมูลย้อนหลัง (Historical Data & Analytics)
*จุดประสงค์: ค้นหา วิเคราะห์แนวโน้ม และตรวจสอบปัญหาย้อนหลังอย่างแม่นยำ*

#### องค์ประกอบและการจัดวาง:
1. **แถบตัวกรองขั้นสูง (Advanced Filter Toolbar):**
   - **เลือกเซ็นเซอร์:** All Sensors / เซ็นเซอร์ 1 / เซ็นเซอร์ 2 / เซ็นเซอร์ 3
   - **เลือกชนิดข้อมูล:** O2 Concentration (%) / Temperature (°C) / Humidity (%RH)
   - **ช่วงวัน-เวลา (Date-Time Picker):** Quick presets (วันนี้, เมื่อวาน, 7 วัน, 30 วัน) หรือเลือกช่วงวันเริ่มต้น-สิ้นสุด พร้อมระบุเวลาได้ถึงระดับนาที
   - **ปุ่ม Action:** ปุ่ม "ประมวลผลข้อมูล" (Search) และปุ่ม "ส่งออก CSV" (Export CSV) พร้อมไอคอนดาวน์โหลด
2. **การ์ดสรุปสถิติ 4 ช่อง (Statistical Summary Banner):**
   - **จำนวนชุดข้อมูลทั้งหมด (Total Data Points):** เช่น `8,640 รายการ`
   - **ค่าเฉลี่ย (Mean):** เช่น `20.92 %`
   - **ค่าต่ำสุด (Min Recorded):** เช่น `19.78 %` (ระบุเวลาที่เกิด)
   - **ค่าสูงสุด (Max Recorded):** เช่น `22.45 %` (ระบุเวลาที่เกิด)
3. **กราฟเส้น Interactive ขนาดใหญ่ (High-Resolution Analytics Chart):**
   - รองรับ Zoom in / Zoom out, Pan เลื่อนดูช่วงเวลาได้
   - มี Hover Tooltip แบบ Synchronized Crosshair แสดงค่าทุกเซ็นเซอร์ ณ วินาทีนั้น
   - มีจุดมาร์กเกอร์สีแดงระบุตรงตำแหน่งที่ค่ากระโดดข้ามเกณฑ์แจ้งเตือน
4. **ตารางแสดงข้อมูลดิบ (Data Log Table):**
   - คอลัมน์: วันที่-เวลา | ชื่อเซ็นเซอร์ | ค่า O2 (%) | อุณหภูมิ (°C) | ความชื้น (%RH) | สถานะความปลอดภัย
   - ระบบแบ่งหน้า (Pagination) และตัวเลือกว่าจะแสดง 25, 50, 100 แถวต่อหน้า

---

### หน้า 4: บันทึกประวัติการแจ้งเตือน (Alert Incident Log)
*จุดประสงค์: ตรวจสอบและบันทึกประวัติการรั่วไหล/ความผิดปกติ เพื่อใช้เป็นหลักฐานทางการแพทย์และความปลอดภัย*

#### องค์ประกอบและการจัดวาง:
1. **แถบสถิติเหตุการณ์ด้านบน (Incident Metrics Ribbon):**
   - จำนวนเหตุการณ์วิกฤต (Critical Leaks)
   - จำนวนแจ้งเตือนระดับเฝ้าระวัง (Warnings)
   - อัตราเวลาเฉลี่ยในการแก้ไขปัญหา (Avg. Resolution Time)
2. **ตัวกรองเหตุการณ์ (Incident Filters):**
   - ค้นหาด้วยคำสำคัญ (Search by note/sensor)
   - กรองตามระดับ: ทั้งหมด / อันตราย (Danger) / เตือน (Warning) / ผิดปกติ (Notice)
   - กรองตามเซ็นเซอร์: ทั้งหมด หรือเจาะจงจุด
   - กรองตามสถานะ: รอดำเนินการ (Pending) / รับทราบแล้ว (Acknowledged) / ปกติแล้ว (Resolved)
3. **ตารางเหตุการณ์แจ้งเตือนแบบพรีเมียม (Detailed Incident Table):**
   - **Incident ID:** รหัสอ้างอิง เช่น `#ALT-202609-0012`
   - **Timestamp:** วันที่และเวลาที่เกิดเหตุการณ์
   - **เซ็นเซอร์ & จุดติดตั้ง:** เช่น `เซ็นเซอร์ 01 - ห้องจ่ายก๊าซออกซิเจนส่วนกลาง`
   - **เงื่อนไขที่ทริกเกอร์:** ค่าที่ทำให้เกิดเตือน เช่น `O2 สูงเกินเกณฑ์: 23.82% (> 23.50%)`
   - **ระดับความรุนแรง (Severity Badge):** ชิปสีแดงสดใส พร้อมไอคอนไฟเตือน
   - **ช่องทางการแจ้งเตือนที่ส่ง:**
     - Telegram Bot Badge: `✓ สำเร็จ (13:45:02)`
     - LINE OA Badge: `✓ สำเร็จ (13:45:03)`
   - **การตอบสนอง:** แสดงชื่อผู้กดยืนยันรับทราบ และหมายเหตุการแก้ไข
   - **Action:** ปุ่มกดดู Snapshot กราฟย่อช่วงเวลาที่เกิดเหตุ (Modal View)

---

### หน้า 5: รายงานและสรุปผล (Compliance & Executive Reports)
*จุดประสงค์: สรุปผลความปลอดภัยสำหรับผู้บริหารโรงพยาบาลและกรรมการความปลอดภัยอาคาร*

#### องค์ประกอบและการจัดวาง:
1. **แผงกำหนดค่ารายงาน (Report Configuration Header):**
   - เลือกประเภทรายงาน (รายงานประจำวัน, สรุปประจำสัปดาห์, รายงานความปลอดภัยประจำเดือน)
   - ปฏิทินเลือกช่วงเวลา (Date Range Range Selector)
   - ปุ่มหลัก: **"สร้างรายงาน (Generate Report)"** และ **"ส่งออกเป็น PDF (Export to PDF)"**
2. **พรีวิวสรุปภาพรวม (Executive Summary Preview):**
   - ส่วนหัวมีตราสัญลักษณ์โรงพยาบาล และชื่อระบบ O2 SAFE
   - อัตราความพร้อมใช้งานของระบบ (System Uptime เช่น `99.98%`)
   - ดัชนีความปลอดภัย (Safety Index): สัดส่วนเวลาที่ออกซิเจนอยู่ในเกณฑ์มาตรฐาน 100%
   - จำนวนครั้งที่มีการแจ้งเตือนและการรั่วไหลในรอบเวลา
3. **ตารางสรุปรายเซ็นเซอร์เชิงสถิติ (Sensor Audit Breakdown):**
   - แสดงตารางเปรียบเทียบทั้ง 3 เซ็นเซอร์:
     - ชื่อจุดตรวจวัด | จำนวนข้อมูลที่บันทึก | ค่าต่ำสุด-เฉลี่ย-สูงสุด O2 | อุณหภูมิเฉลี่ย | ความชื้นเฉลี่ย | จำนวนชั่วโมงที่ผิดปกติ | การประเมินผล (ผ่านเกณฑ์ / เฝ้าระวัง)
4. **สรุปเหตุการณ์ผิดปกติที่สำคัญ (Incident Digest Section):**
   - สรุปย่อเหตุการณ์ที่เข้าข่ายอันตราย พร้อมข้อเสนอแนะในการบำรุงรักษาหัวเซ็นเซอร์
5. **พื้นที่ลงนามดิจิทัล (Sign-off Section):**
   - สำหรับพิมพ์ออกมาหรือแนบใน PDF: ลายเซ็นวิศวกรชีวการแพทย์ และหัวหน้างานความปลอดภัย

---

### หน้า 6: ตั้งค่าระบบและการเชื่อมต่อ (System Configuration & Integrations)
*จุดประสงค์: รวมศูนย์การตั้งค่าทั้งฮาร์ดแวร์ เกณฑ์วัด และบอทแจ้งเตือนแบบใช้งานง่าย*

#### องค์ประกอบและการจัดวาง (แบ่งเป็นการ์ด 4 บล็อกชัดเจน):
1. **ข้อมูลทั่วไปของระบบ (General Information):**
   - ชื่อโปรแกรม: กล่องข้อความ (ค่าเริ่มต้น `O2 SAFE - Oxygen Monitoring System`)
   - ชื่อโรงพยาบาล/หน่วยงาน: กล่องข้อความ
   - แผนก/ตึก: กล่องข้อความ
   - ภาษาการแสดงผล: Switch Toggle หรือ Dropdown (`ภาษาไทย` / `English`)
   - ความถี่ในการบันทึกข้อมูล (Sampling Interval): e.g. ทุก 5 วินาที / 10 วินาที / 30 วินาที
2. **การตั้งค่าเซ็นเซอร์ 3 ตัว (Sensor Hardware Configuration):**
   - รายการตั้งค่าแยกรายตัว 3 ตัว:
     - ช่องใส่ชื่อจุดติดตั้ง (Friendly Name e.g. "คลังท่อก๊าซอาคาร 1")
     - รหัสอ้างอิงฮาร์ดแวร์ Raspberry Pi Pin / I2C Address / Channel ID
     - ค่าชดเชยการสอบเทียบ (Calibration Offset e.g. `+0.00%`)
     - สวิตช์เปิด/ปิดเซ็นเซอร์แต่ละตัว (Enable/Disable Toggle)
3. **เกณฑ์การแจ้งเตือนแบบกำหนดเองพร้อมแถบ Preview (Custom Alert Thresholds with Visual Slider):**
   - **แถบ O2 Thresholds:**
     - กำหนด 4 ช่วงค่า:
       1. **ปกติ (Normal):** เช่น `20.00% – 22.00%` (สีเขียว)
       2. **เริ่มผิดปกติ (Elevated/Notice):** เช่น `22.01% – 22.99%` หรือ `19.50% – 19.99%` (สีฟ้า)
       3. **เตือน (Warning):** เช่น `23.00% – 23.49%` หรือ `18.00% – 19.49%` (สีส้ม)
       4. **อันตราย (Danger / Oxygen Enrichment):** เช่น `>= 23.50%` หรือ `< 18.00%` (สีแดง)
     - **Interactive Range Preview Bar:** แถบสี Spectrum แสดงกราฟิกให้เห็นทันทีว่าช่วงตัวเลขที่กรอกจะตกอยู่ในแถบสีใด ช่วยป้องกันผู้ใช้ตั้งค่าผิดพลาด
   - **เกณฑ์อุณหภูมิและความชื้น:**
     - กล่องกรอกช่วงอุณหภูมิที่เหมาะสม (Min/Max °C)
     - กล่องกรอกช่วงความชื้นที่เหมาะสม (Min/Max %RH)
4. **การตั้งค่าการแจ้งเตือน Telegram Bot และ LINE OA (Integrations):**
   - **Telegram Bot Configuration:**
     - Bot Token (ช่องป้อนพร้อมปุ่มซ่อน/แสดงรหัสผ่าน)
     - Chat ID / Group Channel ID
     - ปุ่ม **"ทดสอบส่งข้อความ Telegram (Test Send)"**
     - สถานะการเชื่อมต่อ: Badge แสดง `🟢 เชื่อมต่อสำเร็จ` หรือ `🔴 โทเคนไม่ถูกต้อง`
   - **LINE Official Account (LINE OA) Configuration:**
     - Channel Access Token
     - User ID / Group ID ปลายทาง
     - ตัวเลือกเปิดใช้งาน Flex Message (รูปแบบการแจ้งเตือนสวยงามพร้อมเกจ์)
     - ปุ่ม **"ทดสอบส่งข้อความ LINE (Test Send)"**
     - สถานะการเชื่อมต่อ: Badge แสดง `🟢 เชื่อมต่อสำเร็จ`

---

### หน้า 7: จัดการผู้ใช้งานและสิทธิ์ (User Management & Access Control)
*จุดประสงค์: รักษาความปลอดภัยและควบคุมระดับการเข้าถึงข้อมูลทางการแพทย์*

#### องค์ประกอบและการจัดวาง:
1. **สถิติผู้ใช้งานด้านบน (User Stats):**
   - จำนวนผู้ใช้ทั้งหมด, จำนวนผู้ดูแลระบบ (Admin), วิศวกร (Engineer), พยาบาล/เจ้าหน้าที่เวร (Operator/Viewer)
2. **ฟอร์มเพิ่มผู้ใช้ใหม่ (Add New User Panel - Modal หรือ Collapsible Card):**
   - ช่องกรอก:
     - ชื่อ (First Name) และ นามสกุล (Last Name)
     - แผนก / ตำแหน่งงาน (Department / Position)
     - เบอร์โทรศัพท์สำหรับติดต่อฉุกเฉิน (Phone Number)
     - อีเมลสำหรับเข้าใช้งานระบบ (Email Address)
     - รหัสผ่านเริ่มต้น (Initial Temporary Password) พร้อมปุ่ม Auto-generate
     - **กำหนดบทบาทและสิทธิ์ (Role & Permissions):**
       - ผู้ดูแลระบบสูงสุด (Super Admin) — จัดการทุกอย่างรวมถึงระบบและผู้ใช้
       - วิศวกรชีวการแพทย์ (Biomedical Engineer) — ตั้งค่าเซ็นเซอร์และเกณฑ์เตือนได้
       - เจ้าหน้าที่ความปลอดภัย/พยาบาล (Safety Operator) — ดูค่าสด รับทราบเตือน ส่งออกรายงานได้
       - ผู้สังเกตการณ์ (Viewer) — ดูได้อย่างเดียว
3. **ตารางรายชื่อผู้ใช้และเครื่องมือจัดการ (User Directory Table):**
   - **คอลัมน์:**
     - ข้อมูลผู้ใช้: Avatar, ชื่อ-นามสกุล, อีเมล
     - ตำแหน่ง/แผนก: ชิปแสดงชื่อแผนก
     - สิทธิ์การใช้งาน: Badge สีเฉพาะบทบาท (เช่น Admin: ม่วง, Engineer: น้ำเงิน, Operator: ฟ้า)
     - เบอร์โทรศัพท์
     - สถานะการใช้งาน: สวิตช์ Toggle เปิด/ปิด (Active / Suspended)
     - วันที่เข้าสู่ระบบล่าสุด (Last Login)
   - **ปุ่มจัดการ (Action Menu):**
     - ปุ่มแก้ไขข้อมูลผู้ใช้ (Edit User)
     - ปุ่มรีเซ็ตรหัสผ่าน (Reset Password) พร้อมหน้าต่างยืนยันและส่งรหัสใหม่ทางอีเมล
     - ปุ่มลบผู้ใช้งาน (Delete) พร้อม Two-factor Confirmation

---

## 5. Master Prompt สำหรับส่งให้ AI หรือ Frontend Developer

> คุณสามารถ Copy ข้อความในกรอบด้านล่างนี้ไปสั่งงานใน **Claude, Cursor, v0.dev, ChatGPT, หรือทีมพัฒนา Frontend** เพื่อสร้างโค้ดหน้าตา UI ใหม่ได้ทันที:

```markdown
# MISSION: UI/UX Redesign for "O2 SAFE" — Hospital Oxygen Leak Detection System

## 1. Context & Objective
Redesign the entire web application interface for "O2 SAFE", a mission-critical Oxygen Leak Detection & Environmental Monitoring System deployed in hospital settings.
- Hardware: 3 Raspberry Pi sensor stations reporting Oxygen Concentration (%), Temperature (°C), and Humidity (%RH).
- Alert Channels: Telegram Bot and LINE Official Account (LINE OA).
- Core Objective: Transition from an outdated generic corporate blue-green look into a state-of-the-art, high-tech, medical-grade SaaS monitoring dashboard (inspired by modern observability tools like Datadog, Grafana Cloud, Vercel, and Linear).
- Target Users: Hospital safety officers, biomedical engineers, and nursing staff.

## 2. Visual Identity & Design System
- Theme: Dark Mode by default (sleek, deep slate/zinc surface #0A0D14 with sharp borders #1E293B) and clean, clinical Crisp Light Mode option.
- Primary Accent: Electric Ice Cyan (#06B6D4 / #0284C7) representing pure oxygen and technology.
- Status Semantics:
  - Normal (O2 20.0 - 22.0%): Emerald Green (#10B981)
  - Elevated/Notice: Sky Blue (#38BDF8)
  - Warning (O2 <19.5% or >23.0%): Amber (#F59E0B)
  - Danger/Oxygen Leak (O2 >23.5% fire hazard, <18.0% asphyxiation): Vivid Crimson (#EF4444)
  - Offline: Slate Gray (#64748B)
- Typography: Clean Sans-serif (Plus Jakarta Sans / Inter / Prompt for Thai) with Monospace numerals (JetBrains Mono) for sensor readings and decimal values to prevent jitter.
- Component Philosophy: Modular cards, micro-interactions, pulsing live beacons, high-contrast alerts, clean SVG arc gauges.

## 3. Global Layout Architecture
- Top Header:
  - O2 SAFE brand identity with glowing oxygen molecule emblem
  - Hospital & Ward display
  - Raspberry Pi telemetry status beacon ("Raspberry Pi: 3/3 Connected • 18ms")
  - Telegram & LINE OA active connection pills
  - Digital wall clock with seconds
  - User profile & Dark/Light mode switch
- Sidebar Navigation: Collapsible with 7 clear destinations:
  1. แดชบอร์ด (Dashboard)
  2. ข้อมูลเรียลไทม์ (Real-time)
  3. ประวัติข้อมูล (Historical)
  4. การแจ้งเตือน (Alerts)
  5. รายงาน (Reports)
  6. ตั้งค่าระบบ (Settings)
  7. จัดการผู้ใช้ (User Management)

## 4. The 7 Required Pages Specification
Build all 7 pages preserving 100% of existing functionality with the upgraded design:

### Page 1: แดชบอร์ดภาพรวม (Dashboard Overview)
- 4 Top Summary KPI Cards: System Health (Shield icon), Connected Sensors (3/3 Online), Today's Alerts Count, Environmental Aggregate (Avg Temp & Humidity).
- 3 Sensor Station Cards: Radial O2 gauge with safety range markers, status badge, current temperature & humidity chips, "last updated x seconds ago".
- 24-Hour O2 Trend Graph: Multi-series line chart for all 3 sensors, shaded safe boundary band (19.5% - 23.5%), baseline at 20.9%, interactive tooltip.
- Recent Alerts Feed: 5 latest alert events with severity chips and Quick Acknowledge button.
- Threshold Quick Reference Table: Clean pill-styled table summarizing current O2, temp, and humidity limits.

### Page 2: ข้อมูลแบบเรียลไทม์ (Real-time Telemetry)
- Auto-refresh controller (1s / 3s / 5s stream toggle or pause) + Raspberry Pi live ping.
- 3 Dedicated Detailed Panels for Sensor 1, 2, and 3:
  - Large smooth semi-circular gauge for O2 (%) with 2 decimal precision (e.g. 20.95%).
  - Digital meters for Temperature (°C) and Humidity (%RH).
  - Live rolling 5-minute sparkline chart showing micro-variations.
  - Node diagnostic information: IP address, signal strength, calibration expiry.

### Page 3: ประวัติข้อมูลย้อนหลัง (Historical Data & Analytics)
- Advanced Filter Toolbar: Multi-select sensor dropdown, metric selector (O2/Temp/Humidity), modern Date-Time Range Picker with presets, Search button, and Export CSV button.
- 4 Statistical Summary Cards: Total Data Points, Average Value, Min Recorded Value (with timestamp), Max Recorded Value (with timestamp).
- High-Resolution Time-Series Chart: Zoom/Pan enabled, synchronized cursor, marked breach points.
- Data Log Table: Paginated tabular records with sortable columns and status badges.

### Page 4: บันทึกประวัติการแจ้งเตือน (Alert Incident Log)
- Metrics Ribbon: Total alerts, critical leaks, average resolution time.
- Filter Bar: Search query, severity filter (Danger/Warning/Notice), sensor station filter, status filter (Pending/Acknowledged/Resolved).
- Comprehensive Incident Log Table: Incident ID, timestamp, sensor location, trigger metric & reading, severity badge, Telegram delivery badge, LINE delivery badge, operator acknowledgement note, and "View Snapshot" modal button.

### Page 5: รายงานและสรุปผล (Compliance & Executive Reports)
- Report Configuration Bar: Date range selector, report format picker, "Generate Report" and "Export to PDF" buttons.
- Executive Summary Preview: Printable hospital letterhead format, uptime percentage (e.g. 99.98%), safety compliance index, total incident tally.
- Detailed Sensor Comparison Table: Aggregate audit per sensor with min/avg/max readings and alarm hours.
- Digital Sign-off Block: Formal approval section for Biomedical Engineer and Safety Director.

### Page 6: ตั้งค่าระบบและการเชื่อมต่อ (System Configuration & Integrations)
- 4 Clear Configuration Cards:
  1. General Info: System title, hospital name, facility ward, language switcher (TH/EN), sampling rate.
  2. 3x Sensor Hardware Config: Friendly name, Raspberry Pi GPIO/I2C address, calibration offset (+/- 0.00%), enable/disable toggles.
  3. Custom Alert Thresholds: Interactive inputs for Normal, Elevated, Warning, and Danger O2 levels with an interactive spectrum preview slider reflecting changes in real-time. Temperature and humidity bounds.
  4. Telegram & LINE OA Settings: Bot Token, Chat ID, Channel Access Token, live status indicator, and interactive "Test Send Notification" buttons.

### Page 7: จัดการผู้ใช้งานและสิทธิ์ (User Management & Access Control)
- User Stats Header: Total users count broken down by role.
- Add New User Panel: First/Last name, position/department, phone, email, initial password generator, and Role selector (Super Admin, Biomedical Engineer, Safety Operator, Viewer).
- User Directory Table: Avatar, name, email, department, role chip, active/suspended toggle switch, last login timestamp, edit button, and reset password modal.

## 5. Technology Stack Recommendation
- Framework: Next.js / React with TypeScript
- Styling: Tailwind CSS
- Icons: Lucide React
- Components: Radix UI / Shadcn UI
- Charts: Recharts or Chart.js with custom tooltips
- Real-time: WebSockets / Server-Sent Events from Raspberry Pi server
```

---

## 6. โครงสร้างไฟล์แนะนำสำหรับการขึ้นโปรเจกต์ (Project Architecture)

หากต้องการนำไปเขียนโค้ดต่อในโฟลเดอร์ `C:\Users\filmz\OneDrive\Desktop\webproject_iot` แนะนำโครงสร้างไฟล์ดังนี้:

```text
webproject_iot/
├── O2_SAFE_UI_UX_REDESIGN_PROMPT.md   <-- (ไฟล์ข้อกำหนดนี้)
├── package.json
├── tailwind.config.ts
├── src/
│   ├── app/
│   │   ├── layout.tsx                # โครง Shell: TopBar + Sidebar Navigation
│   │   ├── page.tsx                  # หน้า 1: Dashboard ภาพรวม
│   │   ├── realtime/page.tsx         # หน้า 2: ข้อมูลสด Real-time
│   │   ├── history/page.tsx          # หน้า 3: ประวัติย้อนหลัง & กราฟ
│   │   ├── alerts/page.tsx           # หน้า 4: บันทึกแจ้งเตือน Incident Log
│   │   ├── reports/page.tsx          # หน้า 5: รายงานและส่งออก PDF
│   │   ├── settings/page.tsx         # หน้า 6: ตั้งค่าระบบ, เซ็นเซอร์, บอท
│   │   └── users/page.tsx            # หน้า 7: จัดการผู้ใช้และสิทธิ์
│   ├── components/
│   │   ├── ui/                       # Shadcn / Radix Components
│   │   ├── gauges/                   # O2 Radial Gauges สวยงาม
│   │   ├── charts/                   # 24h Trend, Realtime Sparkline
│   │   └── alerts/                   # Alert Badge & Notification Modals
│   └── lib/
│       ├── types.ts                  # SensorData, Thresholds, User Types
│       └── mockData.ts               # ข้อมูลจำลองสำหรับทดสอบ UI
```
