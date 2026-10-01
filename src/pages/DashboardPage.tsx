import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sensor, Alert, Threshold } from '../types';
import { KPICard } from '../components/KPICard';
import { O2Gauge } from '../components/O2Gauge';
import {
  ShieldCheck,
  Cpu,
  BellRing,
  CloudSun,
  Thermometer,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine
} from 'recharts';

interface DashboardPageProps {
  onNavigateToRealtime?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateToRealtime }) => {
  const [data, setData] = useState<{
    kpis: any;
    sensors: Sensor[];
    trendData: any[];
    recentAlerts: Alert[];
    thresholds: Threshold[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // Poll every 5 seconds
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: number) => {
    try {
      await api.acknowledgeAlert(id, 'ผู้ดูแลระบบ (Admin)');
      fetchDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="flex h-96 items-center justify-center space-x-3 text-slate-400">
        <RefreshCw className="h-6 w-6 animate-spin text-brand-400" />
        <span className="text-sm">กำลังโหลดข้อมูลแดชบอร์ด O2 SAFE...</span>
      </div>
    );
  }

  const { kpis, sensors, trendData, recentAlerts, thresholds } = data;

  const o2Threshold = thresholds.find(t => t.metric === 'o2');

  return (
    <div className="space-y-6">
      {/* Header with Title & Quick Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-100 font-mono tracking-tight flex items-center space-x-2">
            <span>ภาพรวมการตรวจวัด (SYSTEM DASHBOARD)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            สรุปสถานะความเข้มข้นออกซิเจนและสิ่งแวดล้อม 3 จุดตรวจวัดสำคัญ
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchDashboard();
            }}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 hover:border-slate-700 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-brand-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>รีเฟรชข้อมูล</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="สถานะระบบรวม"
          value={kpis.systemHealth === 'danger' ? 'อันตราย' : kpis.systemHealth === 'warning' ? 'เฝ้าระวัง' : 'สภาวะปกติ'}
          subtitle="ตรวจวัดอัตโนมัติ 24 ชม."
          icon={<ShieldCheck className="h-5 w-5" />}
          badge={{
            text: kpis.systemHealth === 'danger' ? 'O2 LEAK ALERT' : kpis.systemHealth === 'warning' ? 'ELEVATED' : '100% OPERATIONAL',
            type: kpis.systemHealth === 'danger' ? 'danger' : kpis.systemHealth === 'warning' ? 'warning' : 'success',
          }}
        />

        <KPICard
          title="เซ็นเซอร์ออนไลน์"
          value={`${kpis.onlineSensors} / ${kpis.totalSensors} ตัว`}
          subtitle="Raspberry Pi Node Hub"
          icon={<Cpu className="h-5 w-5" />}
          badge={{
            text: kpis.onlineSensors === kpis.totalSensors ? 'ALL ONLINE' : 'CHECK NODE',
            type: kpis.onlineSensors === kpis.totalSensors ? 'success' : 'warning',
          }}
        />

        <KPICard
          title="แจ้งเตือนที่ยังค้าง"
          value={`${kpis.activeAlerts} รายการ`}
          subtitle="Telegram & LINE OA"
          icon={<BellRing className="h-5 w-5" />}
          badge={{
            text: kpis.activeAlerts === 0 ? 'ZERO PENDING' : `${kpis.activeAlerts} UNRESOLVED`,
            type: kpis.activeAlerts === 0 ? 'success' : 'danger',
          }}
        />

        <KPICard
          title="สภาพแวดล้อมเฉลี่ย"
          value={`${kpis.avgTemp} °C / ${kpis.avgHum}%`}
          subtitle="อุณหภูมิและความชื้นสัมพัทธ์"
          icon={<CloudSun className="h-5 w-5" />}
          badge={{
            text: 'OPTIMAL ROOM',
            type: 'info',
          }}
        />
      </div>

      {/* 3 Sensor Station Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {sensors.map((sensor) => {
          const reading = sensor.currentReading || {
            temperature: 0,
            humidity: 0,
            status: 'normal'
          };
          const isDanger = reading.status === 'danger';
          const isWarning = reading.status === 'warning';

          return (
            <div
              key={sensor.sensor_code}
              className={`relative overflow-hidden rounded-2xl border p-5 transition-all shadow-xl ${isDanger
                ? 'border-rose-500/50 bg-rose-950/20 shadow-rose-950/50'
                : isWarning
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-slate-800 bg-slate-900/80 hover:border-slate-700'
                }`}
            >

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-100 font-mono">
                      {sensor.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[220px]">
                    {sensor.location}
                  </div>
                </div>

                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold border ${isDanger
                  ? 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                  : isWarning
                    ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                    : 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300'
                  }`}>
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${isDanger ? 'bg-rose-400 pulse-beacon' : isWarning ? 'bg-amber-400' : 'bg-emerald-400'
                    }`} />
                  {isDanger ? 'รั่วไหล' : isWarning ? 'เฝ้าระวัง' : 'ปกติ'}
                </span>
              </div>

              {/* Radial O2 Gauge in Center */}
              <div className="my-3 flex justify-center">
                <O2Gauge value={reading.o2_level} size="md" />
              </div>

              {/* Temp & Humidity Mini Chips */}
              <div className="grid grid-cols-2 gap-2 border-t border-slate-800/80 pt-3 text-xs">
                <div className="flex items-center space-x-2 rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                  <Thermometer className="h-4 w-4 text-amber-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">อุณหภูมิ</span>
                    <span className="font-mono font-bold text-slate-200">{reading.temperature} °C</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 rounded-lg bg-slate-950/60 p-2 border border-slate-800/60">
                  <Droplets className="h-4 w-4 text-cyan-400" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">ความชื้น</span>
                    <span className="font-mono font-bold text-slate-200">{reading.humidity} %RH</span>
                  </div>
                </div>
              </div>

              {/* Node ID & Details button */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-mono">Node: {sensor.hardware_id}</span>
                {onNavigateToRealtime && (
                  <button
                    onClick={onNavigateToRealtime}
                    className="flex items-center space-x-1 text-brand-400 hover:text-brand-300 transition"
                  >
                    <span>ดูข้อมูลสด</span>
                    <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 24-Hour Environment Trend Graph */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-2">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <span>
                กราฟแนวโน้มอุณหภูมิและความชื้น 24 ชั่วโมง
              </span>
            </h2>

            <p className="text-xs text-slate-400">
              แสดงข้อมูลอุณหภูมิและความชื้นจากเซ็นเซอร์ SN-300 จากข้อมูลจริงในระบบ
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-4 rounded-full bg-amber-400" />
              <span className="text-slate-300">
                อุณหภูมิ (°C)
              </span>
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="h-2 w-4 rounded-full bg-cyan-400" />
              <span className="text-slate-300">
                ความชื้น (%RH)
              </span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{
                top: 10,
                right: 20,
                left: 0,
                bottom: 0
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E293B"
                vertical={false}
              />

              <YAxis
                yAxisId="temperature"
                stroke="#F59E0B"
                fontSize={11}
                tickLine={false}
                unit="°C"
              />

              <YAxis
                yAxisId="humidity"
                orientation="right"
                stroke="#06B6D4"
                fontSize={11}
                tickLine={false}
                unit="%"
              />

              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px'
                }}
              />

              <Line
                yAxisId="temperature"
                type="monotone"
                dataKey="temperature"
                name="อุณหภูมิ"
                stroke="#F59E0B"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />

              <Line
                yAxisId="humidity"
                type="monotone"
                dataKey="humidity"
                name="ความชื้น"
                stroke="#06B6D4"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Bottom Row: Recent Alerts Feed & Threshold Reference Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Alerts Feed */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <BellRing className="h-4 w-4 text-rose-400" />
              <span>รายการแจ้งเตือนล่าสุด (RECENT ALERTS)</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              Telegram / LINE OA
            </span>
          </div>

          <div className="mt-3 space-y-2.5">
            {recentAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                ไม่มีประวัติการแจ้งเตือนที่ผิดปกติในขณะนี้
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 text-xs hover:border-slate-700/80 transition"
                >
                  <div className="flex items-start space-x-3">
                    <span className={`mt-0.5 flex h-2 w-2 rounded-full ${alert.severity === 'danger' ? 'bg-rose-400 pulse-beacon' : 'bg-amber-400'
                      }`} />
                    <div>
                      <div className="font-semibold text-slate-200">
                        {alert.sensor_name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {alert.message}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1 flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{alert.timestamp}</span>
                        <span>•</span>
                        <span className={alert.status === 'acknowledged' ? 'text-emerald-400' : 'text-amber-400'}>
                          {alert.status === 'acknowledged' ? 'รับทราบแล้ว' : 'รอดำเนินการ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
                    <button
                      onClick={() => handleAcknowledge(alert.id)}
                      className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-700 transition"
                    >
                      รับทราบ
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Threshold Quick Reference Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>ตารางเกณฑ์ความปลอดภัยที่กำหนด (THRESHOLDS)</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">มาตรฐาน รพ.</span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-2">พารามิเตอร์</th>
                  <th className="py-2">ปกติ (Safe)</th>
                  <th className="py-2">เฝ้าระวัง (Warn)</th>
                  <th className="py-2">อันตราย (Danger)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-200">
                    ความเข้มข้น O₂
                  </td>
                  <td className="py-2.5 text-emerald-400">20.0% – 22.0%</td>
                  <td className="py-2.5 text-amber-400">&lt;19.5% / &gt;23.0%</td>
                  <td className="py-2.5 text-rose-400 font-bold">&gt;23.5% / &lt;18.0%</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-200">
                    อุณหภูมิห้อง
                  </td>
                  <td className="py-2.5 text-emerald-400">20.0°C – 25.0°C</td>
                  <td className="py-2.5 text-amber-400">25.1°C – 28.0°C</td>
                  <td className="py-2.5 text-rose-400 font-bold">&gt;28.0°C</td>
                </tr>
                <tr>
                  <td className="py-2.5 font-sans font-medium text-slate-200">
                    ความชื้นสัมพัทธ์
                  </td>
                  <td className="py-2.5 text-emerald-400">40.0% – 60.0%</td>
                  <td className="py-2.5 text-amber-400">60.1% – 70.0%</td>
                  <td className="py-2.5 text-rose-400 font-bold">&gt;70.0% RH</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 rounded-xl bg-slate-950/60 p-3 border border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
            💡 <strong>หมายเหตุความปลอดภัย:</strong> เมื่อค่า O₂ สูงเกิน 23.5% จะทำให้วัสดุรอบข้างติดไฟได้ง่ายและรุนแรงขึ้นผิดปกติ ระบบจะส่งสัญญาณเข้า Telegram Bot และ LINE OA ของทีมวิศวกรรมทันที
          </div>
        </div>
      </div>
    </div>
  );
};
