import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar, { initials } from '../components/Navbar.jsx';
import { Button } from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { LogoutIcon, MailIcon, PhoneIcon, ClockIcon, ShieldIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const fmt = (d) =>
  d ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(d)) : '—';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [leaving, setLeaving] = useState(false);
  const welcome = location.state?.welcome;

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    navigate('/', { replace: true });
  };

  const rows = [
    [MailIcon, 'Email', user.email],
    [PhoneIcon, 'Số điện thoại', user.phone ?? 'Chưa cập nhật'],
    [ShieldIcon, 'Vai trò', user.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'],
    [ClockIcon, 'Đăng nhập gần nhất', fmt(user.lastLoginAt)],
  ];

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-50 to-white">
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-8">
        {welcome && <Alert type="success" className="mb-6">Tạo tài khoản thành công! Chào mừng bạn đến với Bali Home.</Alert>}

        <section className="animate-rise overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-900/5">
          <div className="relative h-28 bg-gradient-to-r from-brand-900 via-brand-500 to-accent-500">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.15)_1px,transparent_1px)] [background-size:18px_18px]" />
          </div>
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <span className="grid h-20 w-20 place-items-center rounded-2xl bg-brand-500 text-2xl font-black text-white shadow-lg ring-4 ring-white">
                  {initials(user.fullName)}
                </span>
                <div className="pb-1">
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">{user.fullName}</h1>
                  <p className="text-sm text-slate-500">Thành viên từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <Button variant="danger" onClick={onLogout} loading={leaving}>
                <LogoutIcon className="h-4.5 w-4.5" /> Đăng xuất
              </Button>
            </div>

            <dl className="mt-8 grid gap-3 sm:grid-cols-2">
              {rows.map(([Icon, label, value]) => (
                <div key={label} className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand-500 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
                    <dd className="truncate text-[15px] font-semibold text-slate-800">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
