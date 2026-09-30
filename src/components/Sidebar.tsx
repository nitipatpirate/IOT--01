import React from 'react';
import { 
  LayoutDashboard, 
  Activity, 
  History, 
  BellRing, 
  FileSpreadsheet, 
  Sliders, 
  Users,
  ShieldAlert,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type PageId = 'dashboard' | 'realtime' | 'history' | 'alerts' | 'reports' | 'settings' | 'users';

interface SidebarProps {
  currentPage: PageId;
  onSelectPage: (page: PageId) => void;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onSelectPage,
  alertCount = 0,
}) => {
  const { hasRole } = useAuth();

  const menuItems = [
    {
      id: 'dashboard' as PageId,
      name: 'หน้าแรก (Dashboard)',
      desc: 'สรุปภาพรวมระบบทั้งหมด',
      icon: LayoutDashboard,
    },
    {
      id: 'realtime' as PageId,
      name: 'ข้อมูลแบบเรียลไทม์',
      desc: 'มอนิเตอร์สด 3 เซ็นเซอร์',
      icon: Activity,
    },
    {
      id: 'history' as PageId,
      name: 'ประวัติข้อมูลย้อนหลัง',
      desc: 'สถิติ กราฟ และส่งออก CSV',
      icon: History,
    },
    {
      id: 'alerts' as PageId,
      name: 'การแจ้งเตือน',
      desc: 'บันทึกเหตุการณ์ผิดปกติ',
      icon: BellRing,
      badge: alertCount > 0 ? alertCount : undefined,
    },
    {
      id: 'reports' as PageId,
      name: 'รายงานสรุป',
      desc: 'สรุปสถิติ & เอกสาร PDF',
      icon: FileSpreadsheet,
    },
    {
      id: 'settings' as PageId,
      name: 'ตั้งค่าระบบ',
      desc: 'เกณฑ์ O2, เซ็นเซอร์, บอท',
      icon: Sliders,
      adminOnly: true,
    },
    {
      id: 'users' as PageId,
      name: 'จัดการผู้ใช้',
      desc: 'กำหนดสิทธิ์ & บัญชีเข้าใช้',
      icon: Users,
      adminOnly: true,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800 bg-slate-950/70 p-4 flex flex-col justify-between select-none">
      <div className="space-y-6">
        <div>
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            ระบบตรวจสอบหลัก
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              const isRestricted = item.adminOnly && !hasRole(['admin', 'engineer']);

              return (
                <button
                  key={item.id}
                  onClick={() => !isRestricted && onSelectPage(item.id)}
                  disabled={isRestricted}
                  className={`group relative flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-300 font-semibold shadow-sm shadow-brand-500/10 border border-brand-500/30'
                      : isRestricted
                      ? 'opacity-40 cursor-not-allowed text-slate-500'
                      : 'text-slate-400 hover:bg-slate-900/90 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-brand-400' : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    />
                    <div className="text-left">
                      <div className="leading-tight">{item.name}</div>
                      <div className="text-[10px] text-slate-500 font-normal leading-tight hidden lg:block">
                        {item.desc}
                      </div>
                    </div>
                  </div>

                  {item.badge !== undefined && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md shadow-rose-500/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Safety Notice Card at Bottom of Sidebar */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 text-xs">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold">
          <ShieldAlert className="h-4 w-4 text-brand-400" />
          <span>เกณฑ์ความปลอดภัย</span>
        </div>
        <p className="mt-1 text-[11px] text-slate-400 leading-relaxed">
          ระดับ O₂ ที่ปลอดภัยในอากาศคือ <strong className="text-emerald-400 font-mono">19.5% – 23.5%</strong> หากเกิน 23.5% เสี่ยงเพลิงไหม้ฉับพลัน
        </p>
      </div>
    </aside>
  );
};
