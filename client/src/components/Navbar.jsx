import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrandMark from './BrandMark.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { Button } from './ui/Button.jsx';

const LINKS = [
  ['Giới thiệu', '/#gioi-thieu'],
  ['Dịch vụ', '/#dich-vu'],
  ['Dự án', '/#du-an'],
  ['Liên hệ', '/#lien-he'],
];

export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'BH';

export default function Navbar({ accent }) {
  const { user, status } = useAuth();

  return (
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-8">
      <BrandMark />

      <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex dark:text-slate-300" aria-label="Điều hướng chính">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href} className="transition-colors hover:text-slate-900 dark:hover:text-white">{label}</a>
        ))}
      </nav>

      {/* Giữ chỗ cố định khi đang kiểm tra phiên → không nhấp nháy nút */}
      <div className="flex items-center justify-end gap-2 sm:min-w-[220px]">
        <ThemeToggle />
        {status === 'loading' ? (
          <div className="h-10 w-36 animate-pulse rounded-full bg-slate-900/5 dark:bg-white/10" />
        ) : user ? (
          <NavLink
            to="/tai-khoan"
            className="flex items-center gap-2.5 rounded-full bg-white/70 py-1.5 pl-1.5 pr-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 backdrop-blur transition hover:bg-white sm:pr-4 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-white/10 dark:hover:bg-slate-800"
          >
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: accent ?? 'var(--color-brand-500)' }}
            >
              {initials(user.fullName)}
            </span>
            <span className="hidden max-w-[140px] truncate sm:inline">{user.fullName}</span>
          </NavLink>
        ) : (
          <>
            <Button as={Link} to="/dang-nhap" variant="ghost" size="sm" className="hidden rounded-full sm:inline-flex">
              Đăng nhập
            </Button>
            <Button
              as={Link}
              to="/dang-ky"
              size="sm"
              className="rounded-full"
              style={accent ? { backgroundColor: accent } : undefined}
            >
              Đăng ký
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
