import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  UserPlus, 
  KeyRound, 
  ShieldCheck, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  RefreshCw,
  Phone,
  Mail,
  Building
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetModalUser, setResetModalUser] = useState<User | null>(null);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);

  // New user form state
  const [newUser, setNewUser] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: 'ฝ่ายวิศวกรรมการแพทย์',
    position: 'เจ้าหน้าที่ความปลอดภัย',
    phone: '',
    role: 'operator' as UserRole,
  });
  const [formError, setFormError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers();
      setUsers(res.users);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleGeneratePassword = () => {
    const random = Math.random().toString(36).slice(-8);
    setNewUser(prev => ({ ...prev, password: `O2#${random}` }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      await api.createUser(newUser);
      setShowAddModal(false);
      setNewUser({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        department: 'ฝ่ายวิศวกรรมการแพทย์',
        position: 'เจ้าหน้าที่ความปลอดภัย',
        phone: '',
        role: 'operator',
      });
      loadUsers();
    } catch (err: any) {
      setFormError(err.message || 'สร้างผู้ใช้ไม่สำเร็จ');
    }
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      await api.updateUser(user.id, { status: newStatus });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetPassword = async (userId: number) => {
    try {
      const res = await api.resetPassword(userId);
      setTempPasswordResult(res.tempPassword);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้นี้ออกจากระบบ?')) return;
    try {
      await api.deleteUser(userId);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'ไม่สามารถลบผู้ใช้ได้');
    }
  };

  const roleColors: Record<UserRole, { badge: string; label: string }> = {
    admin: { badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Super Admin' },
    engineer: { badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Biomedical Eng' },
    operator: { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', label: 'Safety Operator' },
    viewer: { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30', label: 'Viewer' },
  };

  return (
    <div className="space-y-6">
      {/* Header & Add User Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-xl">
        <div>
          <h1 className="text-lg font-bold text-slate-100 font-mono flex items-center space-x-2">
            <Users className="h-5 w-5 text-brand-400" />
            <span>จัดการผู้ใช้งานและสิทธิ์เข้าถึง (USER MANAGEMENT)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            ควบคุมสิทธิ์การเข้าใช้งานระบบ การจัดการรหัสผ่าน และบทบาทหน้าที่ความรับผิดชอบ
          </p>
        </div>

        <button
          onClick={() => {
            handleGeneratePassword();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-brand-500 to-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:from-brand-400 hover:to-cyan-400 shadow-lg shadow-brand-500/20 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>เพิ่มผู้ใช้ใหม่ (Add New User)</span>
        </button>
      </div>

      {/* User Directory Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                <th className="py-3 px-3">ผู้ใช้งาน</th>
                <th className="py-3 px-3">แผนก / ตำแหน่ง</th>
                <th className="py-3 px-3">บทบาทและสิทธิ์</th>
                <th className="py-3 px-3">เบอร์ติดต่อ</th>
                <th className="py-3 px-3">สถานะบัญชี</th>
                <th className="py-3 px-3">เข้าใช้ล่าสุด</th>
                <th className="py-3 px-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition">
                  <td className="py-3 px-3 font-sans">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500/20 text-brand-300 font-bold border border-brand-500/30">
                        {u.first_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-slate-200">
                          {u.first_name} {u.last_name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {u.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <div className="text-slate-200 font-medium">{u.position}</div>
                    <div className="text-[10px] text-slate-400">{u.department}</div>
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${roleColors[u.role]?.badge}`}>
                      {roleColors[u.role]?.label || u.role}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-slate-300 font-mono">
                    {u.phone || '-'}
                  </td>

                  <td className="py-3 px-3 font-sans">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border transition ${
                        u.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-emerald-500/10 hover:text-emerald-400'
                      }`}
                      title="คลิกเพื่อสลับสถานะเปิด/ระงับการใช้งาน"
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      <span>{u.status === 'active' ? 'ใช้งานปกติ' : 'ระงับชั่วคราว'}</span>
                    </button>
                  </td>

                  <td className="py-3 px-3 text-slate-400 font-sans">
                    {u.last_login ? u.last_login.substring(0, 16) : 'ยังไม่เคยล็อกอิน'}
                  </td>

                  <td className="py-3 px-3 text-right font-sans">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => {
                          setResetModalUser(u);
                          setTempPasswordResult(null);
                        }}
                        className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-amber-300 hover:border-amber-500/40 transition"
                        title="รีเซ็ตรหัสผ่าน"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                      </button>

                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
                          title="ลบผู้ใช้"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5 text-brand-400" />
                <h3 className="font-mono font-bold text-slate-100">
                  เพิ่มบัญชีผู้ใช้งานใหม่ (CREATE USER)
                </h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ชื่อจริง (First Name)</label>
                  <input
                    type="text"
                    required
                    value={newUser.first_name}
                    onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">นามสกุล (Last Name)</label>
                  <input
                    type="text"
                    required
                    value={newUser.last_name}
                    onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">อีเมลโรงพยาบาล (Email)</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="name@hospital.com"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">แผนก (Department)</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">ตำแหน่ง (Position)</label>
                  <input
                    type="text"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">เบอร์โทรศัพท์ฉุกเฉิน</label>
                  <input
                    type="text"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    placeholder="08x-xxx-xxxx"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">ระดับสิทธิ์ (Role)</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 focus:border-brand-500 focus:outline-none"
                  >
                    <option value="admin">Super Admin (ผู้ดูแลระบบสูงสุด)</option>
                    <option value="engineer">Biomedical Engineer (วิศวกร)</option>
                    <option value="operator">Safety Operator (เจ้าหน้าที่เวร)</option>
                    <option value="viewer">Viewer (ผู้สังเกตการณ์)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400">รหัสผ่านเริ่มต้น (Initial Password)</label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[10px] text-brand-400 hover:text-brand-300 underline"
                  >
                    สุ่มสร้างใหม่ (Generate)
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-slate-100 font-mono focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-500 px-5 py-2 font-bold text-slate-950 hover:bg-brand-400"
                >
                  บันทึกผู้ใช้
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <KeyRound className="h-5 w-5 text-amber-400" />
                <h3 className="font-mono font-bold text-slate-100">
                  รีเซ็ตรหัสผ่านผู้ใช้
                </h3>
              </div>
              <button onClick={() => setResetModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300">
              ต้องการรีเซ็ตรหัสผ่านสำหรับ: <strong className="text-white">{resetModalUser.first_name} {resetModalUser.last_name}</strong> ({resetModalUser.email})
            </div>

            {tempPasswordResult ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2">
                <span className="text-emerald-300 font-bold block">✓ สร้างรหัสผ่านชั่วคราวใหม่แล้ว:</span>
                <div className="font-mono text-base font-black text-white bg-slate-950 p-2 rounded-lg text-center tracking-wider">
                  {tempPasswordResult}
                </div>
                <span className="text-[10px] text-slate-400 block text-center">
                  กรุณาส่งรหัสผ่านนี้ให้ผู้ใช้สำหรับเข้าสู่ระบบในครั้งถัดไป
                </span>
              </div>
            ) : (
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setResetModalUser(null)}
                  className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={() => handleResetPassword(resetModalUser.id)}
                  className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400"
                >
                  ยืนยันรีเซ็ต
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
