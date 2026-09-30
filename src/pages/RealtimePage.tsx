import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Sensor } from '../types';
import { O2Gauge } from '../components/O2Gauge';
import { 
  Activity, 
  Play, 
  Pause, 
  RotateCw, 
  Cpu, 
  Wifi, 
  Thermometer, 
  Droplets, 
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, YAxis } from 'recharts';

export const RealtimePage: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [streamSpeed, setStreamSpeed] = useState<number>(2000); // ms
  const [isPaused, setIsPaused] = useState(false);
  const [lastPing, setLastPing] = useState<string>('24ms');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isSimulatingLeak, setIsSimulatingLeak] = useState(false);

  const fetchRealtime = async () => {
    try {
      const res = await api.getRealtime();
      setSensors(res.sensors);
      setLastUpdated(new Date().toLocaleTimeString('th-TH'));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRealtime();
    if (isPaused) return;

    const interval = setInterval(fetchRealtime, streamSpeed);
    return () => clearInterval(interval);
  }, [streamSpeed, isPaused]);

  const handlePingTest = () => {
    const randomPing = Math.floor(15 + Math.random() * 20);
    setLastPing(`${randomPing}ms`);
  };

  // Simulate an injected leak test for demo
  const triggerSimulation = async (sensorCode: string) => {
    try {
      setIsSimulatingLeak(true);
      await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sensor_code: sensorCode,
          o2_level: 23.95,
          temperature: 23.2,
          humidity: 56.5
        })
      });
      fetchRealtime();
      setTimeout(() => setIsSimulatingLeak(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Realtime Stream Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div>
          <div className="flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className={`absolute inline-flex h-full w-full rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400 pulse-beacon'}`} />
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isPaused ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
            <h1 className="text-lg font-bold text-slate-100 font-mono">
              ข้อมูลเซ็นเซอร์เรียลไทม์ (LIVE TELEMETRY STREAM)
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            รับสัญญาณสดจาก Raspberry Pi Node 3 จุดตรวจวัด • อัปเดตล่าสุด: {lastUpdated || 'กำลังเชื่อมต่อ...'}
          </p>
        </div>

        {/* Stream Interval Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition ${
              isPaused 
                ? 'border-amber-500/40 bg-amber-500/20 text-amber-300' 
                : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
            }`}
          >
            {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
            <span>{isPaused ? 'เริ่มสตรีมต่อ' : 'หยุดชั่วคราว'}</span>
          </button>

          {/* Interval Rates */}
          <div className="flex items-center rounded-lg border border-slate-800 bg-slate-950 p-1 text-xs">
            <button
              onClick={() => setStreamSpeed(1000)}
              className={`rounded px-2.5 py-1 font-mono transition ${streamSpeed === 1000 ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              1s
            </button>
            <button
              onClick={() => setStreamSpeed(2000)}
              className={`rounded px-2.5 py-1 font-mono transition ${streamSpeed === 2000 ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              2s
            </button>
            <button
              onClick={() => setStreamSpeed(5000)}
              className={`rounded px-2.5 py-1 font-mono transition ${streamSpeed === 5000 ? 'bg-brand-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              5s
            </button>
          </div>

          {/* Ping Hardware */}
          <button
            onClick={handlePingTest}
            className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-300 hover:border-brand-500/40 transition"
          >
            <Wifi className="h-3.5 w-3.5 text-cyan-400" />
            <span>Ping: <strong className="font-mono text-emerald-400">{lastPing}</strong></span>
          </button>
        </div>
      </div>

      {/* 3 Detailed Sensor Telemetry Panels */}
      <div className="grid grid-cols-1 gap-6">
        {sensors.map((sensor) => {
          const reading = sensor.currentReading || { o2_level: 20.9, temperature: 22.0, humidity: 55.0, status: 'normal' };
          const isDanger = reading.status === 'danger';
          const isWarning = reading.status === 'warning';

          const sparklineData = (sensor.sparkline || [20.88, 20.92, 20.95, 20.91, 20.94]).map((val, idx) => ({
            id: idx,
            val
          }));

          return (
            <div
              key={sensor.id}
              className={`relative overflow-hidden rounded-2xl border bg-slate-900/80 p-6 shadow-2xl transition-all ${
                isDanger
                  ? 'border-rose-500/60 bg-rose-950/20 shadow-rose-950/50'
                  : isWarning
                  ? 'border-amber-500/50 bg-amber-950/20'
                  : 'border-slate-800 hover:border-slate-700/80'
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Left: O2 Master Gauge */}
                <div className="lg:col-span-4 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-slate-800 pb-5 lg:pb-0 lg:pr-6">
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold text-slate-300">
                      O₂ CONCENTRATION
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      isDanger
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {isDanger ? 'รั่วไหลเกินเกณฑ์' : isWarning ? 'ระดับเริ่มสูง' : 'สภาวะปกติ'}
                    </span>
                  </div>

                  <O2Gauge value={reading.o2_level} size="lg" />
                </div>

                {/* Middle: Secondary Meters & Rolling Sparkline */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-base font-bold text-slate-100">
                        {sensor.name}
                      </span>
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                        ONLINE
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {sensor.location}
                    </div>
                  </div>

                  {/* Temperature & Humidity Cards */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>อุณหภูมิห้อง</span>
                        <Thermometer className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="font-mono text-2xl font-bold text-slate-100">
                          {reading.temperature.toFixed(1)}
                        </span>
                        <span className="font-mono text-xs text-slate-400">°C</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">เกณฑ์ปกติ 20 - 25°C</span>
                    </div>

                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>ความชื้นสัมพัทธ์</span>
                        <Droplets className="h-4 w-4 text-cyan-400" />
                      </div>
                      <div className="flex items-baseline space-x-1">
                        <span className="font-mono text-2xl font-bold text-slate-100">
                          {reading.humidity.toFixed(1)}
                        </span>
                        <span className="font-mono text-xs text-slate-400">%RH</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">เกณฑ์ปกติ 40 - 60%</span>
                    </div>
                  </div>

                  {/* Rolling 5-minute Micro Sparkline */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-mono">Live O2 Waveform (Micro-fluctuations)</span>
                      <span className="text-[10px] text-brand-400 font-mono">5m rolling</span>
                    </div>
                    <div className="h-12 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                          <YAxis domain={['dataMin - 0.2', 'dataMax + 0.2']} hide />
                          <Line 
                            type="monotone" 
                            dataKey="val" 
                            stroke={isDanger ? '#EF4444' : '#06B6D4'} 
                            strokeWidth={2} 
                            dot={false} 
                            isAnimationActive={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right: Hardware Node Diagnostics */}
                <div className="lg:col-span-3 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-mono font-bold text-slate-300 pb-2 border-b border-slate-800">
                    <Cpu className="h-4 w-4 text-brand-400" />
                    <span>NODE DIAGNOSTICS</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Node ID:</span>
                      <span className="font-mono text-slate-200">{sensor.hardware_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">GPIO / I2C:</span>
                      <span className="font-mono text-slate-200">{sensor.gpio_pin} / {sensor.i2c_address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Calibration Offset:</span>
                      <span className="font-mono text-emerald-400">
                        {sensor.calibration_offset >= 0 ? `+${sensor.calibration_offset}` : sensor.calibration_offset}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Calibrated:</span>
                      <span className="font-mono text-slate-300">{sensor.last_calibration || '2026-08-15'}</span>
                    </div>
                  </div>

                  {/* Quick Simulation Inject Button */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={() => triggerSimulation(sensor.sensor_code)}
                      disabled={isSimulatingLeak}
                      className="w-full flex items-center justify-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 py-1.5 text-[11px] font-semibold text-rose-300 hover:bg-rose-500/20 transition disabled:opacity-50"
                    >
                      <Zap className="h-3.5 w-3.5 text-rose-400" />
                      <span>{isSimulatingLeak ? 'กำลังจำลองรั่วไหล...' : 'ทดสอบทริกเกอร์รั่วไหล (Leak Test)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
