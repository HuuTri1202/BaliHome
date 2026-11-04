import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar, { initials, CONTAINER } from '../components/Navbar.jsx';
import { ThemeSelector } from '../components/ThemeToggle.jsx';
import { Button, Spinner } from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { LogoutIcon, CopyIcon, CheckIcon, ArrowRightIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { contactApi } from '../lib/api.js';
import { needLabel, STATUS_LABEL } from '../data/needs.js';

/* =============================================================================
 * Trang tài khoản — app screen (taste-skill references/app-screens):
 * bảng phẳng tách bằng bậc tông, nhãn nhỏ được phép, không gradient/bóng/ô icon tô màu.
 * Motif lục giác: avatar, mảng banner.
 * ========================================================================== */

const pad = (n) => String(n).padStart(2, '0');
const fmtDate = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};
const fmtDateTime = (d) => (d ? `${pad(new Date(d).getHours())}:${pad(new Date(d).getMinutes())}, ${fmtDate(d)}` : '—');
const timeAgo = (d) => {
  if (!d) return '';
  const s = Math.max(0, (Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 2592000) return `${Math.floor(s / 86400)} ngày trước`;
  return `${Math.floor(s / 2592000)} tháng trước`;
};
const memberCode = (id = '') => `BH-${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
const fmtPhone = (p) => (p ? p.replace(/^(\d{4})(\d{3})(\d+)$/, '$1 $2 $3') : null);

const STATUS_TONE = {
  NEW: 'bg-ground-3 text-ink',
  CONTACTED: 'bg-[color-mix(in_srgb,var(--action)_16%,var(--ground))] text-action',
  DONE: 'bg-[color-mix(in_srgb,var(--success)_16%,var(--ground))] text-success',
};

function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`bg-ground-2 p-6 sm:p-8 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[19px] font-bold">{title}</h2>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* trình duyệt chặn clipboard */ }
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-1 inline-grid h-8 w-8 place-items-center align-middle text-ink-2 transition-colors hover:bg-ground-3 hover:text-ink"
      aria-label={copied ? 'Đã sao chép' : `Sao chép ${label}`}
      title={copied ? 'Đã sao chép' : 'Sao chép'}
    >
      {copied ? <CheckIcon className="h-4 w-4 text-success" /> : <CopyIcon className="h-4 w-4" />}
    </button>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="grid gap-1 bg-ground px-5 py-4 sm:grid-cols-[11rem_1fr] sm:items-center sm:gap-4">
      <dt className="text-sm font-medium text-ink-2">{label}</dt>
      <dd className="min-w-0 break-words text-[16px] font-semibold">{children}</dd>
    </div>
  );
}

/** Danh sách yêu cầu tư vấn của thành viên (dữ liệu thật từ /api/contact/mine) */
function RequestsPanel() {
  const [state, setState] = useState({ status: 'loading', items: [] });

  useEffect(() => {
    let alive = true;
    contactApi
      .mine()
      .then(({ requests }) => alive && setState({ status: 'ready', items: requests }))
      .catch((e) => alive && setState({ status: 'error', items: [], message: e.message }));
    return () => { alive = false; };
  }, []);

  return (
    <Panel
      title="Yêu cầu tư vấn của bạn"
      action={<Button as="a" href="/#lien-he" variant="soft" size="sm">Gửi yêu cầu mới</Button>}
    >
      {state.status === 'loading' && (
        <div className="grid place-items-center py-10 text-action" role="status" aria-label="Đang tải">
          <Spinner className="h-6 w-6" />
        </div>
      )}
      {state.status === 'error' && <Alert>{state.message}</Alert>}
      {state.status === 'ready' && state.items.length === 0 && (
        <div className="flex flex-col items-start gap-4 bg-ground px-5 py-8">
          <p className="max-w-[46ch] text-ink">
            Bạn chưa gửi yêu cầu nào. Khi bạn gửi yêu cầu tư vấn lúc đang đăng nhập, yêu cầu sẽ hiện ở đây cùng trạng thái xử lý.
          </p>
          <a href="/#lien-he" className="inline-flex items-center gap-2 font-semibold text-action">
            Gửi yêu cầu đầu tiên <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>
      )}
      {state.status === 'ready' && state.items.length > 0 && (
        <ul className="grid gap-1">
          {state.items.map((r) => (
            <li key={r.id} className="flex items-center justify-between gap-4 bg-ground px-5 py-4">
              <div className="min-w-0">
                <p className="font-semibold">{needLabel(r.need)}</p>
                <p className="text-sm text-ink-2">
                  Gửi lúc {fmtDateTime(r.createdAt)}
                  {r.message ? ` · ${r.message.length > 60 ? r.message.slice(0, 60) + '…' : r.message}` : ''}
                </p>
              </div>
              <span className={`shrink-0 px-3 py-1 text-sm font-semibold ${STATUS_TONE[r.status] ?? STATUS_TONE.NEW}`}>
                {STATUS_LABEL[r.status] ?? r.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

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
    <div className="min-h-dvh bg-ground">
      <Navbar />

      <main className={`${CONTAINER} max-w-[1200px] pb-20`}>
        {welcome && <Alert type="success" className="mb-6">Tạo tài khoản thành công. Chào mừng bạn đến với Bali Home!</Alert>}

        {/* ========== Hồ sơ ========== */}
        <section className="animate-rise overflow-hidden bg-ground-2">
          {/* Banner: mảng navy phẳng + lục giác motif bị cắt ở mép phải */}
          <div className="relative h-32 overflow-hidden bg-motif sm:h-40" aria-hidden="true">
            <div className="hex hex-ratio absolute -right-6 top-1/2 w-40 -translate-y-1/2 bg-action sm:right-16 sm:w-48" />
            <div className="hex hex-ratio absolute right-36 top-1/2 hidden w-9 -translate-y-1/2 bg-accent-500 sm:right-64 sm:block" />
          </div>

          <div className="relative px-5 pb-7 sm:px-8 sm:pb-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                {/* Avatar lục giác, viền = màu nền thẻ (vẽ bằng 2 lớp lục giác) */}
                <span className="hex hex-ratio -mt-14 grid w-28 shrink-0 place-items-center bg-ground-2 sm:-mt-16 sm:w-32">
                  <span className="hex hex-ratio grid w-[88%] place-items-center bg-action text-3xl font-extrabold text-on-action">
                    {initials(user.fullName)}
                  </span>
                </span>
                <div className="min-w-0 sm:pb-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h1 className="break-words text-[2rem] font-extrabold leading-tight tracking-[-0.03em]">{user.fullName}</h1>
                    <span className={`px-2.5 py-1 text-sm font-semibold ${isAdmin ? 'bg-[color-mix(in_srgb,var(--signal)_14%,var(--ground))] text-signal' : 'bg-ground-3 text-ink'}`}>
                      {isAdmin ? 'Quản trị viên' : 'Thành viên'}
                    </span>
                  </div>
                  <p className="mt-1 break-all text-ink-2">{user.email}</p>
                </div>
              </div>
              <Button variant="danger" onClick={onLogout} loading={leaving} className="w-full sm:w-auto">
                <LogoutIcon className="h-5 w-5" /> Đăng xuất
              </Button>
            </div>

            {/* Chỉ số nhanh: chữ số lớn, nhãn nhỏ — không ô icon */}
            <dl className="mt-8 grid gap-1 sm:grid-cols-3">
              {[
                ['Ngày tham gia', fmtDate(user.createdAt), `Thành viên từ ${timeAgo(user.createdAt)}`],
                ['Đăng nhập gần nhất', fmtDateTime(user.lastLoginAt), timeAgo(user.lastLoginAt)],
                ['Mã thành viên', memberCode(user.id), 'Đọc mã này khi liên hệ hỗ trợ'],
              ].map(([label, value, sub]) => (
                <div key={label} className="bg-ground px-5 py-4">
                  <dt className="text-sm font-medium text-ink-2">{label}</dt>
                  <dd className="mt-1 text-[19px] font-bold tabular-nums">{value}</dd>
                  <dd className="text-sm text-ink-2">{sub}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ========== Chi tiết ========== */}
        <div className="mt-6 grid items-start gap-6 lg:grid-cols-5">
          <div className="grid gap-6 lg:col-span-3">
            <RequestsPanel />

            <Panel title="Thông tin cá nhân">
              <dl className="grid gap-1">
                <InfoRow label="Họ và tên">{user.fullName}</InfoRow>
                <InfoRow label="Email">
                  <span className="break-all">{user.email}</span>
                  <CopyButton value={user.email} label="email" />
                </InfoRow>
                <InfoRow label="Số điện thoại">
                  {user.phone ? (
                    <>
                      <span className="tabular-nums">{fmtPhone(user.phone)}</span>
                      <CopyButton value={user.phone} label="số điện thoại" />
                    </>
                  ) : (
                    <span className="font-medium text-ink-2">Chưa cập nhật</span>
                  )}
                </InfoRow>
                <InfoRow label="Mã thành viên">
                  <span className="tabular-nums">{memberCode(user.id)}</span>
                  <CopyButton value={memberCode(user.id)} label="mã thành viên" />
                </InfoRow>
              </dl>
            </Panel>
          </div>

          <div className="grid gap-6 lg:col-span-2">
            <Panel title="Giao diện">
              <ThemeSelector />
              <p className="mt-3 text-sm text-ink-2">“Theo hệ thống” tự đổi sáng/tối theo cài đặt của máy hoặc điện thoại.</p>
            </Panel>

            <Panel title="Bảo mật">
              <ul className="grid gap-1">
                {[
                  ['Mật khẩu', 'Được mã hoá an toàn, Bali Home không xem được.'],
                  ['Phiên đăng nhập', 'Đang hoạt động trên thiết bị này.'],
                  ['Hoạt động gần nhất', fmtDateTime(user.lastLoginAt)],
                ].map(([t, d]) => (
                  <li key={t} className="flex items-start gap-3 bg-ground px-5 py-4">
                    <span className="hex hex-ratio mt-1.5 w-3 shrink-0 bg-success" aria-hidden="true" />
                    <span>
                      <span className="block font-semibold">{t}</span>
                      <span className="block text-sm text-ink-2">{d}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-ink-2">Thấy hoạt động lạ? Hãy đăng xuất và liên hệ Bali Home.</p>
            </Panel>
          </div>
        </div>
      </main>
    </div>
  );
}
