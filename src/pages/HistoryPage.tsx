import React, { useState, useEffect } from 'react';

import { api } from '../services/api';

import {
  History,
  Download,
  Search,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Database,
} from 'lucide-react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const HistoryPage: React.FC = () => {

  // ใช้เซ็นเซอร์ตัวเดียว
  const selectedSensor = 'SN300-01';

  // ค่าเริ่มต้นเป็นอุณหภูมิ
  const [selectedMetric, setSelectedMetric] = useState('temp');

  const [recordLimit, setRecordLimit] = useState(100);

  const [stats, setStats] = useState<any>({
    totalPoints: 0,
    avg: 0,
    min: 0,
    max: 0
  });

  const [data, setData] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);


  // ==========================================
  // โหลดข้อมูลย้อนหลัง
  // ==========================================
  const loadHistory = async () => {

    setIsLoading(true);

    try {

      const res = await api.getHistory(
        selectedSensor,
        selectedMetric,
        recordLimit
      );

      setStats(res.stats);
      setData(res.data);

    } catch (err) {

      console.error('History Error:', err);

    } finally {

      setIsLoading(false);

    }

  };


  useEffect(() => {

    loadHistory();

  }, [selectedMetric, recordLimit]);


  // ==========================================
  // Export CSV
  // ==========================================
  const handleExportCSV = () => {

    if (data.length === 0) return;

    const headers =
      'ID,Sensor_Code,Temperature(C),Humidity(%RH),Timestamp\n';

    const rows = data.map((r) =>
      `${r.id},${r.sensor_code},${r.temperature},${r.humidity},"${r.timestamp}"`
    );

    const csvContent =
      headers + rows.join('\n');

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;'
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.setAttribute('href', url);

    link.setAttribute(
      'download',
      `SN300-01_history_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };


  // ==========================================
  // ชื่อข้อมูลที่เลือก
  // ==========================================
  const metricLabels: Record<
    string,
    {
      label: string;
      unit: string;
      color: string;
    }
  > = {

    temp: {
      label: 'อุณหภูมิห้อง (Temperature)',
      unit: '°C',
      color: '#F59E0B'
    },

    humidity: {
      label: 'ความชื้นสัมพัทธ์ (Humidity)',
      unit: '%RH',
      color: '#38BDF8'
    }

  };


  // ==========================================
  // เตรียมข้อมูลสำหรับกราฟ
  // ==========================================
  const chartData = data.map((d) => ({
    time: d.timestamp
      ? new Date(d.timestamp).toLocaleTimeString('th-TH', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Bangkok'
      })
      : '',

    value:
      selectedMetric === 'temp'
        ? Number(d.temperature)
        : Number(d.humidity),

    sensor: d.sensor_code,

    fullTime: d.timestamp

  }));


  return (

    <div className="space-y-6">

      {/* ==========================================
          Header
      ========================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">

              <History className="h-5 w-5 text-brand-400" />

              <span>
                ประวัติข้อมูลย้อนหลัง & สถิติ (HISTORICAL ANALYTICS)
              </span>

            </h1>

            <p className="text-xs text-slate-400 mt-1">

              วิเคราะห์ข้อมูลอุณหภูมิและความชื้นย้อนหลังจากเซ็นเซอร์ SN-300

            </p>

          </div>


          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-brand-400 hover:to-cyan-400 shadow-lg shadow-brand-500/20 transition"
          >

            <Download className="h-4 w-4" />

            <span>
              ส่งออกเป็น CSV (Export CSV)
            </span>

          </button>

        </div>


        {/* ==========================================
            Filter Controls
        ========================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">

          {/* Sensor */}

          <div>

            <label className="block text-[11px] font-medium text-slate-400 mb-1">

              เซ็นเซอร์ / จุดติดตั้ง

            </label>

            <div className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200">

              SN300-01

            </div>

          </div>


          {/* Metric */}

          <div>

            <label className="block text-[11px] font-medium text-slate-400 mb-1">

              เลือกพารามิเตอร์ที่ต้องการดู

            </label>

            <select
              value={selectedMetric}
              onChange={(e) =>
                setSelectedMetric(e.target.value)
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >

              <option value="temp">
                อุณหภูมิ (°C)
              </option>

              <option value="humidity">
                ความชื้นสัมพัทธ์ (%RH)
              </option>

            </select>

          </div>


          {/* Record Limit */}

          <div>

            <label className="block text-[11px] font-medium text-slate-400 mb-1">

              ความละเอียดข้อมูล (จำนวนเรคอร์ด)

            </label>

            <select
              value={recordLimit}
              onChange={(e) =>
                setRecordLimit(Number(e.target.value))
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >

              <option value={50}>
                50 รายการล่าสุด
              </option>

              <option value={100}>
                100 รายการล่าสุด
              </option>

              <option value={200}>
                200 รายการล่าสุด
              </option>

            </select>

          </div>

        </div>


        {/* Fetch Button */}

        <div className="flex justify-end">

          <button
            onClick={loadHistory}
            className="flex items-center justify-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 py-2 px-4 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
          >

            <Search className="h-3.5 w-3.5 text-brand-400" />

            <span>
              ดึงข้อมูล (Fetch)
            </span>

          </button>

        </div>

      </div>


      {/* ==========================================
          Statistical Summary Cards
      ========================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


        {/* Total */}

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

          <div className="flex items-center justify-between text-xs text-slate-400">

            <span>
              จำนวนข้อมูลทั้งหมด
            </span>

            <Database className="h-4 w-4 text-brand-400" />

          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-slate-100">

            {stats.totalPoints}

            <span className="text-xs font-sans text-slate-400">
              {' '}จุดบันทึก
            </span>

          </div>

          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">

            Data points

          </span>

        </div>


        {/* Average */}

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

          <div className="flex items-center justify-between text-xs text-slate-400">

            <span>
              ค่าเฉลี่ย (Mean)
            </span>

            <TrendingUp className="h-4 w-4 text-cyan-400" />

          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-cyan-300">

            {stats.avg}

            <span className="text-xs font-sans text-slate-400">

              {' '}
              {metricLabels[selectedMetric]?.unit}

            </span>

          </div>

          <span className="text-[10px] text-slate-400 mt-1 block">

            ค่าเฉลี่ยจากข้อมูล SN300-01

          </span>

        </div>


        {/* Min */}

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

          <div className="flex items-center justify-between text-xs text-slate-400">

            <span>
              ค่าต่ำสุดที่บันทึก (Min)
            </span>

            <ArrowDown className="h-4 w-4 text-amber-400" />

          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-amber-300">

            {stats.min}

            <span className="text-xs font-sans text-slate-400">

              {' '}
              {metricLabels[selectedMetric]?.unit}

            </span>

          </div>

          <span className="text-[10px] text-slate-400 mt-1 block">

            ค่าต่ำสุดที่ตรวจพบ

          </span>

        </div>


        {/* Max */}

        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4">

          <div className="flex items-center justify-between text-xs text-slate-400">

            <span>
              ค่าสูงสุดที่บันทึก (Max)
            </span>

            <ArrowUp className="h-4 w-4 text-rose-400" />

          </div>

          <div className="mt-2 font-mono text-2xl font-bold text-rose-300">

            {stats.max}

            <span className="text-xs font-sans text-slate-400">

              {' '}
              {metricLabels[selectedMetric]?.unit}

            </span>

          </div>

          <span className="text-[10px] text-slate-400 mt-1 block">

            ค่าสูงสุดที่ตรวจพบ

          </span>

        </div>

      </div>


      {/* ==========================================
          Graph
      ========================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">

          <div>

            <h2 className="text-sm font-bold text-slate-100 font-mono">

              กราฟความต่อเนื่องของ{' '}

              {metricLabels[selectedMetric]?.label}

            </h2>

            <span className="text-xs text-slate-400">

              แสดงข้อมูลย้อนหลังของเซ็นเซอร์ SN300-01

            </span>

          </div>

          <span className="text-xs font-mono text-brand-400 font-semibold">

            {metricLabels[selectedMetric]?.unit}

          </span>

        </div>


        <div className="h-80 w-full pt-4">

          <ResponsiveContainer width="100%" height="100%">

            <LineChart
              data={chartData}
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

              <XAxis
                dataKey="time"
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
              />

              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickLine={false}
                domain={['auto', 'auto']}
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
                type="monotone"
                dataKey="value"
                name={metricLabels[selectedMetric]?.label}
                stroke={
                  metricLabels[selectedMetric]?.color ||
                  '#06B6D4'
                }
                strokeWidth={2}
                dot={{ r: 2 }}
                activeDot={{ r: 6 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* ==========================================
          Raw Data Table
      ========================================== */}

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">

        <div className="flex items-center justify-between pb-3 border-b border-slate-800">

          <h3 className="text-sm font-bold text-slate-100 font-mono">

            ตารางบันทึกข้อมูล (SENSOR TELEMETRY)

          </h3>

          <span className="text-xs text-slate-400 font-mono">

            แสดง {data.length} รายการ

          </span>

        </div>


        <div className="mt-3 overflow-x-auto">

          <table className="w-full text-left text-xs">

            <thead>

              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">

                <th className="py-2.5">
                  ID
                </th>

                <th className="py-2.5">
                  วัน-เวลา (Timestamp)
                </th>

                <th className="py-2.5">
                  รหัสเซ็นเซอร์
                </th>

                <th className="py-2.5">
                  อุณหภูมิ (°C)
                </th>

                <th className="py-2.5">
                  ความชื้น (%RH)
                </th>

                <th className="py-2.5">
                  สถานะ
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">

              {data.slice(0, 15).map((row) => (

                <tr
                  key={row.id}
                  className="hover:bg-slate-800/30 transition"
                >

                  <td className="py-2 text-slate-500">
                    #{row.id}
                  </td>

                  <td className="py-2 text-slate-300 font-sans">
                    {row.timestamp}
                  </td>

                  <td className="py-2 text-brand-400 font-bold">
                    {row.sensor_code}
                  </td>

                  <td className="py-2 text-amber-300 font-bold">
                    {Number(row.temperature).toFixed(1)} °C
                  </td>

                  <td className="py-2 text-cyan-300">
                    {Number(row.humidity).toFixed(1)} %
                  </td>

                  <td className="py-2">

                    <span
                      className={`
                        inline-block
                        px-2
                        py-0.5
                        rounded
                        text-[10px]
                        font-bold
                        ${row.status === 'danger'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : row.status === 'warning'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }
                      `}
                    >

                      {(row.status || 'normal').toUpperCase()}

                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>


      {/* Loading */}

      {isLoading && (

        <div className="text-center text-xs text-slate-500">

          กำลังโหลดข้อมูลย้อนหลัง...

        </div>

      )}

    </div>

  );

};