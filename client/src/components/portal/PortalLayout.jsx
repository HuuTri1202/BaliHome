import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar, { CONTAINER, initials } from '../Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { HomeIcon, UserIcon, KeyIcon, ShieldIcon, LogoutIcon, ArrowRightIcon } from '../ui/icons.jsx';
import { Button } from '../ui/Button.jsx';

/* Khung chung cho Cổng khách hàng (/tai-khoan/*) và Quản trị (/quan-tri/*):
   menu bên trái (desktop) / thanh vuốt ngang (phone) + nội dung bên phải. */
const CUSTOMER_LINKS = [
  ['/tai-khoan', 'Tổng quan', HomeIcon, true],
  ['/tai-khoan/ho-so', 'Hồ sơ', UserIcon],
  ['/tai-khoan/bao-mat', 'Bảo mật & giao diện', KeyIcon],
];

export default function PortalLayout({ title, subtitle, actions, children, admin = false }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  const links = admin ? [['/quan-tri', 'Yêu cầu khách hàng', ShieldIcon, true]] : CUSTOMER_LINKS;
  const linkCls = ({ isActive }) =>
    `flex shrink-0 items-center gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-[15px] font-semibold transition-colors lg:rounded-2xl ${
      isActive ? 'bg-ink text-ground' : 'bg-ground-2 text-ink hover:bg-ground-3 lg:bg-transparent lg:hover:bg-ground'
    }`;

  const onLogout = async () => {
    setLeaving(true);
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <div className={`${CONTAINER} grid gap-6 pb-20 pt-4 lg:grid-cols-[260px_1fr] lg:gap-8`}>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="hidden items-center gap-3 rounded-3xl bg-ground-2 p-4 lg:flex">
            <span className="hex hex-ratio grid w-12 shrink-0 place-items-center bg-action text-sm font-bold text-on-action">{initials(user?.fullName)}</span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">{user?.fullName}</span>
              <span className="block truncate text-sm text-ink-2">{admin ? 'Quản trị viên' : user?.email}</span>
            </span>
          </div>
          <nav aria-label={admin ? 'Menu quản trị' : 'Menu tài khoản'} className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:mt-3 lg:flex-col lg:rounded-3xl lg:bg-ground-2 lg:p-2">
            {links.map(([to, label, Icon, end]) => (
              <NavLink key={to} to={to} end={end} className={linkCls}>
                <Icon className="h-5 w-5" /> {label}
              </NavLink>
            ))}
            {isAdmin && !admin && (
              <NavLink to="/quan-tri" className={linkCls}><ShieldIcon className="h-5 w-5" /> Quản trị</NavLink>
            )}
            {admin && (
              <NavLink to="/tai-khoan" end className={linkCls}><UserIcon className="h-5 w-5" /> Tài khoản của tôi</NavLink>
            )}
          </nav>
          <div className="mt-3 hidden lg:block">
            <Button variant="danger" onClick={onLogout} loading={leaving} className="w-full">
              <LogoutIcon className="h-5 w-5" /> Đăng xuất
            </Button>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-[2.5rem] font-normal leading-[1.05] sm:text-[3rem]">{title}</h1>
              {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
            </div>
            {actions}
          </header>
          <div className="mt-8">{children}</div>
          <div className="mt-10 lg:hidden">
            <Button variant="danger" onClick={onLogout} loading={leaving} className="w-full">
              <LogoutIcon className="h-5 w-5" /> Đăng xuất
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}

/** Thẻ / khối nội dung dùng trong cổng */
export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-3xl bg-ground-2 p-6 sm:p-8 ${className}`}>
      {(title || action) && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          {title && <h2 className="text-[19px] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function EmptyState({ children, to, cta }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl bg-ground p-6">
      <p className="max-w-[52ch] text-ink">{children}</p>
      {to && (
        <a href={to} className="inline-flex items-center gap-2 font-semibold text-action">
          {cta} <ArrowRightIcon className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
