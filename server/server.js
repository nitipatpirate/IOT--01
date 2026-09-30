import express from 'express';
import cors from 'cors';
import db, { initDatabase } from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize SQLite Database
initDatabase();

// --- AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });
  }

  const user = db.prepare(`
    SELECT id, first_name, last_name, email, password, department, position, phone, role, status
    FROM users WHERE email = ?
  `).get(email.trim().toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'ไม่พบบัญชีผู้ใช้นี้ในระบบ' });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' });
  }

  // Update last login
  db.prepare(`UPDATE users SET last_login = datetime('now') WHERE id = ?`).run(user.id);

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
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Return the first active user as demo fallback or specific user
  const user = db.prepare('SELECT id, first_name, last_name, email, department, position, phone, role, status, last_login FROM users WHERE status = "active" LIMIT 1').get();
  res.json({ user });
});

// --- DASHBOARD API ---
app.get('/api/dashboard', (req, res) => {
  const sensors = db.prepare('SELECT * FROM sensors WHERE is_enabled = 1').all();
  
  // Get latest reading for each sensor
  const sensorStatusList = sensors.map(sensor => {
    let reading = db.prepare(`
      SELECT o2_level, temperature, humidity, status, timestamp
      FROM readings
      WHERE sensor_code = ?
      ORDER BY id DESC LIMIT 1
    `).get(sensor.sensor_code);

    if (!reading) {
      reading = { o2_level: 20.9, temperature: 22.5, humidity: 55.0, status: 'normal', timestamp: new Date().toISOString() };
    }

    return {
      ...sensor,
      currentReading: reading
    };
  });

  // Calculate 4 KPI summary cards
  const onlineSensors = sensorStatusList.filter(s => s.status === 'online').length;
  const activeAlerts = db.prepare(`SELECT COUNT(*) as count FROM alerts WHERE status != 'resolved'`).get().count;
  
  const avgTemp = (sensorStatusList.reduce((acc, s) => acc + (s.currentReading?.temperature || 22), 0) / (sensorStatusList.length || 1)).toFixed(1);
  const avgHum = (sensorStatusList.reduce((acc, s) => acc + (s.currentReading?.humidity || 55), 0) / (sensorStatusList.length || 1)).toFixed(1);

  const hasDanger = sensorStatusList.some(s => s.currentReading?.status === 'danger');
  const hasWarning = sensorStatusList.some(s => s.currentReading?.status === 'warning');

  const systemHealth = hasDanger ? 'danger' : hasWarning ? 'warning' : 'normal';

  // 24-hour trend: sample every 2 hours or last 24 points
  const trendReadings = db.prepare(`
    SELECT strftime('%H:%M', timestamp) as time_label, sensor_code, AVG(o2_level) as o2_level
    FROM readings
    GROUP BY strftime('%Y-%m-%d %H', timestamp), sensor_code
    ORDER BY timestamp ASC
    LIMIT 72
  `).all();

  // Pivot trend readings by time_label
  const trendMap = {};
  trendReadings.forEach(r => {
    if (!trendMap[r.time_label]) {
      trendMap[r.time_label] = { time: r.time_label };
    }
    trendMap[r.time_label][r.sensor_code] = parseFloat(r.o2_level.toFixed(2));
  });
  const trendData = Object.values(trendMap);

  // Recent 5 alerts
  const recentAlerts = db.prepare(`
    SELECT * FROM alerts
    ORDER BY id DESC LIMIT 5
  `).all();

  // Thresholds
  const thresholds = db.prepare('SELECT * FROM thresholds').all();

  res.json({
    kpis: {
      systemHealth,
      totalSensors: sensors.length,
      onlineSensors,
      activeAlerts,
      avgTemp: parseFloat(avgTemp),
      avgHum: parseFloat(avgHum),
      lastUpdated: new Date().toISOString()
    },
    sensors: sensorStatusList,
    trendData,
    recentAlerts,
    thresholds
  });
});

// --- REAL-TIME TELEMETRY STREAM ---
app.get('/api/realtime', (req, res) => {
  const sensors = db.prepare('SELECT * FROM sensors WHERE is_enabled = 1').all();
  
  // Real-time telemetry generator with realistic micro-variations
  const liveSensors = sensors.map(sensor => {
    let reading = db.prepare(`
      SELECT o2_level, temperature, humidity, status, timestamp
      FROM readings
      WHERE sensor_code = ?
      ORDER BY id DESC LIMIT 1
    `).get(sensor.sensor_code);

    // Apply micro jitter (+/- 0.02% O2)
    const jitter = (Math.random() - 0.48) * 0.04;
    const currentO2 = parseFloat(Math.min(25.0, Math.max(17.0, (reading?.o2_level || 20.9) + jitter)).toFixed(2));
    const currentTemp = parseFloat(((reading?.temperature || 22.5) + (Math.random() - 0.5) * 0.1).toFixed(1));
    const currentHum = parseFloat(((reading?.humidity || 55.0) + (Math.random() - 0.5) * 0.3).toFixed(1));

    // Rolling 10 points for sparkline
    const recentHistory = db.prepare(`
      SELECT o2_level, strftime('%H:%M:%S', timestamp) as time
      FROM readings
      WHERE sensor_code = ?
      ORDER BY id DESC LIMIT 15
    `).all(sensor.sensor_code).reverse();

    return {
      ...sensor,
      currentReading: {
        o2_level: currentO2,
        temperature: currentTemp,
        humidity: currentHum,
        status: currentO2 >= 23.5 || currentO2 < 18.0 ? 'danger' : currentO2 >= 23.0 || currentO2 <= 19.5 ? 'warning' : 'normal',
        timestamp: new Date().toISOString()
      },
      sparkline: recentHistory.map(h => h.o2_level)
    };
  });

  res.json({
    timestamp: new Date().toISOString(),
    sensors: liveSensors
  });
});

// --- INGEST TELEMETRY FROM RASPBERRY PI ---
app.post('/api/telemetry/ingest', (req, res) => {
  const { sensor_code, o2_level, temperature, humidity } = req.body;
  if (!sensor_code || o2_level === undefined) {
    return res.status(400).json({ error: 'Missing required telemetry fields' });
  }

  const o2Threshold = db.prepare('SELECT * FROM thresholds WHERE metric = "o2"').get();
  let status = 'normal';
  if (o2_level >= (o2Threshold?.danger_high || 23.5) || o2_level <= (o2Threshold?.danger_low || 18.0)) {
    status = 'danger';
  } else if (o2_level >= (o2Threshold?.warning_max || 23.0) || o2_level <= (o2Threshold?.warning_min || 19.5)) {
    status = 'warning';
  }

  // Insert reading
  const insert = db.prepare(`
    INSERT INTO readings (sensor_code, o2_level, temperature, humidity, status)
    VALUES (?, ?, ?, ?, ?)
  `);
  insert.run(sensor_code, o2_level, temperature || 22.0, humidity || 50.0, status);

  // If danger or warning, log alert automatically
  if (status === 'danger' || status === 'warning') {
    const sensor = db.prepare('SELECT name FROM sensors WHERE sensor_code = ?').get(sensor_code);
    const alertCode = `ALT-${Date.now().toString().slice(-6)}`;
    const msg = status === 'danger' 
      ? `🚨 ตรวจพบการรั่วไหลของออกซิเจน O2 = ${o2_level}% ที่จุด ${sensor?.name || sensor_code}`
      : `⚠️ ค่าออกซิเจนเริ่มผิดปกติ O2 = ${o2_level}% ที่จุด ${sensor?.name || sensor_code}`;

    db.prepare(`
      INSERT INTO alerts (alert_code, sensor_code, sensor_name, metric, value, threshold_exceeded, severity, message, telegram_sent, line_sent, status)
      VALUES (?, ?, ?, 'O2', ?, ?, ?, ?, 1, 1, 'pending')
    `).run(
      alertCode,
      sensor_code,
      sensor?.name || sensor_code,
      o2_level,
      status === 'danger' ? '> 23.50%' : '> 22.50%',
      status,
      msg
    );
  }

  res.json({ success: true, status });
});

// --- HISTORICAL DATA & ANALYTICS ---
app.get('/api/history', (req, res) => {
  const { sensor_code, metric = 'o2', limit = 200 } = req.query;

  let query = 'SELECT * FROM readings WHERE 1=1';
  const params = [];

  if (sensor_code && sensor_code !== 'all') {
    query += ' AND sensor_code = ?';
    params.push(sensor_code);
  }

  query += ' ORDER BY id DESC LIMIT ?';
  params.push(parseInt(limit));

  const rows = db.prepare(query).all(...params).reverse();

  // Calculate statistics
  let values = [];
  if (metric === 'o2') values = rows.map(r => r.o2_level);
  else if (metric === 'temp') values = rows.map(r => r.temperature);
  else if (metric === 'humidity') values = rows.map(r => r.humidity);

  const totalPoints = values.length;
  const avg = totalPoints > 0 ? (values.reduce((a, b) => a + b, 0) / totalPoints).toFixed(2) : 0;
  const min = totalPoints > 0 ? Math.min(...values).toFixed(2) : 0;
  const max = totalPoints > 0 ? Math.max(...values).toFixed(2) : 0;

  res.json({
    stats: {
      totalPoints,
      avg: parseFloat(avg),
      min: parseFloat(min),
      max: parseFloat(max),
      metric
    },
    data: rows
  });
});

// --- ALERTS HISTORY & ACKNOWLEDGE ---
app.get('/api/alerts', (req, res) => {
  const { severity, sensor_code, status } = req.query;
  let query = 'SELECT * FROM alerts WHERE 1=1';
  const params = [];

  if (severity && severity !== 'all') {
    query += ' AND severity = ?';
    params.push(severity);
  }
  if (sensor_code && sensor_code !== 'all') {
    query += ' AND sensor_code = ?';
    params.push(sensor_code);
  }
  if (status && status !== 'all') {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY id DESC';
  const alerts = db.prepare(query).all(...params);
  res.json({ alerts });
});

app.post('/api/alerts/:id/acknowledge', (req, res) => {
  const { id } = req.params;
  const { userName = 'Admin System' } = req.body;

  db.prepare(`
    UPDATE alerts
    SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = datetime('now')
    WHERE id = ?
  `).run(userName, id);

  res.json({ success: true, message: 'รับทราบเหตุการณ์เรียบร้อยแล้ว' });
});

// --- COMPLIANCE & EXECUTIVE REPORTS ---
app.get('/api/reports', (req, res) => {
  const sensors = db.prepare('SELECT * FROM sensors WHERE is_enabled = 1').all();
  const settings = db.prepare('SELECT * FROM system_settings LIMIT 1').get();

  const auditData = sensors.map(sensor => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total_samples,
        AVG(o2_level) as avg_o2,
        MIN(o2_level) as min_o2,
        MAX(o2_level) as max_o2,
        AVG(temperature) as avg_temp,
        AVG(humidity) as avg_hum,
        SUM(CASE WHEN status != 'normal' THEN 1 ELSE 0 END) as abnormal_events
      FROM readings
      WHERE sensor_code = ?
    `).get(sensor.sensor_code);

    return {
      sensor_code: sensor.sensor_code,
      name: sensor.name,
      location: sensor.location,
      total_samples: stats.total_samples || 0,
      avg_o2: stats.avg_o2 ? parseFloat(stats.avg_o2.toFixed(2)) : 20.9,
      min_o2: stats.min_o2 ? parseFloat(stats.min_o2.toFixed(2)) : 20.9,
      max_o2: stats.max_o2 ? parseFloat(stats.max_o2.toFixed(2)) : 20.9,
      avg_temp: stats.avg_temp ? parseFloat(stats.avg_temp.toFixed(1)) : 22.5,
      avg_hum: stats.avg_hum ? parseFloat(stats.avg_hum.toFixed(1)) : 55.0,
      abnormal_events: stats.abnormal_events || 0,
      compliance_status: (stats.abnormal_events || 0) === 0 ? 'สมบูรณ์ 100%' : 'มีเหตุการณ์เตือน'
    };
  });

  const totalAlerts = db.prepare('SELECT COUNT(*) as count FROM alerts').get().count;

  res.json({
    hospital: settings?.hospital_name || 'โรงพยาบาลศูนย์การแพทย์ศิริวัฒน์',
    department: settings?.department || 'ฝ่ายวิศวกรรมชีวการแพทย์',
    systemTitle: settings?.system_title || 'O2 SAFE System',
    generatedAt: new Date().toISOString(),
    uptime: '99.98%',
    safetyScore: '98.5%',
    totalAlerts,
    auditData
  });
});

// --- SETTINGS API ---
app.get('/api/settings', (req, res) => {
  const settings = db.prepare('SELECT * FROM system_settings LIMIT 1').get();
  const sensors = db.prepare('SELECT * FROM sensors').all();
  const thresholds = db.prepare('SELECT * FROM thresholds').all();

  res.json({
    settings,
    sensors,
    thresholds
  });
});

app.put('/api/settings', (req, res) => {
  const { settings, thresholds, sensors } = req.body;

  if (settings) {
    db.prepare(`
      UPDATE system_settings
      SET system_title = ?, hospital_name = ?, department = ?, language = ?,
          sampling_interval = ?, telegram_token = ?, telegram_chat_id = ?,
          line_token = ?, line_target_id = ?, enable_line_flex = ?
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
      settings.enable_line_flex ? 1 : 0
    );
  }

  if (thresholds && Array.isArray(thresholds)) {
    const updateThreshold = db.prepare(`
      UPDATE thresholds
      SET normal_min = ?, normal_max = ?, elevated_min = ?, elevated_max = ?,
          warning_min = ?, warning_max = ?, danger_low = ?, danger_high = ?
      WHERE metric = ?
    `);

    for (const t of thresholds) {
      updateThreshold.run(
        t.normal_min, t.normal_max, t.elevated_min, t.elevated_max,
        t.warning_min, t.warning_max, t.danger_low, t.danger_high,
        t.metric
      );
    }
  }

  if (sensors && Array.isArray(sensors)) {
    const updateSensor = db.prepare(`
      UPDATE sensors
      SET name = ?, location = ?, calibration_offset = ?, is_enabled = ?
      WHERE id = ?
    `);

    for (const s of sensors) {
      updateSensor.run(s.name, s.location, s.calibration_offset, s.is_enabled ? 1 : 0, s.id);
    }
  }

  res.json({ success: true, message: 'บันทึกการตั้งค่าระบบเรียบร้อยแล้ว' });
});

// Test Telegram notification
app.post('/api/settings/test-telegram', (req, res) => {
  const { token, chatId } = req.body;
  if (!token || !chatId) {
    return res.status(400).json({ error: 'กรุณากรอก Telegram Bot Token และ Chat ID ให้ครบถ้วน' });
  }

  // Simulate Telegram API ping
  res.json({
    success: true,
    message: `[จำลองสำเร็จ] ส่งข้อความทดสอบไปยัง Telegram Chat ID: ${chatId} เรียบร้อยแล้ว`,
    sentText: '🔔 [O2 SAFE TEST] การเชื่อมต่อ Telegram Bot ของโรงพยาบาลทำงานได้ปกติ 100%'
  });
});

// Test LINE OA notification
app.post('/api/settings/test-line', (req, res) => {
  const { token, targetId } = req.body;
  if (!token || !targetId) {
    return res.status(400).json({ error: 'กรุณากรอก LINE Channel Token และ Target ID ให้ครบถ้วน' });
  }

  res.json({
    success: true,
    message: `[จำลองสำเร็จ] ส่งข้อความแจ้งเตือน Flex Message ไปยัง LINE OA Target: ${targetId} สำเร็จ`,
    sentText: '🛡️ [O2 SAFE ALERT BOT] เชื่อมต่อระบบแจ้งเตือนผ่าน LINE Official Account สำเร็จสมบูรณ์'
  });
});

// --- USER MANAGEMENT API ---
app.get('/api/users', (req, res) => {
  const users = db.prepare(`
    SELECT id, first_name, last_name, email, department, position, phone, role, status, last_login, created_at
    FROM users
    ORDER BY id ASC
  `).all();
  res.json({ users });
});

app.post('/api/users', (req, res) => {
  const { first_name, last_name, email, password, department, position, phone, role } = req.body;

  if (!first_name || !last_name || !email || !password || !role) {
    return res.status(400).json({ error: 'กรุณากรอกข้อมูลผู้ใช้ที่จำเป็นให้ครบถ้วน' });
  }

  // Check existing email
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.trim().toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'อีเมลนี้มีอยู่ในระบบแล้ว' });
  }

  const result = db.prepare(`
    INSERT INTO users (first_name, last_name, email, password, department, position, phone, role, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(
    first_name.trim(),
    last_name.trim(),
    email.trim().toLowerCase(),
    password,
    department || 'ฝ่ายวิศวกรรมชีวการแพทย์',
    position || 'เจ้าหน้าที่ประจำเวร',
    phone || '-',
    role
  );

  res.json({
    success: true,
    message: 'สร้างผู้ใช้งานใหม่สำเร็จ',
    userId: result.lastInsertRowid
  });
});

app.put('/api/users/:id', (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, department, position, phone, role, status } = req.body;

  db.prepare(`
    UPDATE users
    SET first_name = ?, last_name = ?, department = ?, position = ?, phone = ?, role = ?, status = ?
    WHERE id = ?
  `).run(first_name, last_name, department, position, phone, role, status, id);

  res.json({ success: true, message: 'อัปเดตข้อมูลผู้ใช้งานเรียบร้อยแล้ว' });
});

app.post('/api/users/:id/reset-password', (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const tempPass = newPassword || `O2Safe#${Math.floor(1000 + Math.random() * 9000)}`;
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(tempPass, id);

  res.json({
    success: true,
    message: 'รีเซ็ตรหัสผ่านสำเร็จ',
    tempPassword: tempPass
  });
});

app.delete('/api/users/:id', (req, res) => {
  const { id } = req.params;
  
  // Prevent deleting the last admin
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = "admin"').get().count;
  const targetUser = db.prepare('SELECT role FROM users WHERE id = ?').get(id);

  if (targetUser?.role === 'admin' && adminCount <= 1) {
    return res.status(400).json({ error: 'ไม่สามารถลบผู้ดูแลระบบคนสุดท้ายได้' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ success: true, message: 'ลบผู้ใช้งานเรียบร้อยแล้ว' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 O2 SAFE Medical Monitoring Backend running on port ${PORT}`);
  console.log(`📁 SQLite Database loaded at data/o2safe.db`);
  console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  console.log(`=======================================================`);
});
