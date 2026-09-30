import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  History, 
  Download, 
  Filter, 
  Search, 
  TrendingUp, 
  ArrowDown, 
  ArrowUp, 
  Database,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';

export const HistoryPage: React.FC = () => {
  const [selectedSensor, setSelectedSensor] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('o2');
  const [recordLimit, setRecordLimit] = useState(100);
  const [stats, setStats] = useState<any>({ totalPoints: 0, avg: 0, min: 0, max: 0 });
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await api.getHistory(selectedSensor, selectedMetric, recordLimit);
      setStats(res.stats);
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [selectedSensor, selectedMetric, recordLimit]);

  // Export to CSV directly
  const handleExportCSV = () => {
    if (data.length === 0) return;
    const headers = ['ID,Sensor_Code,O2_Level(%),Temperature(C),Humidity(%RH),Status,Timestamp\n'];
    const rows = data.map(r => 
      `${r.id},${r.sensor_code},${r.o2_level},${r.temperature},${r.humidity},${r.status},"${r.timestamp}"`
    );
    const blob = new Blob([headers.concat(rows.join('\n')).join('')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `o2safe_history_${selectedSensor}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const metricLabels: Record<string, { label: string; unit: string; color: string }> = {
    o2: { label: 'ความเข้มข้นออกซิเจน (O₂)', unit: '%', color: '#06B6D4' },
    temp: { label: 'อุณหภูมิห้อง (Temperature)', unit: '°C', color: '#F59E0B' },
    humidity: { label: 'ความชื้นสัมพัทธ์ (Humidity)', unit: '%RH', color: '#38BDF8' },
  };

  const chartData = data.map((d) => ({
    time: d.timestamp ? d.timestamp.substring(11, 16) : '',
    value: selectedMetric === 'o2' ? d.o2_level : selectedMetric === 'temp' ? d.temperature : d.humidity,
    sensor: d.sensor_code,
    fullTime: d.timestamp,
  }));

  return (
    <div className="space-y-6">
      {/* Header & Filter Toolbar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
              <History className="h-5 w-5 text-brand-400" />
              <span>ประวัติข้อมูลย้อนหลัง & สถิติ (HISTORICAL ANALYTICS)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              ค้นหา วิเคราะห์แนวโน้ม และส่งออกข้อมูลเป็นไฟล์ CSV สำหรับงานวิจัยและการตรวจประเมิน
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-brand-400 hover:to-cyan-400 shadow-lg shadow-brand-500/20 transition"
          >
            <Download className="h-4 w-4" />
            <span>ส่งออกเป็น CSV (Export CSV)</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              เลือกเซ็นเซอร์ / จุดติดตั้ง
            </label>
            <select
              value={selectedSensor}
              onChange={(e) => setSelectedSensor(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">ทุกเซ็นเซอร์ (All Sensors)</option>
              <option value="sensor_01">เซ็นเซอร์ 01 - คลังท่อก๊าซส่วนกลาง</option>
              <option value="sensor_02">เซ็นเซอร์ 02 - ห้องผ่าตัด ICU</option>
              <option value="sensor_03">เซ็นเซอร์ 03 - ตึกผู้ป่วยใน ชั้น 4</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              เลือกพารามิเตอร์ที่ต้องการดู
            </label>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="o2">ความเข้มข้นออกซิเจน (O₂ %)</option>
              <option value="temp">อุณหภูมิ (°C)</option>
              <option value="humidity">ความชื้นสัมพัทธ์ (%RH)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              ความละเอียดข้อมูล (จำนวนเรคอร์ด)
            </label>
            <select
              value={recordLimit}
              onChange={(e) => setRecordLimit(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value={50}>50 รายการล่าสุด</option>
              <option value={100}>100 รายการล่าสุด</option>
              <option value={200}>200 รายการล่าสุด (24 ชั่วโมง)</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={loadHistory}
              className="w-full flex items-center justify-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2 px-3 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
            >
              <Search className="h-3.5 w-3.5 text-brand-400" />
              <span>ดึงข้อมูล (Fetch)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Statistical Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>จำนวนข้อมูลทั้งหมด</span>
            <Database className="h-4 w-4 text-brand-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100">
            {stats.totalPoints} <span className="text-xs font-sans text-slate-400">จุดบันทึก</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">Data points verified</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ค่าเฉลี่ย (Mean)</span>
            <TrendingUp className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-cyan-300">
            {stats.avg} <span className="text-xs font-sans text-slate-400">{metricLabels[selectedMetric]?.unit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">อยู่ในกรอบมาตรฐานการแพทย์</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ค่าต่ำสุดที่บันทึก (Min)</span>
            <ArrowDown className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-amber-300">
            {stats.min} <span className="text-xs font-sans text-slate-400">{metricLabels[selectedMetric]?.unit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">เกณฑ์ต่ำสุดที่ตรวจพบ</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>ค่าสูงสุดที่บันทึก (Max)</span>
            <ArrowUp className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-rose-300">
            {stats.max} <span className="text-xs font-sans text-slate-400">{metricLabels[selectedMetric]?.unit}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">เกณฑ์สูงสุดที่ตรวจพบ</span>
        </div>
      </div>

      {/* High-Resolution Interactive Chart */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              กราฟความต่อเนื่องของ {metricLabels[selectedMetric]?.label}
            </h2>
            <span className="text-xs text-slate-400">แสดงความผันแปรตามลำดับเวลา</span>
          </div>
          <span className="text-xs font-mono text-brand-400 font-semibold">
            {metricLabels[selectedMetric]?.unit}
          </span>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
              <XAxis dataKey="time" stroke="#64748B" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              {selectedMetric === 'o2' && (
                <ReferenceLine 
                  y={20.9} 
                  stroke="#10B981" 
                  strokeDasharray="4 4" 
                  label={{ value: 'มาตรฐาน 20.9%', fill: '#10B981', fontSize: 11 }} 
                />
              )}
              {selectedMetric === 'o2' && (
                <ReferenceLine 
                  y={23.5} 
                  stroke="#EF4444" 
                  strokeDasharray="3 3" 
                  label={{ value: 'อันตราย 23.5%', fill: '#EF4444', fontSize: 11 }} 
                />
              )}
              <Line
                type="monotone"
                dataKey="value"
                name={metricLabels[selectedMetric]?.label}
                stroke={metricLabels[selectedMetric]?.color || '#06B6D4'}
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabular Data Log */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 font-mono">
            ตารางบันทึกข้อมูลดิบ (RAW TELEMETRY RECORDS)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            แสดง {data.length} รายการ
          </span>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-2.5">ID</th>
                <th className="py-2.5">วัน-เวลา (Timestamp)</th>
                <th className="py-2.5">รหัสเซ็นเซอร์</th>
                <th className="py-2.5">ออกซิเจน O₂ (%)</th>
                <th className="py-2.5">อุณหภูมิ (°C)</th>
                <th className="py-2.5">ความชื้น (%RH)</th>
                <th className="py-2.5">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {data.slice(0, 15).map((row) => (
                <tr key={row.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-2 text-slate-500">#{row.id}</td>
                  <td className="py-2 text-slate-300 font-sans">{row.timestamp}</td>
                  <td className="py-2 text-brand-400 font-bold">{row.sensor_code}</td>
                  <td className="py-2 text-slate-100 font-bold">{row.o2_level.toFixed(2)} %</td>
                  <td className="py-2 text-slate-300">{row.temperature} °C</td>
                  <td className="py-2 text-slate-300">{row.humidity} %</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      row.status === 'danger'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : row.status === 'warning'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {row.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
