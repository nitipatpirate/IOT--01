import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { SystemSettings, Sensor, Threshold } from '../types';
import { 
  Sliders, 
  Building2, 
  Cpu, 
  BellRing, 
  Send, 
  MessageSquare, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testStatus, setTestStatus] = useState<{ type: 'tg' | 'line'; msg: string; isError?: boolean } | null>(null);
  const [showTgToken, setShowTgToken] = useState(false);
  const [showLineToken, setShowLineToken] = useState(false);

  useEffect(() => {
    api.getSettings().then((res) => {
      setSettings(res.settings);
      setSensors(res.sensors);
      setThresholds(res.thresholds);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.updateSettings({ settings, thresholds, sensors });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!settings?.telegram_token || !settings?.telegram_chat_id) {
      setTestStatus({ type: 'tg', msg: 'กรุณากรอก Bot Token และ Chat ID ก่อนทดสอบ', isError: true });
      return;
    }
    setTestStatus({ type: 'tg', msg: 'กำลังส่งสัญญาณทดสอบไปยัง Telegram Bot...' });
    try {
      const res = await api.testTelegram(settings.telegram_token, settings.telegram_chat_id);
      setTestStatus({ type: 'tg', msg: res.message });
    } catch (err: any) {
      setTestStatus({ type: 'tg', msg: err.message, isError: true });
    }
  };

  const handleTestLine = async () => {
    if (!settings?.line_token || !settings?.line_target_id) {
      setTestStatus({ type: 'line', msg: 'กรุณากรอก Channel Token และ Target ID ก่อนทดสอบ', isError: true });
      return;
    }
    setTestStatus({ type: 'line', msg: 'กำลังส่งสัญญาณทดสอบไปยัง LINE OA...' });
    try {
      const res = await api.testLine(settings.line_token, settings.line_target_id);
      setTestStatus({ type: 'line', msg: res.message });
    } catch (err: any) {
      setTestStatus({ type: 'line', msg: err.message, isError: true });
    }
  };

  if (!settings) {
    return <div className="p-8 text-center text-xs text-slate-400">กำลังโหลดการตั้งค่าระบบ...</div>;
  }

  const o2Threshold = thresholds.find(t => t.metric === 'o2') || {
    normal_min: 20.0,
    normal_max: 22.0,
    elevated_min: 19.5,
    elevated_max: 23.0,
    warning_min: 18.0,
    warning_max: 23.5,
    danger_low: 18.0,
    danger_high: 23.5
  };

  const updateO2Threshold = (field: string, val: number) => {
    setThresholds(prev => prev.map(t => t.metric === 'o2' ? { ...t, [field]: val } : t));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Header & Save Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Sliders className="h-5 w-5 text-brand-400" />
            <span>ตั้งค่าระบบและการเชื่อมต่อ (SYSTEM CONFIGURATION)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ปรับแต่งเกณฑ์ตรวจวัดออกซิเจน, กำหนดค่าหัวเซ็นเซอร์ Raspberry Pi และช่องทางแจ้งเตือน
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {saveSuccess && (
            <span className="flex items-center space-x-1.5 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="h-4 w-4" />
              <span>บันทึกสำเร็จเรียบร้อย!</span>
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-5 py-2.5 text-xs font-bold text-slate-950 hover:from-brand-400 hover:to-cyan-400 shadow-lg shadow-brand-500/20 transition disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า (Save Changes)'}</span>
          </button>
        </div>
      </div>

      {/* Grid 4 Blocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block 1: General Info */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Building2 className="h-5 w-5 text-brand-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              1. ข้อมูลทั่วไปของหน่วยงาน (GENERAL INFO)
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">ชื่อโปรแกรมตรวจวัด</label>
              <input
                type="text"
                value={settings.system_title}
                onChange={(e) => setSettings({ ...settings, system_title: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">ชื่อโรงพยาบาล / ศูนย์การแพทย์</label>
              <input
                type="text"
                value={settings.hospital_name}
                onChange={(e) => setSettings({ ...settings, hospital_name: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">แผนก / ฝ่ายความรับผิดชอบ</label>
              <input
                type="text"
                value={settings.department}
                onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">ภาษาหน้าจอ (Language)</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
                >
                  <option value="th">ภาษาไทย (Thai)</option>
                  <option value="en">English (US)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ความถี่บันทึกข้อมูล (วินาที)</label>
                <input
                  type="number"
                  value={settings.sampling_interval}
                  onChange={(e) => setSettings({ ...settings, sampling_interval: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Block 2: 3 Sensors Hardware Config */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Cpu className="h-5 w-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              2. กำหนดค่าหัวเซ็นเซอร์ 3 จุด (SENSOR CONFIG)
            </h2>
          </div>

          <div className="space-y-3">
            {sensors.map((s, idx) => (
              <div key={s.id} className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-brand-400 font-mono">
                    #{idx + 1} {s.sensor_code.toUpperCase()}
                  </span>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <span className="text-[10px] text-slate-400">เปิดใช้งาน:</span>
                    <input
                      type="checkbox"
                      checked={s.is_enabled === 1}
                      onChange={(e) => {
                        const val = e.target.checked ? 1 : 0;
                        setSensors(sensors.map(item => item.id === s.id ? { ...item, is_enabled: val } : item));
                      }}
                      className="rounded border-slate-700 bg-slate-900 text-brand-500"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">ชื่อแสดงผล</label>
                    <input
                      type="text"
                      value={s.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSensors(sensors.map(item => item.id === s.id ? { ...item, name: val } : item));
                      }}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">Offset สอบเทียบ (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={s.calibration_offset}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setSensors(sensors.map(item => item.id === s.id ? { ...item, calibration_offset: val } : item));
                      }}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 3: Custom O2 Thresholds with Live Range Preview Slider */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <BellRing className="h-5 w-5 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              3. เกณฑ์การแจ้งเตือนออกซิเจน (O2 THRESHOLDS)
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Range Spectrum Preview Bar */}
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5 space-y-2">
              <span className="text-[11px] font-medium text-slate-400 block">
                Visual Range Spectrum Preview:
              </span>
              <div className="h-5 w-full rounded-full flex overflow-hidden text-[9px] font-bold text-slate-950 leading-5 text-center shadow-inner">
                <div className="bg-rose-500 w-[15%]" title="Danger Low">&lt;18%</div>
                <div className="bg-amber-400 w-[15%]" title="Warning Low">18-19.5%</div>
                <div className="bg-emerald-400 w-[40%]" title="Normal Safe">20.0% – 22.0% Safe</div>
                <div className="bg-amber-400 w-[15%]" title="Warning High">22.5-23.5%</div>
                <div className="bg-rose-500 w-[15%]" title="Danger High">&gt;23.5%</div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0% (ขาดอากาศ)</span>
                <span className="text-emerald-400">20.9% Ambient</span>
                <span className="text-rose-400">25%+ (เพลิงไหม้)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">เกณฑ์ปกติ ต่ำสุด - สูงสุด (%)</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.1"
                    value={o2Threshold.normal_min}
                    onChange={(e) => updateO2Threshold('normal_min', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-emerald-400 font-mono"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    step="0.1"
                    value={o2Threshold.normal_max}
                    onChange={(e) => updateO2Threshold('normal_max', parseFloat(e.target.value))}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">เกณฑ์อันตรายวิกฤต (&gt; High %)</label>
                <input
                  type="number"
                  step="0.1"
                  value={o2Threshold.danger_high}
                  onChange={(e) => updateO2Threshold('danger_high', parseFloat(e.target.value))}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-rose-400 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Block 4: Telegram & LINE OA Integrations */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Send className="h-5 w-5 text-sky-400" />
            <h2 className="text-sm font-bold text-slate-100 font-mono">
              4. เชื่อมต่อ TELEGRAM BOT & LINE OA
            </h2>
          </div>

          <div className="space-y-4 text-xs">
            {/* Telegram config */}
            <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sky-400 flex items-center space-x-1.5">
                  <Send className="h-3.5 w-3.5" />
                  <span>Telegram Bot Integration</span>
                </span>
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  className="text-[11px] font-semibold text-brand-400 hover:text-brand-300 underline"
                >
                  ทดสอบส่งข้อความ (Test)
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Bot Token</label>
                <div className="relative">
                  <input
                    type={showTgToken ? 'text' : 'password'}
                    value={settings.telegram_token || ''}
                    onChange={(e) => setSettings({ ...settings, telegram_token: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 pr-8 text-xs font-mono text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowTgToken(!showTgToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showTgToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Chat ID / Channel ID</label>
                <input
                  type="text"
                  value={settings.telegram_chat_id || ''}
                  onChange={(e) => setSettings({ ...settings, telegram_chat_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            {/* LINE OA config */}
            <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>LINE Official Account (LINE OA)</span>
                </span>
                <button
                  type="button"
                  onClick={handleTestLine}
                  className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 underline"
                >
                  ทดสอบส่งข้อความ (Test)
                </button>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Channel Access Token</label>
                <div className="relative">
                  <input
                    type={showLineToken ? 'text' : 'password'}
                    value={settings.line_token || ''}
                    onChange={(e) => setSettings({ ...settings, line_token: e.target.value })}
                    className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 pr-8 text-xs font-mono text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLineToken(!showLineToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showLineToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-0.5">Destination User ID / Group ID</label>
                <input
                  type="text"
                  value={settings.line_target_id || ''}
                  onChange={(e) => setSettings({ ...settings, line_target_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1.5 text-xs font-mono text-slate-200"
                />
              </div>
            </div>

            {testStatus && (
              <div className={`p-2.5 rounded-xl border text-xs ${
                testStatus.isError ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {testStatus.msg}
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};
