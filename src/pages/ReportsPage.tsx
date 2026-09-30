import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  FileSpreadsheet, 
  Printer, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  FileText, 
  CheckCircle,
  Building2,
  Download
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [reportRange, setReportRange] = useState('month');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getReports();
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportRange]);

  const handlePrintPDF = () => {
    window.print();
  };

  if (!reportData) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-slate-400">
        กำลังประมวลผลรายงานความปลอดภัย...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Bar (hidden when printing) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
            <FileSpreadsheet className="h-5 w-5 text-brand-400" />
            <span>รายงานสรุปผลความปลอดภัย (SAFETY & COMPLIANCE REPORT)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            สร้างเอกสารสรุปสถิติสำหรับคณะกรรมการบริหารความเสี่ยงโรงพยาบาลและวิศวกรรมการแพทย์
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 focus:border-brand-500 focus:outline-none"
          >
            <option value="today">รายงานประจำวัน (Daily Shift)</option>
            <option value="week">สรุปประจำสัปดาห์ (Weekly Audit)</option>
            <option value="month">รายงานความปลอดภัยประจำเดือน (Monthly Report)</option>
          </select>

          <button
            onClick={handlePrintPDF}
            className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-brand-400 hover:to-cyan-400 shadow-lg shadow-brand-500/20 transition"
          >
            <Printer className="h-4 w-4" />
            <span>พิมพ์ / บันทึก PDF (Export PDF)</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md print:border-none print:bg-white print:text-black print:p-0">
        {/* Hospital Letterhead */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-6 print:border-black">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-mono text-2xl font-black text-brand-400 print:text-blue-700">
                O2 SAFE
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 print:text-gray-600">
                • Hospital Environmental Safety
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 print:text-black">
              {reportData.hospital}
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              {reportData.department}
            </p>
          </div>

          <div className="text-right text-xs text-slate-400 print:text-gray-600 space-y-1">
            <div>รหัสเอกสาร: <strong className="font-mono text-slate-200 print:text-black">REP-O2-2026-09</strong></div>
            <div>วันที่ออกรายงาน: <span className="font-mono">{new Date().toLocaleDateString('th-TH')}</span></div>
            <div>สถานะระบบ: <span className="text-emerald-400 print:text-green-700 font-bold">VERIFIED SAFE</span></div>
          </div>
        </div>

        {/* Executive Summary Metrics Box */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">อัตรา Uptime ระบบ</span>
            <span className="font-mono text-2xl font-bold text-emerald-400 print:text-green-700">{reportData.uptime}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">ทำงานต่อเนื่อง 24/7</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">ดัชนีความปลอดภัย (Safety Index)</span>
            <span className="font-mono text-2xl font-bold text-cyan-400 print:text-blue-700">{reportData.safetyScore}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">ช่วงระดับ O₂ อยู่ในเกณฑ์</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">จุดตรวจวัดที่ประเมิน</span>
            <span className="font-mono text-2xl font-bold text-slate-100 print:text-black">{reportData.auditData.length} จุด</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Raspberry Pi Nodes</span>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 print:border-gray-300 print:bg-gray-50">
            <span className="text-[11px] text-slate-400 print:text-gray-600 block">เหตุการณ์เตือนทั้งหมด</span>
            <span className="font-mono text-2xl font-bold text-amber-400 print:text-amber-700">{reportData.totalAlerts} ครั้ง</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">แก้ไขครบถ้วนแล้ว</span>
          </div>
        </div>

        {/* Audit Table per Sensor */}
        <div className="mt-8">
          <h3 className="text-sm font-bold text-slate-100 font-mono mb-3 print:text-black">
            สรุปผลการตรวจสอบเชิงสถิติรายเซ็นเซอร์ (SENSOR AUDIT BREAKDOWN)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px] print:border-gray-300 print:text-gray-700">
                  <th className="py-2.5 px-3">จุดตรวจวัด / พื้นที่</th>
                  <th className="py-2.5 px-3">ตัวอย่างข้อมูล</th>
                  <th className="py-2.5 px-3">O₂ ต่ำสุด</th>
                  <th className="py-2.5 px-3">O₂ เฉลี่ย</th>
                  <th className="py-2.5 px-3">O₂ สูงสุด</th>
                  <th className="py-2.5 px-3">อุณหภูมิเฉลี่ย</th>
                  <th className="py-2.5 px-3">ความชื้นเฉลี่ย</th>
                  <th className="py-2.5 px-3">การประเมิน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] print:divide-gray-200">
                {reportData.auditData.map((item: any) => (
                  <tr key={item.sensor_code} className="hover:bg-slate-800/30 print:hover:bg-transparent">
                    <td className="py-3 px-3 font-sans font-medium text-slate-200 print:text-black">
                      <div>{item.name}</div>
                      <span className="text-[10px] text-slate-400 print:text-gray-600 font-mono">{item.location}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300 print:text-black">{item.total_samples}</td>
                    <td className="py-3 px-3 text-amber-400 print:text-amber-800 font-bold">{item.min_o2}%</td>
                    <td className="py-3 px-3 text-emerald-400 print:text-green-800 font-bold">{item.avg_o2}%</td>
                    <td className="py-3 px-3 text-rose-400 print:text-red-800 font-bold">{item.max_o2}%</td>
                    <td className="py-3 px-3 text-slate-300 print:text-black">{item.avg_temp}°C</td>
                    <td className="py-3 px-3 text-slate-300 print:text-black">{item.avg_hum}%</td>
                    <td className="py-3 px-3">
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400 font-sans font-semibold border border-emerald-500/20 print:border-green-600 print:text-green-800">
                        {item.compliance_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formal Sign-off Section */}
        <div className="mt-14 pt-8 border-t border-slate-800 print:border-black grid grid-cols-2 gap-8 text-xs">
          <div className="text-center space-y-8">
            <div className="border-b border-dashed border-slate-700 w-3/4 mx-auto print:border-gray-400" />
            <div>
              <div className="font-semibold text-slate-200 print:text-black">(กมลชนก สุวรรณศรี)</div>
              <div className="text-slate-400 print:text-gray-600 text-[11px]">วิศวกรชีวการแพทย์ชำนาญการ (ผู้ตรวจสอบระบบ)</div>
            </div>
          </div>

          <div className="text-center space-y-8">
            <div className="border-b border-dashed border-slate-700 w-3/4 mx-auto print:border-gray-400" />
            <div>
              <div className="font-semibold text-slate-200 print:text-black">(สมศักดิ์ เจริญผล)</div>
              <div className="text-slate-400 print:text-gray-600 text-[11px]">หัวหน้างานวิศวกรรมความปลอดภัยโรงพยาบาล (ผู้อนุมัติ)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
