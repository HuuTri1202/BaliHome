import { useAuth } from '../context/AuthContext.jsx';
import { useLogoColor } from '../hooks/useLogoColor.js';
import BrandMark from './BrandMark.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LogoContrastToggle from './nav/LogoContrastToggle.jsx';
import MobileMenu from './nav/MobileMenu.jsx';
import NotificationBell from './nav/NotificationBell.jsx';
import NavItem from './nav/NavItem.jsx';
import QuoteButton from './QuoteButton.jsx';

export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'BH';

export const CONTAINER = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12';

const desktopItemClass = (isActive) =>
  `rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'bg-ink text-ground' : 'text-ink hover:bg-ground-3'}`;

/**
 * Topbar duy nhất của website: dính đầu trang, nền mờ theo màu giao diện (sáng hoặc tối).
 * Desktop (từ lg): menu ngang. Điện thoại, máy tính bảng: hamburger.
 */
export default function Navbar() {
  const { user } = useAuth();
  const { color: logoColor } = useLogoColor();
  const links = [
    { label: 'Trang chủ', href: '/', end: true },
    { label: 'Dịch vụ', href: '/dich-vu' },
    { label: 'Cách làm việc', href: '/#cach-lam-viec' },
    { label: 'Tài khoản', href: user ? '/tai-khoan' : '/dang-nhap' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-ground/80 backdrop-blur-md">
      <div className={`${CONTAINER} flex h-16 items-center justify-between gap-4 lg:h-20`}>
        <div className="flex items-center gap-1">
          <BrandMark color={logoColor} />
          <LogoContrastToggle />
        </div>

        <nav aria-label="Điều hướng chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map(({ label, href, end }) => (
              <li key={label}>
                <NavItem href={href} end={end} className={desktopItemClass}>{label}</NavItem>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user && <NotificationBell />}
          {/* Ẩn bằng thẻ bọc: Button có sẵn class inline-flex, đặt `hidden` trực tiếp sẽ bị ghi đè */}
          <div className="hidden sm:block">
            <QuoteButton size="md" />
          </div>
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
