import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, Activity } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('admin@o2safe.hospital');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    login(demoEmail, demoPass).catch((err) => setError(err.message));
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#070A10] p-4 relative overflow-hidden">
      {/* High-tech background glow & grid lines */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-slate-950 shadow-lg shadow-brand-500/25 font-black text-2xl font-mono">
            O₂
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-white font-mono">
            O2 SAFE MONITORING
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            ระบบตรวจจับการรั่วไหลของออกซิเจนและสภาวะแวดล้อมโรงพยาบาล
          </p>
        </div>

        {error && (
          <div className="mt-5 flex items-center space-x-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-400">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              อีเมลผู้ใช้งาน (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.com"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 pl-10 pr-4 text-xs text-slate-100 placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 py-2.5 text-xs font-bold text-slate-950 hover:from-brand-400 hover:to-cyan-400 transition shadow-lg shadow-brand-500/20 disabled:opacity-50"
          >
            {isLoading ? (
              <span>กำลังตรวจสอบสิทธิ์...</span>
            ) : (
              <>
                <span>เข้าสู่ระบบ (Sign In)</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div className="mt-8 border-t border-slate-800/80 pt-5">
          <span className="block text-[11px] font-medium text-slate-400 text-center mb-2.5">
            ⚡ สลับบัญชีทดสอบด่วน (Demo Profiles):
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@o2safe.hospital', 'admin123')}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-brand-500/40 transition"
            >
              <div className="text-[11px] font-bold text-brand-300">Super Admin</div>
              <div className="text-[10px] text-slate-400 truncate">admin@o2safe.hospital</div>
            </button>

            <button
              onClick={() => handleQuickLogin('engineer@o2safe.hospital', 'eng123')}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-blue-500/40 transition"
            >
              <div className="text-[11px] font-bold text-blue-300">Biomedical Eng</div>
              <div className="text-[10px] text-slate-400 truncate">engineer@o2safe.hospital</div>
            </button>

            <button
              onClick={() => handleQuickLogin('nurse@o2safe.hospital', 'nurse123')}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-emerald-500/40 transition"
            >
              <div className="text-[11px] font-bold text-emerald-300">Safety Operator</div>
              <div className="text-[10px] text-slate-400 truncate">nurse@o2safe.hospital</div>
            </button>

            <button
              onClick={() => handleQuickLogin('viewer@o2safe.hospital', 'view123')}
              className="rounded-lg border border-slate-800 bg-slate-950/60 p-2 text-left hover:border-slate-600 transition"
            >
              <div className="text-[11px] font-bold text-slate-300">Viewer</div>
              <div className="text-[10px] text-slate-400 truncate">viewer@o2safe.hospital</div>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center space-x-2 text-[11px] text-slate-500">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span>เชื่อมต่อเซ็นเซอร์ฮาร์ดแวร์ Raspberry Pi Hub 3 จุด</span>
        </div>
      </div>
    </div>
  );
};
