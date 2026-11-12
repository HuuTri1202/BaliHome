import { useAuth } from '../context/AuthContext.jsx';
import { useLogoTone } from '../hooks/useLogoTone.js';
import BrandMark from './BrandMark.jsx';
import LogoToneToggle from './nav/LogoToneToggle.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import MobileMenu from './nav/MobileMenu.jsx';
import NotificationBell from './nav/NotificationBell.jsx';
import NavItem from './nav/NavItem.jsx';
import AuthButtons from './nav/AuthButtons.jsx';
import UserMenu from './nav/UserMenu.jsx';

export const CONTAINER = 'mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12';

const LINKS = [
  { label: 'Trang chủ', href: '/', end: true },
  { label: 'Dịch vụ', href: '/dich-vu' },
  { label: 'Cách làm việc', href: '/#cach-lam-viec' },
];

const desktopItemClass = (isActive) =>
  `rounded-full px-5 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'bg-ink text-ground' : 'text-ink hover:bg-ground-3'}`;

/**
 * Góc phải Header theo trạng thái đăng nhập (AuthContext):
 *  - loading: khung giữ chỗ cùng kích thước → không nháy nút "Đăng nhập" với người đã đăng nhập
 *  - guest  : Đăng nhập + Đăng ký (từ sm; điện thoại thì nằm trong menu hamburger)
 *  - đã vào : chuông thông báo + avatar có menu tài khoản
 * key theo trạng thái → khi đăng nhập/đăng xuất, cụm mới hiện dần ra (chỉ đổi độ mờ, không dùng transform:
 * transform biến khung thành mốc định vị → dropdown của chuông/avatar bị lệch khỏi mép Header trên điện thoại).
 */
function AccountArea() {
  const { status } = useAuth();
  if (status === 'loading') return <span className="h-11 w-11 animate-pulse rounded-full bg-ground-3 sm:w-40" aria-hidden="true" />;
  if (status === 'guest') return <AuthButtons key="guest" className="hidden animate-fade-in sm:flex" />;
  return (
    <div key="user" className="flex animate-fade-in items-center gap-2">
      <NotificationBell />
      <UserMenu />
    </div>
  );
}

/**
 * Topbar duy nhất của website: dính đầu trang, nền mờ theo màu giao diện (sáng hoặc tối).
 * Desktop (từ lg): menu ngang. Điện thoại, máy tính bảng: hamburger.
 * Không đặt nút Báo giá trên thanh: CTA báo giá đã có ở Hero, khối liên hệ cuối trang và trong menu điện thoại.
 */
export default function Navbar() {
  const { tone: logoTone, toggleTone: toggleLogoTone } = useLogoTone();

  return (
    <header className="sticky top-0 z-50 border-b border-ink/5 bg-ground/80 backdrop-blur-md">
      <div className={`${CONTAINER} flex h-16 items-center justify-between gap-4 lg:h-20`}>
        <div className="flex items-center gap-1">
          <BrandMark tone={logoTone} />
          <LogoToneToggle tone={logoTone} onToggle={toggleLogoTone} />
        </div>

        <nav aria-label="Điều hướng chính" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {LINKS.map(({ label, href, end }) => (
              <li key={label}>
                <NavItem href={href} end={end} className={desktopItemClass}>{label}</NavItem>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <AccountArea />
          <MobileMenu links={LINKS} />
        </div>
      </div>
    </header>
  );
}
