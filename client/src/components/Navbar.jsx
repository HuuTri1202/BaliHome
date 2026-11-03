import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrandMark from './BrandMark.jsx';
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

      <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-600 lg:flex" aria-label="Điều hướng chính">
        {LINKS.map(([label, href]) => (
          <a key={href} href={href} className="transition-colors hover:text-slate-900">{label}</a>
        ))}
      </nav>

      {/* Giữ chỗ cố định khi đang kiểm tra phiên → không nhấp nháy nút */}
      <div className="flex min-w-[180px] items-center justify-end gap-2">
        {status === 'loading' ? (
          <div className="h-10 w-40 animate-pulse rounded-full bg-slate-900/5" />
        ) : user ? (
          <NavLink
            to="/tai-khoan"
            className="flex items-center gap-2.5 rounded-full bg-white/70 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-900/5 backdrop-blur transition hover:bg-white"
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
            <Button as={Link} to="/dang-nhap" variant="ghost" size="sm" className="rounded-full">
              Đăng nhập
            </Button>
            <Button
              as={Link}
              to="/dang-ky"
              size="sm"
              className="rounded-full"
              style={accent ? { backgroundColor: accent, transition: 'background-color .6s' } : undefined}
            >
              Đăng ký
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
