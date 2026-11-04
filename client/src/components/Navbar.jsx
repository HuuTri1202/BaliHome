import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrandMark from './BrandMark.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { Button } from './ui/Button.jsx';
import { UserIcon } from './ui/icons.jsx';

/* Menu viên thuốc kính mờ ở giữa (mục đang mở = viên đậm), giống mẫu tham khảo */
const LINKS = [
  ['Trang chủ', '/'],
  ['Dịch vụ', '/dich-vu'],
  ['Cách làm việc', '/#cach-lam-viec'],
  ['Thành viên', '/#thanh-vien'],
  ['Liên hệ', '/#lien-he'],
];

export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'BH';

export const CONTAINER = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12';

const pill = (active) =>
  `rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors ${active ? 'bg-ink text-ground' : 'text-ink hover:bg-ground/60'}`;

/**
 * @param floating true = nằm đè trong khung hero (trang chủ); false = thanh dính đầu trang (các trang khác)
 */
export default function Navbar({ floating = false }) {
  const { user, status } = useAuth();
  const { pathname } = useLocation();

  return (
    <header className={floating ? 'absolute inset-x-0 top-0 z-30' : 'sticky top-0 z-40 bg-ground/80 backdrop-blur-xl'}>
      <div className={`flex h-20 items-center justify-between gap-4 ${floating ? 'px-5 sm:px-8' : CONTAINER} lg:h-24`}>
        <BrandMark />

        <nav className="glass hidden items-center gap-1 rounded-full p-1.5 xl:flex" aria-label="Điều hướng chính">
          {LINKS.map(([label, href]) =>
            href.startsWith('/#') ? (
              <a key={href} href={href} className={pill(false)}>{label}</a>
            ) : (
              <NavLink key={href} to={href} end={href === '/'} className={({ isActive }) => pill(isActive && (href !== '/' || pathname === '/'))}>
                {label}
              </NavLink>
            )
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {status === 'loading' ? (
            <span className="glass h-11 w-11 animate-pulse rounded-full" aria-hidden="true" />
          ) : user ? (
            <NavLink to="/tai-khoan" className="glass grid h-11 w-11 place-items-center rounded-full text-xs font-bold text-ink transition-transform hover:-translate-y-px" aria-label={`Tài khoản của ${user.fullName}`} title={user.fullName}>
              {initials(user.fullName)}
            </NavLink>
          ) : (
            <Link to="/dang-nhap" className="glass grid h-11 w-11 place-items-center rounded-full text-ink transition-transform hover:-translate-y-px" aria-label="Đăng nhập" title="Đăng nhập">
              <UserIcon className="h-5 w-5" />
            </Link>
          )}
          <Button as="a" href="/#lien-he" size="md" bubble className="hidden sm:inline-flex">
            Bắt đầu dự án
          </Button>
        </div>
      </div>
    </header>
  );
}
