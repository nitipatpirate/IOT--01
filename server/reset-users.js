import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./data/o2safe.db');

console.log('กำลังลบบัญชีผู้ใช้เดิม...');

db.exec(`
  DELETE FROM users;
`);

console.log('ลบบัญชีเดิมเรียบร้อยแล้ว');

const insertUser = db.prepare(`
  INSERT INTO users (
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
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertUser.run(
  'Admin',
  '1',
  'admin1@o2safe.com',
  'admin123',
  'ฝ่ายบริหารระบบ',
  'ผู้ดูแลระบบ',
  '000-000-0001',
  'admin',
  'active'
);

insertUser.run(
  'Admin',
  '2',
  'admin2@o2safe.com',
  'admin123',
  'ฝ่ายบริหารระบบ',
  'ผู้ดูแลระบบ',
  '000-000-0002',
  'admin',
  'active'
);

insertUser.run(
  'Viewer',
  '1',
  'viewer1@o2safe.com',
  'viewer123',
  'ฝ่ายตรวจสอบ',
  'ผู้ตรวจสอบระบบ',
  '000-000-0003',
  'viewer',
  'active'
);

console.log('สร้างบัญชีใหม่เรียบร้อยแล้ว');

const users = db.prepare(`
  SELECT id, first_name, last_name, email, role, status
  FROM users
`).all();

console.table(users);

db.close();