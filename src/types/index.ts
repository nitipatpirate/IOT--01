export type UserRole = 'admin' | 'engineer' | 'operator' | 'viewer';
export type UserStatus = 'active' | 'suspended';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  department: string;
  position: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  last_login?: string;
  created_at?: string;
}

export type StatusLevel = 'normal' | 'warning' | 'danger' | 'notice';

export interface SensorReading {
  o2_level: number;
  temperature: number;
  humidity: number;
  status: StatusLevel;
  timestamp: string;
}

export interface Sensor {
  id: number;
  sensor_code: string;
  name: string;
  location: string;
  hardware_id: string;
  gpio_pin?: string;
  i2c_address?: string;
  calibration_offset: number;
  is_enabled: number;
  status: 'online' | 'offline';
  last_calibration?: string;
  currentReading?: SensorReading;
  sparkline?: number[];
}

export interface Alert {
  id: number;
  alert_code: string;
  sensor_code: string;
  sensor_name: string;
  metric: string;
  value: number;
  threshold_exceeded: string;
  severity: 'danger' | 'warning' | 'notice';
  message: string;
  telegram_sent: number;
  line_sent: number;
  status: 'pending' | 'acknowledged' | 'resolved';
  acknowledged_by?: string;
  acknowledged_at?: string;
  timestamp: string;
}

export interface Threshold {
  id: number;
  metric: 'o2' | 'temperature' | 'humidity';
  normal_min: number;
  normal_max: number;
  elevated_min: number;
  elevated_max: number;
  warning_min: number;
  warning_max: number;
  danger_low: number;
  danger_high: number;
}

export interface SystemSettings {
  id?: number;
  system_title: string;
  hospital_name: string;
  department: string;
  language: string;
  sampling_interval: number;
  telegram_token?: string;
  telegram_chat_id?: string;
  line_token?: string;
  line_target_id?: string;
  enable_line_flex: number;
}
