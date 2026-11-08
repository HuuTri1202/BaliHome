import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import NavItem from './NavItem.jsx';
import { Button } from '../ui/Button.jsx';
import { CloseIcon, MenuIcon } from '../ui/icons.jsx';

const PANEL_ID = 'mobile-menu';

const itemClass = (isActive) =>
  `block rounded-2xl px-4 py-3.5 text-[17px] font-semibold transition-colors ${isActive ? 'bg-ground-3 text-action' : 'text-ink hover:bg-ground-2'}`;

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

  useEffect(() => { setIsOpen(false); }, [pathname, hash]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

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
        className={`absolute inset-x-0 top-full origin-top border-b border-ink/10 bg-ground px-5 pb-6 pt-3 shadow-xl transition-[opacity,transform,visibility] duration-200 ease-out sm:px-8 ${
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
        <Button as={Link} to="/bao-gia" size="lg" className="mt-4 w-full">Nhận báo giá ngay</Button>
      </nav>
    </div>
  );
}
