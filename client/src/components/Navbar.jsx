import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrandMark from './BrandMark.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { Button } from './ui/Button.jsx';

/* taste-skill: thanh điều hướng phẳng — wordmark, 3–5 link, MỘT hành động. Không kính mờ, không viên thuốc nổi. */
const LINKS = [
  ['Sản phẩm & dịch vụ', '/#san-pham'],
  ['Cách làm việc', '/#cach-lam-viec'],
  ['Thành viên', '/#thanh-vien'],
  ['Liên hệ', '/#lien-he'],
];

export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'BH';

export const CONTAINER = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12';

export default function Navbar() {
  const { user, status } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-ground">
      <div className={`${CONTAINER} flex h-20 items-center justify-between gap-4`}>
        <BrandMark />

        <nav className="hidden items-center gap-8 text-[15px] font-semibold text-ink-2 lg:flex" aria-label="Điều hướng chính">
          {LINKS.map(([label, href]) => (
            <a key={href} href={href} className="py-2 transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:min-w-[200px] sm:justify-end">
          <ThemeToggle />
          {status === 'loading' ? (
            <span className="h-10 w-32 animate-pulse bg-ground-2" aria-hidden="true" />
          ) : user ? (
            <NavLink to="/tai-khoan" className="group flex items-center gap-2.5 py-1.5 pl-2 text-[15px] font-semibold text-ink">
              <span className="hex hex-ratio grid w-9 place-items-center bg-action text-xs font-bold text-on-action">
                {initials(user.fullName)}
              </span>
              <span className="hidden max-w-[150px] truncate group-hover:text-action sm:inline">{user.fullName}</span>
            </NavLink>
          ) : (
            <Button as={Link} to="/dang-nhap" variant="soft" size="sm">
              Đăng nhập
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
