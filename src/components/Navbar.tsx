import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  ShieldCheck, 
  Activity, 
  Send, 
  MessageSquare, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon,
  ChevronDown,
  Clock
} from 'lucide-react';

interface NavbarProps {
  hospitalName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ hospitalName = 'IOT Project' }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [time, setTime] = useState<string>('');
  const [userDropdown, setUserDropdown] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('th-TH', { hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const roleLabels: Record<string, { label: string; color: string }> = {
    admin: { label: 'Super Admin', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    engineer: { label: 'Biomedical Eng', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    operator: { label: 'Safety Operator', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    viewer: { label: 'Viewer', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-950/85 px-6 backdrop-blur-md">
      {/* Brand & Hospital Unit */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 text-slate-950 shadow-md shadow-brand-500/20 font-bold">
            <span className="font-mono text-lg font-black tracking-tighter">O₂</span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-extrabold tracking-wider text-slate-100">
                O2 SAFE
              </span>
              <span className="rounded bg-brand-500/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-brand-400 border border-brand-500/20">
                v2.4 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-[280px]">
              {hospitalName}
            </p>
          </div>
        </div>
      </div>

      {/* Center Hardware & Bot Telemetry Status Badges */}
      <div className="hidden xl:flex items-center space-x-3 text-xs">
        {/* Raspberry Pi Node Health */}
        <div className="flex items-center space-x-2 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 pulse-beacon" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-medium">Raspberry Pi:</span>
          <span className="font-mono text-emerald-400 font-semibold">3/3 Nodes Online</span>
          <span className="text-[10px] text-slate-500 font-mono">18ms</span>
        </div>

        {/* Telegram Status */}
        <div className="flex items-center space-x-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-slate-300">
          <Send className="h-3 w-3 text-sky-400" />
          <span className="text-slate-400">Telegram:</span>
          <span className="font-medium text-emerald-400 text-[11px]">Active</span>
        </div>

        {/* LINE OA Status */}
        <div className="flex items-center space-x-1.5 rounded-full border border-slate-800 bg-slate-900/90 px-3 py-1 text-slate-300">
          <MessageSquare className="h-3 w-3 text-emerald-400" />
          <span className="text-slate-400">LINE OA:</span>
          <span className="font-medium text-emerald-400 text-[11px]">Active</span>
        </div>
      </div>

      {/* Right Controls: Clock, Theme, User */}
      <div className="flex items-center space-x-3">
        {/* Digital Clock */}
        <div className="hidden sm:flex items-center space-x-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 font-mono text-xs text-slate-300">
          <Clock className="h-3.5 w-3.5 text-brand-400" />
          <span className="font-bold text-slate-200">{time}</span>
          <span className="text-[10px] text-slate-500">ICT</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title="สลับโหมด Dark/Light"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
        >
          {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-cyan-400" />}
        </button>

        {/* User Profile Dropdown */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdown(!userDropdown)}
              className="flex items-center space-x-2.5 rounded-lg border border-slate-800 bg-slate-900/90 py-1.5 px-3 hover:border-slate-700 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 font-bold text-xs border border-brand-500/30">
                {user.first_name[0]}
              </div>
              <div className="hidden md:block text-left text-xs">
                <div className="font-medium text-slate-200">
                  {user.first_name} {user.last_name}
                </div>
                <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                  {user.department}
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {userDropdown && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-800 bg-slate-900 p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="p-2 border-b border-slate-800">
                  <div className="font-semibold text-sm text-slate-100">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="text-xs text-slate-400">{user.email}</div>
                  <div className="mt-2">
                    <span className={`inline-block rounded border px-2 py-0.5 text-[10px] font-medium ${roleLabels[user.role]?.color}`}>
                      {roleLabels[user.role]?.label || user.role}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setUserDropdown(false);
                      logout();
                    }}
                    className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ออกจากระบบ (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
};
