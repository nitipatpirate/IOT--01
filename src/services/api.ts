import { User, Sensor, Alert, Threshold, SystemSettings } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User; message: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
    return res.json();
  },

  // Dashboard
  async getDashboard(): Promise<{
    kpis: {
      systemHealth: 'normal' | 'warning' | 'danger';
      totalSensors: number;
      onlineSensors: number;
      activeAlerts: number;
      avgTemp: number;
      avgHum: number;
      lastUpdated: string;
    };
    sensors: Sensor[];
    trendData: any[];
    recentAlerts: Alert[];
    thresholds: Threshold[];
  }> {
    const res = await fetch(`${API_BASE}/dashboard`);
    if (!res.ok) throw new Error('Failed to fetch dashboard data');
    return res.json();
  },

  // Real-time
  async getRealtime(): Promise<{ timestamp: string; sensors: Sensor[] }> {
    const res = await fetch(`${API_BASE}/realtime`);
    if (!res.ok) throw new Error('Failed to fetch realtime data');
    return res.json();
  },

  // History
  async getHistory(
    sensorCode: string = 'SN300-01',
    metric: string = 'temp',
    limit: number = 100
  ): Promise<{
    stats: {
      totalPoints: number;
      avg: number;
      min: number;
      max: number;
      metric: string;
    };
    data: any[];
  }> {

    const params = new URLSearchParams({
      sensor_code: sensorCode,
      metric: metric,
      limit: String(limit)
    });

    const res = await fetch(
      `${API_BASE}/history?${params.toString()}`
    );

    if (!res.ok) {
      throw new Error('Failed to fetch history');
    }

    return res.json();
  },

  // Alerts
  async getAlerts(severity: string = 'all', sensorCode: string = 'all', status: string = 'all'): Promise<{ alerts: Alert[] }> {
    const res = await fetch(`${API_BASE}/alerts?severity=${severity}&sensor_code=${sensorCode}&status=${status}`);
    if (!res.ok) throw new Error('Failed to fetch alerts');
    return res.json();
  },

  async acknowledgeAlert(id: number, userName: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/alerts/${id}/acknowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName }),
    });
    if (!res.ok) throw new Error('Failed to acknowledge alert');
    return res.json();
  },

  // Reports
  async getReports(): Promise<{
    hospital: string;
    department: string;
    systemTitle: string;
    generatedAt: string;
    uptime: string;
    safetyScore: string;
    totalAlerts: number;
    auditData: any[];
  }> {
    const res = await fetch(`${API_BASE}/reports`);
    if (!res.ok) throw new Error('Failed to fetch report');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<{
    settings: SystemSettings;
    sensors: Sensor[];
    thresholds: Threshold[];
  }> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(payload: { settings?: SystemSettings; thresholds?: Threshold[]; sensors?: Sensor[] }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save settings');
    return res.json();
  },

  async testTelegram(token: string, chatId: string): Promise<{ success: boolean; message: string; sentText: string }> {
    const res = await fetch(`${API_BASE}/settings/test-telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed Telegram test');
    }
    return res.json();
  },

  async testLine(token: string, targetId: string): Promise<{ success: boolean; message: string; sentText: string }> {
    const res = await fetch(`${API_BASE}/settings/test-line`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, targetId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed LINE test');
    }
    return res.json();
  },

  // Users
  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch(`${API_BASE}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  async createUser(user: Partial<User> & { password?: string }): Promise<{ success: boolean; message: string; userId: number }> {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create user');
    }
    return res.json();
  },

  async updateUser(id: number, user: Partial<User>): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('Failed to update user');
    return res.json();
  },

  async resetPassword(id: number, newPassword?: string): Promise<{ success: boolean; message: string; tempPassword: string }> {
    const res = await fetch(`${API_BASE}/users/${id}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) throw new Error('Failed to reset password');
    return res.json();
  },

  async deleteUser(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete user');
    }
    return res.json();
  },
};
