import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar, { initials } from '../components/Navbar.jsx';
import { Button } from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import {
  LogoutIcon, MailIcon, PhoneIcon, ClockIcon, ShieldIcon, UserIcon,
  CalendarIcon, HashIcon, KeyIcon, MonitorIcon, CopyIcon, CheckIcon,
} from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/* ---------------- Định dạng hiển thị ---------------- */
const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};
const fmtDateTime = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return `${pad(x.getHours())}:${pad(x.getMinutes())}, ${fmtDate(x)}`;
};
/** "vừa xong", "5 phút trước", "3 ngày trước"... */
const timeAgo = (d) => {
  if (!d) return '';
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 2592000) return `${Math.floor(s / 86400)} ngày trước`;
  return `${Math.floor(s / 2592000)} tháng trước`;
};
const daysSince = (d) => Math.max(1, Math.ceil((Date.now() - new Date(d).getTime()) / 86400000));
const memberCode = (id = '') => `BH-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
const fmtPhone = (p) => (p ? p.replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3') : null);

/* ---------------- Thành phần nhỏ ---------------- */
function Card({ title, icon: Icon, children, className = '' }) {
  return (
    <section className={`rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-7 ${className}`}>
      <h2 className="flex items-center gap-2.5 text-base font-bold text-slate-900">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-500">
          <Icon className="h-4.5 w-4.5" />
        </span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Một dòng thông tin: nhãn bên trái, giá trị bên phải (mobile: xếp dọc) */
function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex flex-col gap-1 border-t border-slate-100 py-4 first:border-t-0 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <dt className="flex w-44 shrink-0 items-center gap-2.5 text-sm font-medium text-slate-500">
        <Icon className="h-4.5 w-4.5 text-slate-400" />
        {label}
      </dt>
      <dd className="min-w-0 flex-1 break-words text-[15px] font-semibold text-slate-900">{children}</dd>
    </div>
  );
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* trình duyệt chặn clipboard → bỏ qua */ }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 inline-grid h-7 w-7 place-items-center rounded-md align-middle text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      aria-label={copied ? 'Đã sao chép' : `Sao chép ${label}`}
      title={copied ? 'Đã sao chép' : 'Sao chép'}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-emerald-600" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="flex items-center gap-3.5 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-brand-500 shadow-sm ring-1 ring-slate-900/5">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        <p className="truncate text-[15px] font-bold text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

/* ---------------- Trang ---------------- */
export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [leaving, setLeaving] = useState(false);
  const welcome = location.state?.welcome;
  const isAdmin = user.role === 'ADMIN';

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-brand-50 via-slate-50 to-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-2 sm:px-8">
        {welcome && (
          <Alert type="success" className="mb-6">Tạo tài khoản thành công! Chào mừng bạn đến với Bali Home.</Alert>
        )}

        {/* ========== Thẻ hồ sơ ========== */}
        <section className="animate-rise overflow-hidden rounded-3xl bg-white shadow-xl shadow-brand-900/5 ring-1 ring-slate-900/5">
          {/* Banner: xanh thương hiệu + vệt đỏ chéo (gợi hình khung logo) */}
          <div className="relative h-32 overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-600 sm:h-40">
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:18px_18px]" />
            <div className="absolute -right-10 top-0 h-full w-56 skew-x-[-30deg] bg-accent-500/90" />
            <div className="absolute -right-10 top-0 h-full w-72 skew-x-[-30deg] bg-accent-500/25" />
            <img src="/logo.png" alt="" className="absolute bottom-4 right-6 h-14 w-14 rounded-xl bg-white/95 p-1.5 shadow-lg sm:h-16 sm:w-16" />
          </div>

          {/* Nội dung: z-10 để luôn nằm trên banner */}
          <div className="relative z-10 px-5 pb-6 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Chỉ avatar đè lên mép banner */}
                <span className="-mt-12 grid h-24 w-24 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 text-3xl font-black text-white shadow-xl ring-[5px] ring-white sm:-mt-14 sm:h-28 sm:w-28">
                  {initials(user.fullName)}
                </span>
                <div className="min-w-0 sm:pb-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="break-words text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{user.fullName}</h1>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${isAdmin ? 'bg-accent-500/10 text-accent-600' : 'bg-brand-50 text-brand-600'}`}>
                      <ShieldIcon className="h-3.5 w-3.5" />
                      {isAdmin ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-[15px] text-slate-600">{user.email}</p>
                </div>
              </div>
              <Button variant="danger" onClick={onLogout} loading={leaving} className="w-full sm:w-auto">
                <LogoutIcon className="h-4.5 w-4.5" /> Đăng xuất
              </Button>
            </div>

            {/* Dải chỉ số nhanh */}
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Stat icon={CalendarIcon} label="Ngày tham gia" value={fmtDate(user.createdAt)} sub={`${daysSince(user.createdAt)} ngày đồng hành`} />
              <Stat icon={ClockIcon} label="Đăng nhập gần nhất" value={fmtDateTime(user.lastLoginAt)} sub={timeAgo(user.lastLoginAt)} />
              <Stat icon={HashIcon} label="Mã thành viên" value={memberCode(user.id)} sub="Dùng khi liên hệ hỗ trợ" />
            </div>
          </div>
        </section>

        {/* ========== Chi tiết ========== */}
        <div className="mt-6 grid gap-6 lg:grid-cols-5">
          <Card title="Thông tin cá nhân" icon={UserIcon} className="lg:col-span-3">
            <dl>
              <InfoRow icon={UserIcon} label="Họ và tên">{user.fullName}</InfoRow>
              <InfoRow icon={MailIcon} label="Email">
                <span className="break-all">{user.email}</span>
                <CopyButton value={user.email} label="email" />
              </InfoRow>
              <InfoRow icon={PhoneIcon} label="Số điện thoại">
                {user.phone ? (
                  <>
                    {fmtPhone(user.phone)}
                    <CopyButton value={user.phone} label="số điện thoại" />
                  </>
                ) : (
                  <span className="font-medium italic text-slate-400">Chưa cập nhật</span>
                )}
              </InfoRow>
              <InfoRow icon={ShieldIcon} label="Vai trò">{isAdmin ? 'Quản trị viên' : 'Thành viên'}</InfoRow>
              <InfoRow icon={HashIcon} label="Mã thành viên">
                <span className="font-mono">{memberCode(user.id)}</span>
                <CopyButton value={memberCode(user.id)} label="mã thành viên" />
              </InfoRow>
            </dl>
          </Card>

          <Card title="Bảo mật tài khoản" icon={ShieldIcon} className="lg:col-span-2">
            <ul className="grid gap-3">
              {[
                [KeyIcon, 'Mật khẩu', 'Được mã hoá an toàn (bcrypt)'],
                [MonitorIcon, 'Phiên đăng nhập', 'Đang hoạt động trên thiết bị này'],
                [ClockIcon, 'Hoạt động gần nhất', `${fmtDateTime(user.lastLoginAt)}`],
              ].map(([Icon, title, text]) => (
                <li key={title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-900/5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="text-sm text-slate-600">{text}</p>
                  </div>
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-4 ring-emerald-500/15" aria-label="An toàn" />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
              Nếu thấy hoạt động lạ, hãy đăng xuất và liên hệ Bali Home để được hỗ trợ.
            </p>
          </Card>
        </div>
      </main>
    </div>
  );
}
