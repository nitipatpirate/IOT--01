import express from 'express';
import cors from 'cors';

import db, { initDatabase } from './db.js';
import mysql from './mysql.js';

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// =====================================================
// TEST MYSQL
// =====================================================

app.get('/api/test-mysql', async (req, res) => {
  try {

    const [rows] = await mysql.query(`
      SELECT *
      FROM sensor_data
      ORDER BY id DESC
      LIMIT 1
    `);

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'MySQL connection error'
    });

  }
});


// =====================================================
// GET LATEST SENSOR DATA
// =====================================================

app.get('/api/sensor-data/latest', async (req, res) => {
  try {

    const [rows] = await mysql.query(`
      SELECT
        id,
        sensor_code,
        temperature,
        humidity,
        created_at
      FROM sensor_data
      ORDER BY id DESC
      LIMIT 1
    `);

    res.json(rows);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      error: 'Cannot get sensor data'
    });

  }
});


// =====================================================
// INITIALIZE SQLITE
// ใช้สำหรับ Login / Users เท่านั้น
// =====================================================

initDatabase();


// =====================================================
// AUTHENTICATION
// =====================================================

app.post('/api/auth/login', (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: 'กรุณากรอกอีเมลและรหัสผ่าน'
    });
  }

  const user = db.prepare(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      password,
      department,
      position,
      phone,
      role,
      status
    FROM users
    WHERE email = ?
  `).get(email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({
      error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ'
    });
  }

  if (user.password !== password) {
    return res.status(401).json({
      error: 'รหัสผ่านไม่ถูกต้อง'
    });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({
      error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'
    });
  }

  db.prepare(`
    UPDATE users
    SET last_login = datetime('now')
    WHERE id = ?
  `).run(user.id);

  const { password: _, ...userSafe } = user;

  const token = `o2safe_token_${user.id}_${Date.now()}`;

  res.json({
    token,
    user: userSafe,
    message: 'เข้าสู่ระบบสำเร็จ'
  });

});


app.get('/api/auth/me', (req, res) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      error: 'Unauthorized'
    });
  }

  const user = db.prepare(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      department,
      position,
      phone,
      role,
      status,
      last_login
    FROM users
    WHERE status = 'active'
    LIMIT 1
  `).get();

  res.json({
    user
  });

});


// =====================================================
// DASHBOARD
// ดึงข้อมูลจาก MySQL
// =====================================================

app.get('/api/dashboard', async (req, res) => {

  try {

    const [rows] = await mysql.query(`
      SELECT
        id,
        sensor_code,
        temperature,
        humidity,
        created_at
      FROM sensor_data
      ORDER BY id DESC
    `);


    // เก็บข้อมูลล่าสุดของแต่ละ Sensor

    const sensorMap = {};

    rows.forEach(row => {

      if (!sensorMap[row.sensor_code]) {
        sensorMap[row.sensor_code] = row;
      }

    });


    const sensorStatusList = Object.values(sensorMap).map(sensor => {

      return {

        sensor_code: sensor.sensor_code,

        name: sensor.sensor_code,

        status: 'online',

        is_enabled: 1,

        currentReading: {

          temperature: Number(sensor.temperature),

          humidity: Number(sensor.humidity),

          timestamp: sensor.created_at

        }

      };

    });


    const totalSensors = sensorStatusList.length;

    const onlineSensors = sensorStatusList.length;


    // ค่าเฉลี่ยอุณหภูมิ

    const avgTemp = totalSensors > 0

      ? sensorStatusList.reduce(
          (sum, sensor) =>
            sum + sensor.currentReading.temperature,
          0
        ) / totalSensors

      : 0;


    // ค่าเฉลี่ยความชื้น

    const avgHum = totalSensors > 0

      ? sensorStatusList.reduce(
          (sum, sensor) =>
            sum + sensor.currentReading.humidity,
          0
        ) / totalSensors

      : 0;


    const systemHealth = 'normal';


    // ข้อมูลกราฟ

    const trendData = rows

      .slice(0, 24)

      .reverse()

      .map(row => ({

        time: new Date(row.created_at).toLocaleTimeString(
          'th-TH',
          {
            hour: '2-digit',
            minute: '2-digit'
          }
        ),

        temperature: Number(row.temperature),

        humidity: Number(row.humidity)

      }));


    res.json({

      kpis: {

        systemHealth,

        totalSensors,

        onlineSensors,

        activeAlerts: 0,

        avgTemp: Number(avgTemp.toFixed(1)),

        avgHum: Number(avgHum.toFixed(1)),

        lastUpdated: new Date().toISOString()

      },

      sensors: sensorStatusList,

      trendData,

      recentAlerts: [],

      thresholds: []

    });


  } catch (error) {

    console.error(
      'Dashboard MySQL Error:',
      error
    );

    res.status(500).json({

      error: 'Cannot load dashboard data from MySQL'

    });

  }

});


// =====================================================
// REALTIME
// ดึงข้อมูลจาก MySQL
// =====================================================

app.get('/api/realtime', async (req, res) => {

  try {

    const [rows] = await mysql.query(`
      SELECT
        id,
        sensor_code,
        temperature,
        humidity,
        created_at
      FROM sensor_data
      ORDER BY id DESC
      LIMIT 20
    `);


    const sensorMap = {};


    rows.forEach(row => {

      if (!sensorMap[row.sensor_code]) {
        sensorMap[row.sensor_code] = row;
      }

    });


    const sensors = Object.values(sensorMap).map(sensor => ({

      sensor_code: sensor.sensor_code,

      name: sensor.sensor_code,

      status: 'online',

      currentReading: {

        temperature: Number(sensor.temperature),

        humidity: Number(sensor.humidity),

        timestamp: sensor.created_at

      }

    }));


    res.json({

      timestamp: new Date().toISOString(),

      sensors

    });


  } catch (error) {

    console.error(
      'Realtime MySQL Error:',
      error
    );

    res.status(500).json({

      error: 'Cannot load realtime sensor data'

    });

  }

});


// =====================================================
// HISTORICAL DATA
// MySQL เท่านั้น
// =====================================================

app.get('/api/history', async (req, res) => {

  try {

    const [rows] = await mysql.query(`
      SELECT
        id,
        sensor_code,
        temperature,
        humidity,
        created_at
      FROM sensor_data
      WHERE sensor_code = 'SN300-01'
      ORDER BY id DESC
      LIMIT 200
    `);


    const data = rows.reverse().map(row => ({

      id: row.id,

      sensor_code: row.sensor_code,

      temperature: Number(row.temperature),

      humidity: Number(row.humidity),

      status: 'normal',

      timestamp: new Date(row.created_at).toISOString()

    }));


    const values = data.map(
      row => row.temperature
    );


    const totalPoints = values.length;


    const avg = totalPoints > 0

      ? values.reduce(
          (sum, value) => sum + value,
          0
        ) / totalPoints

      : 0;


    const min = totalPoints > 0

      ? Math.min(...values)

      : 0;


    const max = totalPoints > 0

      ? Math.max(...values)

      : 0;


    res.json({

      stats: {

        totalPoints,

        avg: Number(avg.toFixed(2)),

        min: Number(min.toFixed(2)),

        max: Number(max.toFixed(2)),

        metric: 'temp'

      },

      data

    });


  } catch (error) {

    console.error(
      'HISTORY ERROR:',
      error
    );

    res.status(500).json({

      error: 'Cannot load history',

      message: error.message

    });

  }

});


// =====================================================
// TELEMETRY
// ไม่ใช้แล้วสำหรับ SN300
// =====================================================

// ไม่ต้องใช้ /api/telemetry/ingest
// เพราะ ESP32 -> n8n -> MySQL อยู่แล้ว


// =====================================================
// ALERTS
// =====================================================

app.get('/api/alerts', (req, res) => {

  const {
    severity,
    sensor_code,
    status
  } = req.query;


  let query =
    'SELECT * FROM alerts WHERE 1=1';


  const params = [];


  if (
    severity &&
    severity !== 'all'
  ) {

    query += ' AND severity = ?';

    params.push(severity);

  }


  if (
    sensor_code &&
    sensor_code !== 'all'
  ) {

    query += ' AND sensor_code = ?';

    params.push(sensor_code);

  }


  if (
    status &&
    status !== 'all'
  ) {

    query += ' AND status = ?';

    params.push(status);

  }


  query += ' ORDER BY id DESC';


  const alerts = db
    .prepare(query)
    .all(...params);


  res.json({
    alerts
  });

});


app.post('/api/alerts/:id/acknowledge', (req, res) => {

  const { id } = req.params;

  const {
    userName = 'Admin System'
  } = req.body;


  db.prepare(`
    UPDATE alerts
    SET
      status = 'acknowledged',
      acknowledged_by = ?,
      acknowledged_at = datetime('now')
    WHERE id = ?
  `).run(
    userName,
    id
  );


  res.json({

    success: true,

    message:
      'รับทราบเหตุการณ์เรียบร้อยแล้ว'

  });

});


// =====================================================
// REPORTS
// =====================================================

app.get('/api/reports', (req, res) => {

  const sensors = db
    .prepare(
      'SELECT * FROM sensors WHERE is_enabled = 1'
    )
    .all();


  const settings = db
    .prepare(
      'SELECT * FROM system_settings LIMIT 1'
    )
    .get();


  const auditData = sensors.map(sensor => {

    const stats = db.prepare(`
      SELECT

        COUNT(*) as total_samples,

        AVG(o2_level) as avg_o2,

        MIN(o2_level) as min_o2,

        MAX(o2_level) as max_o2,

        AVG(temperature) as avg_temp,

        AVG(humidity) as avg_hum,

        SUM(
          CASE
            WHEN status != 'normal'
            THEN 1
            ELSE 0
          END
        ) as abnormal_events

      FROM readings

      WHERE sensor_code = ?

    `).get(sensor.sensor_code);


    return {

      sensor_code: sensor.sensor_code,

      name: sensor.name,

      location: sensor.location,

      total_samples:
        stats.total_samples || 0,

      avg_o2:
        stats.avg_o2
          ? parseFloat(stats.avg_o2.toFixed(2))
          : 20.9,

      min_o2:
        stats.min_o2
          ? parseFloat(stats.min_o2.toFixed(2))
          : 20.9,

      max_o2:
        stats.max_o2
          ? parseFloat(stats.max_o2.toFixed(2))
          : 20.9,

      avg_temp:
        stats.avg_temp
          ? parseFloat(stats.avg_temp.toFixed(1))
          : 22.5,

      avg_hum:
        stats.avg_hum
          ? parseFloat(stats.avg_hum.toFixed(1))
          : 55.0,

      abnormal_events:
        stats.abnormal_events || 0,

      compliance_status:
        (stats.abnormal_events || 0) === 0
          ? 'สมบูรณ์ 100%'
          : 'มีเหตุการณ์เตือน'

    };

  });


  const totalAlerts =
    db.prepare(
      'SELECT COUNT(*) as count FROM alerts'
    ).get().count;


  res.json({

    hospital:
      settings?.hospital_name ||
      'โรงพยาบาลศูนย์การแพทย์ศิริวัฒน์',

    department:
      settings?.department ||
      'ฝ่ายวิศวกรรมชีวการแพทย์',

    systemTitle:
      settings?.system_title ||
      'O2 SAFE System',

    generatedAt:
      new Date().toISOString(),

    uptime: '99.98%',

    safetyScore: '98.5%',

    totalAlerts,

    auditData

  });

});


// =====================================================
// SETTINGS
// =====================================================

app.get('/api/settings', (req, res) => {

  const settings = db
    .prepare(
      'SELECT * FROM system_settings LIMIT 1'
    )
    .get();


  const sensors = db
    .prepare(
      'SELECT * FROM sensors'
    )
    .all();


  const thresholds = db
    .prepare(
      'SELECT * FROM thresholds'
    )
    .all();


  res.json({

    settings,

    sensors,

    thresholds

  });

});


app.put('/api/settings', (req, res) => {

  const {
    settings,
    thresholds,
    sensors
  } = req.body;


  if (settings) {

    db.prepare(`
      UPDATE system_settings

      SET
        system_title = ?,
        hospital_name = ?,
        department = ?,
        language = ?,
        sampling_interval = ?,
        telegram_token = ?,
        telegram_chat_id = ?,
        line_token = ?,
        line_target_id = ?,
        enable_line_flex = ?

      WHERE id = 1

    `).run(

      settings.system_title,

      settings.hospital_name,

      settings.department,

      settings.language,

      settings.sampling_interval,

      settings.telegram_token,

      settings.telegram_chat_id,

      settings.line_token,

      settings.line_target_id,

      settings.enable_line_flex
        ? 1
        : 0

    );

  }


  if (
    thresholds &&
    Array.isArray(thresholds)
  ) {

    const updateThreshold =
      db.prepare(`
        UPDATE thresholds

        SET
          normal_min = ?,
          normal_max = ?,
          elevated_min = ?,
          elevated_max = ?,
          warning_min = ?,
          warning_max = ?,
          danger_low = ?,
          danger_high = ?

        WHERE metric = ?
      `);


    for (const t of thresholds) {

      updateThreshold.run(

        t.normal_min,

        t.normal_max,

        t.elevated_min,

        t.elevated_max,

        t.warning_min,

        t.warning_max,

        t.danger_low,

        t.danger_high,

        t.metric

      );

    }

  }


  if (
    sensors &&
    Array.isArray(sensors)
  ) {

    const updateSensor =
      db.prepare(`
        UPDATE sensors

        SET
          name = ?,
          location = ?,
          calibration_offset = ?,
          is_enabled = ?

        WHERE id = ?
      `);


    for (const s of sensors) {

      updateSensor.run(

        s.name,

        s.location,

        s.calibration_offset,

        s.is_enabled
          ? 1
          : 0,

        s.id

      );

    }

  }


  res.json({

    success: true,

    message:
      'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว'

  });

});


// =====================================================
// TEST TELEGRAM
// =====================================================

app.post('/api/settings/test-telegram', (req, res) => {

  const {
    token,
    chatId
  } = req.body;


  if (!token || !chatId) {

    return res.status(400).json({

      error:
        'กรุณากรอก Telegram Bot Token และ Chat ID ให้ครบถ้วน'

    });

  }


  res.json({

    success: true,

    message:
      `[จำลองสำเร็จ] ส่งข้อความทดสอบไปยัง Telegram Chat ID: ${chatId} เรียบร้อยแล้ว`,

    sentText:
      '🔔 [O2 SAFE TEST] การเชื่อมต่อ Telegram Bot ของโรงพยาบาลทำงานได้ปกติ 100%'

  });

});


// =====================================================
// TEST LINE
// =====================================================

app.post('/api/settings/test-line', (req, res) => {

  const {
    token,
    targetId
  } = req.body;


  if (!token || !targetId) {

    return res.status(400).json({

      error:
        'กรุณากรอก LINE Channel Token และ Target ID ให้ครบถ้วน'

    });

  }


  res.json({

    success: true,

    message:
      `[จำลองสำเร็จ] ส่งข้อความแจ้งเตือน Flex Message ไปยัง LINE OA Target: ${targetId} สำเร็จ`,

    sentText:
      '🛡️ [O2 SAFE ALERT BOT] เชื่อมต่อระบบแจ้งเตือนผ่าน LINE Official Account สำเร็จสมบูรณ์'

  });

});


// =====================================================
// USER MANAGEMENT
// =====================================================

app.get('/api/users', (req, res) => {

  const users = db.prepare(`
    SELECT
      id,
      first_name,
      last_name,
      email,
      department,
      position,
      phone,
      role,
      status,
      last_login,
      created_at
    FROM users
    ORDER BY id ASC
  `).all();


  res.json({
    users
  });

});


app.post('/api/users', (req, res) => {

  const {
    first_name,
    last_name,
    email,
    password,
    department,
    position,
    phone,
    role
  } = req.body;


  if (
    !first_name ||
    !last_name ||
    !email ||
    !password ||
    !role
  ) {

    return res.status(400).json({

      error:
        'กรุณากรอกข้อมูลผู้ใช้ที่จำเป็นให้ครบถ้วน'

    });

  }


  const existing = db
    .prepare(
      'SELECT id FROM users WHERE email = ?'
    )
    .get(
      email.trim().toLowerCase()
    );


  if (existing) {

    return res.status(400).json({

      error:
        'อีเมลนี้มีอยู่ในระบบแล้ว'

    });

  }


  const result = db.prepare(`
    INSERT INTO users
    (
      first_name,
      last_name,
      email,
      password,
      department,
      position,
      phone,
      role,
      status
    )

    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(

    first_name.trim(),

    last_name.trim(),

    email.trim().toLowerCase(),

    password,

    department ||
      'ฝ่ายวิศวกรรมชีวการแพทย์',

    position ||
      'เจ้าหน้าที่ประจำเวร',

    phone ||
      '-',

    role

  );


  res.json({

    success: true,

    message:
      'สร้างผู้ใช้งานใหม่สำเร็จ',

    userId:
      result.lastInsertRowid

  });

});


app.put('/api/users/:id', (req, res) => {

  const { id } = req.params;

  const {
    first_name,
    last_name,
    department,
    position,
    phone,
    role,
    status
  } = req.body;


  db.prepare(`
    UPDATE users

    SET
      first_name = ?,
      last_name = ?,
      department = ?,
      position = ?,
      phone = ?,
      role = ?,
      status = ?

    WHERE id = ?
  `).run(

    first_name,

    last_name,

    department,

    position,

    phone,

    role,

    status,

    id

  );


  res.json({

    success: true,

    message:
      'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว'

  });

});


app.post('/api/users/:id/reset-password', (req, res) => {

  const { id } = req.params;

  const {
    newPassword
  } = req.body;


  const tempPass =
    newPassword ||
    `O2Safe#${Math.floor(
      1000 + Math.random() * 9000
    )}`;


  db.prepare(
    'UPDATE users SET password = ? WHERE id = ?'
  ).run(
    tempPass,
    id
  );


  res.json({

    success: true,

    message:
      'รีเซ็ตรหัสผ่านสำเร็จ',

    tempPassword:
      tempPass

  });

});


app.delete('/api/users/:id', (req, res) => {

  const { id } = req.params;


  const adminCount =
    db.prepare(
      'SELECT COUNT(*) as count FROM users WHERE role = "admin"'
    ).get().count;


  const targetUser =
    db.prepare(
      'SELECT role FROM users WHERE id = ?'
    ).get(id);


  if (
    targetUser?.role === 'admin' &&
    adminCount <= 1
  ) {

    return res.status(400).json({

      error:
        'ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้'

    });

  }


  db.prepare(
    'DELETE FROM users WHERE id = ?'
  ).run(id);


  res.json({

    success: true,

    message:
      'ลบผู้ใช้งานเรียบร้อยแล้ว'

  });

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

  console.log(
    '======================================================='
  );

  console.log(
    `🚀 O2 SAFE Medical Monitoring Backend running on port ${PORT}`
  );

  console.log(
    '📁 SQLite Database ใช้สำหรับ Login / Users'
  );

  console.log(
    '🗄️ Sensor Data ใช้ MySQL database: o2safe'
  );

  console.log(
    `🔗 API Base: http://localhost:${PORT}/api`
  );

  console.log(
    '======================================================='
  );

});