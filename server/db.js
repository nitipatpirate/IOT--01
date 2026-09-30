import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'o2safe.db');
const db = new DatabaseSync(dbPath);

// Initialize schema and seed data
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      department TEXT NOT NULL,
      position TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      last_login DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sensors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      hardware_id TEXT NOT NULL,
      gpio_pin TEXT,
      i2c_address TEXT,
      calibration_offset REAL DEFAULT 0.0,
      is_enabled INTEGER DEFAULT 1,
      status TEXT DEFAULT 'online',
      last_calibration TEXT
    );

    CREATE TABLE IF NOT EXISTS thresholds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric TEXT UNIQUE NOT NULL,
      normal_min REAL NOT NULL,
      normal_max REAL NOT NULL,
      elevated_min REAL NOT NULL,
      elevated_max REAL NOT NULL,
      warning_min REAL NOT NULL,
      warning_max REAL NOT NULL,
      danger_low REAL NOT NULL,
      danger_high REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sensor_code TEXT NOT NULL,
      o2_level REAL NOT NULL,
      temperature REAL NOT NULL,
      humidity REAL NOT NULL,
      status TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      alert_code TEXT UNIQUE NOT NULL,
      sensor_code TEXT NOT NULL,
      sensor_name TEXT NOT NULL,
      metric TEXT NOT NULL,
      value REAL NOT NULL,
      threshold_exceeded TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      telegram_sent INTEGER DEFAULT 1,
      line_sent INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'pending',
      acknowledged_by TEXT,
      acknowledged_at DATETIME,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS system_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      system_title TEXT DEFAULT 'O2 SAFE - Oxygen Monitoring System',
      hospital_name TEXT DEFAULT 'โรงพยาบาลศูนย์การแพทย์ศิริวัฒน์',
      department TEXT DEFAULT 'ฝ่ายวิศวกรรมชีวการแพทย์และความปลอดภัย',
      language TEXT DEFAULT 'th',
      sampling_interval INTEGER DEFAULT 5,
      telegram_token TEXT,
      telegram_chat_id TEXT,
      line_token TEXT,
      line_target_id TEXT,
      enable_line_flex INTEGER DEFAULT 1
    );
  `);

  // Seed default users if empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    const insertUser = db.prepare(`
      INSERT INTO users (first_name, last_name, email, password, department, position, phone, role, status, last_login)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 hours'))
    `);

    insertUser.run('สมศักดิ์', 'เจริญผล', 'admin@o2safe.hospital', 'admin123', 'ฝ่ายวิศวกรรมการแพทย์', 'หัวหน้างานวิศวกรรมความปลอดภัย', '081-234-5678', 'admin', 'active');
    insertUser.run('กมลชนก', 'สุวรรณศรี', 'engineer@o2safe.hospital', 'eng123', 'ฝ่ายเทคนิคชีวการแพทย์', 'วิศวกรชีวการแพทย์ชำนาญการ', '089-876-5432', 'engineer', 'active');
    insertUser.run('อรทัย', 'พูนสวัสดิ์', 'nurse@o2safe.hospital', 'nurse123', 'แผนกผู้ป่วยวิกฤต (ICU)', 'พยาบาลหัวหน้าเวร ICU', '092-345-6789', 'operator', 'active');
    insertUser.run('วิชัย', 'มั่นคงดี', 'viewer@o2safe.hospital', 'view123', 'งานบริหารความเสี่ยงอาคาร', 'เจ้าหน้าที่ตรวจสอบความปลอดภัย', '086-112-2334', 'viewer', 'active');
    console.log('✔ Seeded 4 default users in SQLite database.');
  }

  // Seed default sensors
  const sensorCount = db.prepare('SELECT COUNT(*) as count FROM sensors').get().count;
  if (sensorCount === 0) {
    const insertSensor = db.prepare(`
      INSERT INTO sensors (sensor_code, name, location, hardware_id, gpio_pin, i2c_address, calibration_offset, is_enabled, status, last_calibration)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'online', '2026-08-15')
    `);

    insertSensor.run('sensor_01', 'เซ็นเซอร์ 01 - คลังท่อก๊าซส่วนกลาง', 'อาคารยูทิลิตี้ ชั้นใต้ดิน B1 (Manifold Room)', 'RPI-NODE-01-MFLD', 'GPIO 21', '0x48', 0.0);
    insertSensor.run('sensor_02', 'เซ็นเซอร์ 02 - ห้องผ่าตัด ICU Ward', 'อาคารเฉลิมพระเกียรติ ชั้น 3 ห้องผ่าตัดใหญ่ 2', 'RPI-NODE-02-ICU', 'GPIO 20', '0x49', 0.0);
    insertSensor.run('sensor_03', 'เซ็นเซอร์ 03 - ตึกผู้ป่วยใน ชั้น 4 (Inpatient)', 'อาคารผู้ป่วยใน ชั้น 4 โซนท่อจ่ายออกซิเจน', 'RPI-NODE-03-WARD4', 'GPIO 16', '0x4A', 0.0);
    console.log('✔ Seeded 3 default hospital sensors in SQLite.');
  }

  // Seed default thresholds
  const thresholdCount = db.prepare('SELECT COUNT(*) as count FROM thresholds').get().count;
  if (thresholdCount === 0) {
    const insertThreshold = db.prepare(`
      INSERT INTO thresholds (metric, normal_min, normal_max, elevated_min, elevated_max, warning_min, warning_max, danger_low, danger_high)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // O2: Normal 20.0-22.0, Elevated 22.01-22.99 / 19.5-19.99, Warning 23.0-23.49 / 18.0-19.49, Danger >23.5 or <18.0
    insertThreshold.run('o2', 20.0, 22.0, 19.5, 23.0, 18.0, 23.49, 18.0, 23.5);
    // Temp: Normal 20-25°C, Warning 26-28°C, Danger >28°C
    insertThreshold.run('temperature', 20.0, 25.0, 25.1, 26.0, 26.1, 28.0, 15.0, 28.0);
    // Humidity: Normal 40-60%RH, Warning 61-70%RH, Danger >70%RH
    insertThreshold.run('humidity', 40.0, 60.0, 60.1, 65.0, 65.1, 70.0, 30.0, 70.0);
    console.log('✔ Seeded default threshold rules.');
  }

  // Seed system settings
  const settingsCount = db.prepare('SELECT COUNT(*) as count FROM system_settings').get().count;
  if (settingsCount === 0) {
    db.prepare(`
      INSERT INTO system_settings (
        system_title, hospital_name, department, language, sampling_interval,
        telegram_token, telegram_chat_id, line_token, line_target_id, enable_line_flex
      ) VALUES (
        'O2 SAFE - Oxygen Monitoring System',
        'โรงพยาบาลศูนย์การแพทย์ศิริวัฒน์',
        'ฝ่ายวิศวกรรมชีวการแพทย์และความปลอดภัย',
        'th',
        5,
        '6892348123:AAHk_EXAMPLE_TELEGRAM_TOKEN_O2SAFE',
        '-10023456789',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.EXAMPLE_LINE_OA_TOKEN',
        'C1234567890abcdef1234567890abcdef',
        1
      )
    `).run();
    console.log('✔ Seeded system settings.');
  }

  // Seed historical readings for past 24 hours if empty
  const readingCount = db.prepare('SELECT COUNT(*) as count FROM readings').get().count;
  if (readingCount === 0) {
    const insertReading = db.prepare(`
      INSERT INTO readings (sensor_code, o2_level, temperature, humidity, status, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = Date.now();
    const sensors = ['sensor_01', 'sensor_02', 'sensor_03'];

    // Generate readings every 15 minutes for 24 hours (96 points per sensor)
    for (let i = 96; i >= 0; i--) {
      const time = new Date(now - i * 15 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 19);
      
      for (const s of sensors) {
        // Base normal ambient O2 is ~20.9%
        let baseO2 = 20.85 + (Math.sin(i / 8) * 0.2) + ((Math.random() - 0.5) * 0.15);
        let temp = 22.4 + (Math.cos(i / 12) * 1.2) + ((Math.random() - 0.5) * 0.4);
        let hum = 52.0 + (Math.sin(i / 10) * 4.0) + ((Math.random() - 0.5) * 1.5);
        let status = 'normal';

        // Simulate a minor leak event 3 hours ago on sensor_01
        if (s === 'sensor_01' && i >= 11 && i <= 14) {
          baseO2 = 23.65 + ((Math.random() - 0.5) * 0.2);
          status = 'danger';
        } else if (s === 'sensor_02' && i === 30) {
          baseO2 = 22.85;
          status = 'warning';
        }

        insertReading.run(
          s,
          parseFloat(baseO2.toFixed(2)),
          parseFloat(temp.toFixed(1)),
          parseFloat(hum.toFixed(1)),
          status,
          time
        );
      }
    }
    console.log('✔ Seeded 24-hour historical telemetry data.');
  }

  // Seed sample alerts
  const alertCount = db.prepare('SELECT COUNT(*) as count FROM alerts').get().count;
  if (alertCount === 0) {
    const insertAlert = db.prepare(`
      INSERT INTO alerts (alert_code, sensor_code, sensor_name, metric, value, threshold_exceeded, severity, message, telegram_sent, line_sent, status, acknowledged_by, acknowledged_at, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    insertAlert.run(
      'ALT-2026-0042',
      'sensor_01',
      'เซ็นเซอร์ 01 - คลังท่อก๊าซส่วนกลาง',
      'O2',
      23.85,
      '> 23.50% (Oxygen Enrichment)',
      'danger',
      'ตรวจพบความเข้มข้นออกซิเจนสูงผิดปกติ 23.85% เสี่ยงต่อการเกิดเพลิงไหม้',
      1,
      1,
      'acknowledged',
      'สมศักดิ์ เจริญผล (Admin)',
      new Date().toISOString(),
      '-3 hours'
    );

    insertAlert.run(
      'ALT-2026-0041',
      'sensor_02',
      'เซ็นเซอร์ 02 - ห้องผ่าตัด ICU Ward',
      'O2',
      22.85,
      '> 22.50% (Elevated Level)',
      'warning',
      'ค่าออกซิเจนสูงขึ้นเล็กน้อย 22.85% ตรวจสอบวาล์วจ่ายก๊าซผู้ป่วย',
      1,
      1,
      'resolved',
      'กมลชนก สุวรรณศรี (Engineer)',
      new Date().toISOString(),
      '-8 hours'
    );

    insertAlert.run(
      'ALT-2026-0040',
      'sensor_03',
      'เซ็นเซอร์ 03 - ตึกผู้ป่วยใน ชั้น 4',
      'Temp',
      27.2,
      '> 26.0°C (High Room Temp)',
      'notice',
      'อุณหภูมิห้องควบคุมสูงกว่าเกณฑ์ 27.2°C ระบบปรับอากาศห้องผู้ป่วยทำงานหนัก',
      1,
      0,
      'resolved',
      'อรทัย พูนสวัสดิ์ (Operator)',
      new Date().toISOString(),
      '-18 hours'
    );
    console.log('✔ Seeded alert history logs.');
  }
}

export default db;
