import { useId, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { initials } from '../../lib/initials.js';
import { Spinner } from '../ui/Button.jsx';
import { ChevronDownIcon, LogoutIcon } from '../ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useDismiss } from '../../hooks/useDismiss.js';
import { useSignOut } from '../../hooks/useSignOut.js';
import { accountLinksFor } from '../../data/accountLinks.js';

/** Avatar lục giác (motif logo) với chữ cái đầu của họ tên */
export function UserAvatar({ name, className = 'w-9 text-xs' }) {
  return (
    <span className={`hex hex-ratio grid shrink-0 place-items-center bg-action font-bold text-on-action ${className}`} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

const firstName = (fullName = '') => fullName.trim().split(/\s+/).at(-1) ?? '';

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors ${isActive ? 'bg-ground-3 text-action' : 'text-ink hover:bg-ground-3'}`;

/**
 * Người đã đăng nhập: avatar + tên gọi + mũi tên (màn quá hẹp <400px chỉ còn avatar); bấm mở menu tài khoản.
 * Đóng khi chọn mục, nhấn Esc hoặc bấm ra ngoài.
 */
export default function UserMenu() {
  const { user, isAdmin } = useAuth();
  const { signOut, isSigningOut } = useSignOut();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);
  const panelId = useId();
  useDismiss(isOpen, setIsOpen, rootRef, buttonRef);

  const closeOnLinkClick = (event) => {
    if (event.target.closest('a')) setIsOpen(false);
  };

  return (
    // Dưới lg bảng căn theo <header> (như chuông thông báo) để không tràn mép trái điện thoại; từ lg căn theo nút
    <div ref={rootRef} className="lg:relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={`Tài khoản: ${user.fullName}`}
        className="glass flex h-11 items-center gap-2 rounded-full pl-1 pr-1 text-ink transition-colors hover:bg-ground-3 min-[400px]:pr-3"
      >
        <UserAvatar name={user.fullName} />
        <span className="hidden max-w-[9rem] truncate text-[15px] font-semibold min-[400px]:inline">{firstName(user.fullName)}</span>
        <ChevronDownIcon className={`hidden h-4 w-4 text-ink-2 transition-transform duration-200 min-[400px]:block ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          id={panelId}
          onClick={closeOnLinkClick}
          className="absolute right-5 top-full z-10 mt-2 w-[min(18rem,calc(100vw-2.5rem))] origin-top-right animate-rise sm:right-8 lg:right-0 overflow-hidden rounded-2xl bg-ground-2 p-2 shadow-xl ring-1 ring-ink/10"
        >
          <div className="flex items-center gap-3 px-3 pb-3 pt-2">
            <UserAvatar name={user.fullName} className="w-11 text-sm" />
            <span className="min-w-0">
              <span className="block truncate font-semibold">{user.fullName}</span>
              <span className="block truncate text-sm text-ink-2">{user.email}</span>
            </span>
          </div>
          <nav aria-label="Menu tài khoản" className="border-t border-ink/10 pt-2">
            <ul className="grid gap-0.5">
              {accountLinksFor(isAdmin).map(({ to, label, icon: Icon, end }) => (
                <li key={to}>
                  <NavLink to={to} end={end} className={itemClass}>
                    <Icon className="h-5 w-5 text-ink-2" /> {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-2 border-t border-ink/10 pt-2">
            <button
              type="button"
              onClick={signOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-signal transition-colors hover:bg-[color-mix(in_srgb,var(--signal)_10%,transparent)] disabled:opacity-60"
            >
              {isSigningOut ? <Spinner className="h-5 w-5" /> : <LogoutIcon className="h-5 w-5" />} Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
