import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { HomeLink, LogoHex } from '../BrandMark.jsx';
import { initials } from '../Navbar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../../lib/api.js';
import { HomeIcon, ChatIcon, UserIcon, GridIcon, ArrowUpRightIcon, LogoutIcon, BellIcon, SearchIcon } from '../ui/icons.jsx';

/* =============================================================================
 * Khung trang quản trị (dark luxury): sidebar + thanh tìm kiếm / chuông / avatar.
 * Luôn tối, không phụ thuộc chế độ sáng/tối của website (class dark + admin-shell).
 * hero: phần tử nằm dưới thanh trên cùng (trang Tổng quan dùng cảnh hoàng hôn).
 * ========================================================================== */
const NAV = [
  ['/quan-tri', 'Tổng quan', HomeIcon, true],
  ['/quan-tri/yeu-cau', 'Yêu cầu', ChatIcon],
  ['/quan-tri/khach-hang', 'Khách hàng', UserIcon],
  ['/quan-tri/dich-vu', 'Dịch vụ', GridIcon],
];

const navClass = ({ isActive }) =>
  `flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-2.5 text-[15px] font-medium transition-colors ${
    isActive ? 'bg-ground-3 text-action' : 'text-ink-2 hover:bg-ground-2 hover:text-ink'
  }`;

export default function AdminLayout({ title, subtitle, actions, hero, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname, search: urlQuery } = useLocation();
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ newRequests: 0, awaitingReply: 0 });

  // Ô tìm kiếm luôn khớp từ khoá đang lọc trên URL của trang Yêu cầu
  useEffect(() => {
    setSearch(pathname === '/quan-tri/yeu-cau' ? new URLSearchParams(urlQuery).get('q') ?? '' : '');
  }, [pathname, urlQuery]);

  // Chuông: yêu cầu mới + khách nhắn chưa trả lời; làm mới mỗi khi chuyển trang
  useEffect(() => {
    let alive = true;
    adminApi
      .stats()
      .then((s) => alive && setCounts({ newRequests: s.byStatus?.NEW ?? 0, awaitingReply: s.awaitingReply ?? 0 }))
      .catch(() => {});
    return () => { alive = false; };
  }, [pathname]);
  const bellCount = counts.newRequests + counts.awaitingReply;
  const bellLabel = `${counts.newRequests} yêu cầu mới, ${counts.awaitingReply} khách chờ trả lời`;
  const bellTarget = counts.awaitingReply ? '/quan-tri/yeu-cau?awaiting=1' : '/quan-tri/yeu-cau?status=NEW';

  const onSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    navigate(q ? `/quan-tri/yeu-cau?q=${encodeURIComponent(q)}` : '/quan-tri/yeu-cau');
  };

  const onLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-shell dark min-h-dvh bg-ground text-ink lg:grid lg:grid-cols-[236px_1fr]">
      {/* ---------- Sidebar ---------- */}
      <aside className="flex flex-col gap-4 bg-ground-2/60 px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:gap-8 lg:px-4 lg:py-8">
        <HomeLink className="flex items-center gap-3 px-2 lg:flex-col lg:gap-3 lg:text-center">
          <LogoHex className="h-10 w-10 lg:h-12 lg:w-12" />
          <span>
            <span className="block text-[13px] font-semibold uppercase tracking-[0.3em]">Bali Home</span>
            <span className="mt-1 block text-[10px] uppercase tracking-[0.24em] text-ink-2">Quản trị hệ thống</span>
          </span>
        </HomeLink>

        <nav aria-label="Menu quản trị" className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {NAV.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end} className={navClass}>
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto hidden lg:block">
          <p className="px-2 font-display text-[15px] italic leading-relaxed text-ink-2">Một đầu mối cho mọi việc của thương hiệu.</p>
          <span className="mt-3 ml-2 block h-px w-14 bg-action/60" aria-hidden="true" />
          <div className="mt-6 grid gap-1">
            <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] text-ink-2 transition-colors hover:bg-ground-2 hover:text-ink">
              <ArrowUpRightIcon className="h-5 w-5" /> Về website
            </Link>
            <button type="button" onClick={onLogout} className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[15px] text-ink-2 transition-colors hover:bg-ground-2 hover:text-signal">
              <LogoutIcon className="h-5 w-5" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* ---------- Nội dung ---------- */}
      <div className="relative min-w-0">
        {hero}
        <header className="relative z-20 flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
          <form onSubmit={onSearch} role="search" className="glass flex min-w-0 max-w-md flex-1 items-center gap-2 rounded-full py-1.5 pl-5 pr-1.5">
            <label htmlFor="admin-global-search" className="sr-only">Tìm yêu cầu</label>
            <input
              id="admin-global-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm mã yêu cầu, khách, số điện thoại…"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-2"
            />
            <button type="submit" aria-label="Tìm" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-action text-on-action transition-colors hover:bg-action-hover">
              <SearchIcon className="h-4 w-4" />
            </button>
          </form>
          <div className="ml-auto flex items-center gap-2">
            <Link to={bellTarget} aria-label={bellLabel} title={bellLabel} className="glass relative grid h-11 w-11 place-items-center rounded-full">
              <BellIcon className="h-5 w-5" />
              {bellCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-action px-1 text-[11px] font-bold tabular-nums text-on-action">{bellCount > 99 ? '99+' : bellCount}</span>
              )}
            </Link>
            <Link to="/tai-khoan" title={user?.fullName} aria-label={`Tài khoản của ${user?.fullName}`} className="grid h-11 w-11 place-items-center rounded-full bg-ink text-sm font-bold text-ground">
              {initials(user?.fullName)}
            </Link>
          </div>
        </header>

        <main className="relative z-10 px-4 pb-16 sm:px-6 lg:px-8">
          {title && (
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[2.5rem] font-normal leading-[1.05] sm:text-[3rem]">{title}</h1>
                {subtitle && <p className="mt-2 text-ink-2">{subtitle}</p>}
              </div>
              {actions}
            </div>
          )}
          {children}
          <button type="button" onClick={onLogout} className="mt-10 flex items-center gap-2 text-ink-2 lg:hidden">
            <LogoutIcon className="h-5 w-5" /> Đăng xuất
          </button>
        </main>
      </div>
    </div>
  );
}
