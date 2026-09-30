import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Alert } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  BellRing, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Send, 
  MessageSquare, 
  Filter, 
  X,
  FileSearch
} from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [sensorFilter, setSensorFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAlertModal, setSelectedAlertModal] = useState<Alert | null>(null);

  const loadAlerts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAlerts(severityFilter, sensorFilter, statusFilter);
      setAlerts(res.alerts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [severityFilter, sensorFilter, statusFilter]);

  const handleAcknowledge = async (id: number) => {
    try {
      const name = user ? `${user.first_name} ${user.last_name} (${user.role})` : 'เจ้าหน้าที่เวร';
      await api.acknowledgeAlert(id, name);
      loadAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const dangerCount = alerts.filter(a => a.severity === 'danger').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const pendingCount = alerts.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header & Stats Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
              <BellRing className="h-5 w-5 text-rose-400" />
              <span>ประวัติและบันทึกเหตุการณ์แจ้งเตือน (ALERT LOGS)</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              บันทึกเหตุการณ์ผิดปกติ การส่งข้อความผ่าน Telegram & LINE OA พร้อมระบบยืนยันรับทราบเหตุการณ์
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-300 font-mono font-bold">
              <span>อันตราย:</span>
              <span>{dangerCount}</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-300 font-mono font-bold">
              <span>เฝ้าระวัง:</span>
              <span>{warningCount}</span>
            </div>
            <div className="flex items-center space-x-1.5 rounded-lg border border-brand-500/30 bg-brand-500/10 px-3 py-1.5 text-xs text-brand-300 font-mono font-bold">
              <span>รอดำเนินการ:</span>
              <span>{pendingCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              กรองตามระดับความรุนแรง
            </label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">ทุกระดับ (All Severities)</option>
              <option value="danger">อันตรายวิกฤต (Danger)</option>
              <option value="warning">เตือนเฝ้าระวัง (Warning)</option>
              <option value="notice">ข้อสังเกต (Notice)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              กรองตามเซ็นเซอร์
            </label>
            <select
              value={sensorFilter}
              onChange={(e) => setSensorFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">ทุกจุดตรวจวัด (All)</option>
              <option value="sensor_01">เซ็นเซอร์ 01 - คลังท่อก๊าซ</option>
              <option value="sensor_02">เซ็นเซอร์ 02 - ห้องผ่าตัด ICU</option>
              <option value="sensor_03">เซ็นเซอร์ 03 - Ward 4</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              กรองตามสถานะการจัดการ
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
            >
              <option value="all">ทุกสถานะ (All)</option>
              <option value="pending">รอดำเนินการ (Pending)</option>
              <option value="acknowledged">รับทราบแล้ว (Acknowledged)</option>
              <option value="resolved">แก้ไขแล้ว (Resolved)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">รหัสแจ้งเตือน</th>
                <th className="py-3 px-3">วัน-เวลา</th>
                <th className="py-3 px-3">จุดติดตั้ง</th>
                <th className="py-3 px-3">ค่าตรวจวัด & เกณฑ์</th>
                <th className="py-3 px-3">ระดับความรุนแรง</th>
                <th className="py-3 px-3">การส่งบอท</th>
                <th className="py-3 px-3">การรับทราบ</th>
                <th className="py-3 px-3 text-right">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-500 font-sans">
                    ไม่พบรายการเหตุการณ์ตามเงื่อนไขที่เลือก
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 text-brand-400 font-bold">
                      {alert.alert_code}
                    </td>

                    <td className="py-3 px-3 text-slate-300 font-sans">
                      {alert.timestamp}
                    </td>

                    <td className="py-3 px-3 font-sans font-medium text-slate-200">
                      <div>{alert.sensor_name}</div>
                      <span className="text-[10px] text-slate-500 font-mono">{alert.sensor_code}</span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-100">{alert.metric}: {alert.value}</div>
                      <div className="text-[10px] text-rose-400">{alert.threshold_exceeded}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        alert.severity === 'danger'
                          ? 'border-rose-500/40 bg-rose-500/20 text-rose-300'
                          : alert.severity === 'warning'
                          ? 'border-amber-500/40 bg-amber-500/20 text-amber-300'
                          : 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center space-x-2">
                        <span className="flex items-center space-x-1 text-sky-400 text-[10px]" title="ส่งเข้า Telegram สำเร็จ">
                          <Send className="h-3 w-3" />
                          <span>✓ TG</span>
                        </span>
                        <span className="flex items-center space-x-1 text-emerald-400 text-[10px]" title="ส่งเข้า LINE OA สำเร็จ">
                          <MessageSquare className="h-3 w-3" />
                          <span>✓ LINE</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      {alert.status === 'acknowledged' ? (
                        <div>
                          <span className="inline-flex items-center space-x-1 text-emerald-400 text-[10px] font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>รับทราบแล้ว</span>
                          </span>
                          <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                            โดย {alert.acknowledged_by}
                          </div>
                        </div>
                      ) : alert.status === 'resolved' ? (
                        <span className="text-slate-400 text-[10px]">แก้ไขเสร็จสิ้น</span>
                      ) : (
                        <span className="text-amber-400 text-[10px] font-semibold">
                          ⏳ รอดำเนินการ
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-2">
                        {alert.status === 'pending' && (
                          <button
                            onClick={() => handleAcknowledge(alert.id)}
                            className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[11px] font-semibold text-slate-200 hover:bg-slate-700 transition"
                          >
                            รับทราบ
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedAlertModal(alert)}
                          className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-400 hover:text-slate-200 hover:border-slate-700 transition"
                          title="ดูรายละเอียดเหตุการณ์"
                        >
                          <FileSearch className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedAlertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-rose-400" />
                <span className="font-mono font-bold text-slate-100">
                  {selectedAlertModal.alert_code}
                </span>
              </div>
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">ข้อความแจ้งเตือน:</span>
                <p className="font-sans font-semibold text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  {selectedAlertModal.message}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">จุดตรวจวัด</span>
                  <span className="font-bold text-slate-200">{selectedAlertModal.sensor_name}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ค่าที่ตรวจพบ</span>
                  <span className="font-bold text-rose-400 font-mono">{selectedAlertModal.value} ({selectedAlertModal.threshold_exceeded})</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400 block text-[10px] mb-1">การส่งสัญญาณแจ้งเตือนอัตโนมัติ:</span>
                <div className="flex items-center space-x-4">
                  <span className="text-emerald-400 font-semibold">✓ Telegram Bot ส่งแล้ว</span>
                  <span className="text-emerald-400 font-semibold">✓ LINE Official Account ส่งแล้ว</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAlertModal(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
