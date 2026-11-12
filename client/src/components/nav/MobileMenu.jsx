import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import NavItem from './NavItem.jsx';
import AuthButtons from './AuthButtons.jsx';
import { UserAvatar } from './UserMenu.jsx';
import QuoteButton from '../QuoteButton.jsx';
import { Spinner } from '../ui/Button.jsx';
import { CloseIcon, LogoutIcon, MenuIcon } from '../ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDismiss } from '../../hooks/useDismiss.js';
import { useSignOut } from '../../hooks/useSignOut.js';
import { accountLinksFor } from '../../data/accountLinks.js';

const PANEL_ID = 'mobile-menu';

const itemClass = (isActive) =>
  `block rounded-2xl px-4 py-3.5 text-[17px] font-semibold transition-colors ${isActive ? 'bg-ground-3 text-action' : 'text-ink hover:bg-ground-2'}`;

const accountItemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-[15px] font-medium transition-colors ${isActive ? 'bg-ground-3 text-action' : 'text-ink hover:bg-ground-2'}`;

/** Phần tài khoản trong menu: khách → Đăng nhập/Đăng ký; đã vào → thông tin + các trang tài khoản + Đăng xuất */
function MobileAccountSection() {
  const { user, status, isAdmin } = useAuth();
  const { signOut, isSigningOut } = useSignOut();
  if (status === 'loading') return null;
  if (!user) return <AuthButtons size="md" fullWidth className="mt-4 border-t border-ink/10 pt-4" />;
  return (
    <div className="mt-4 border-t border-ink/10 pt-4">
      <div className="flex items-center gap-3 px-4 pb-2">
        <UserAvatar name={user.fullName} className="w-10 text-sm" />
        <span className="min-w-0">
          <span className="block truncate font-semibold">{user.fullName}</span>
          <span className="block truncate text-sm text-ink-2">{user.email}</span>
        </span>
      </div>
      <ul className="grid gap-0.5">
        {accountLinksFor(isAdmin).map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink to={to} end={end} className={accountItemClass}><Icon className="h-5 w-5 text-ink-2" /> {label}</NavLink>
          </li>
        ))}
        <li>
          <button type="button" onClick={signOut} disabled={isSigningOut} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold text-signal hover:bg-ground-2 disabled:opacity-60">
            {isSigningOut ? <Spinner className="h-5 w-5" /> : <LogoutIcon className="h-5 w-5" />} Đăng xuất
          </button>
        </li>
      </ul>
    </div>
  );
}

/**
 * Nút hamburger + bảng menu trượt xuống (màn hình dưới lg). Hiệu ứng CSS thuần, chỉ dùng transform + opacity.
 * Bảng đặt absolute theo <header> vì `position: fixed` trong phần tử có backdrop-filter sẽ bị bó theo phần tử đó.
 * Đóng khi: chuyển trang, nhấn Esc (trả focus về nút), bấm ra ngoài.
 * @param {{ links: Array<{ label: string, href: string, end?: boolean }> }} props
 */
export default function MobileMenu({ links }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const { pathname, hash } = useLocation();
  const { status } = useAuth();
  useDismiss(isOpen, setIsOpen, rootRef, buttonRef);

  useEffect(() => { setIsOpen(false); }, [pathname, hash, status]);

  // Bấm vào mục đang ở cùng URL (vd. link cuộn tới section) thì useLocation không đổi → đóng tại đây
  const closeOnLinkClick = (event) => {
    if (event.target.closest('a')) setIsOpen(false);
  };

  return (
    <div ref={rootRef} className="lg:hidden">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={PANEL_ID}
        aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
        className="glass grid h-11 w-11 place-items-center rounded-full text-ink"
      >
        {isOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {/* `invisible` khi đóng → các link không nhận focus bằng phím Tab */}
      <nav
        id={PANEL_ID}
        aria-label="Điều hướng chính"
        onClick={closeOnLinkClick}
        className={`absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] origin-top overflow-y-auto border-b border-ink/10 bg-ground px-5 pb-6 pt-3 shadow-xl transition-[opacity,transform,visibility] duration-200 ease-out sm:px-8 ${
          isOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'
        }`}
      >
        <ul className="grid gap-1">
          {links.map(({ label, href, end }) => (
            <li key={href}>
              <NavItem href={href} end={end} className={itemClass}>{label}</NavItem>
            </li>
          ))}
        </ul>
        <MobileAccountSection />
        <QuoteButton bubble={false} className="mt-4 w-full" />
      </nav>
    </div>
  );
}
