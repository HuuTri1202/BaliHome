import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpIcon } from './ui/icons.jsx';
import { CONTACT, SOCIAL_LINKS, toTelHref } from '../data/siteContact.js';
import { useAuth } from '../context/AuthContext.jsx';
import ChatWidget from './chat/ChatWidget.jsx';

const SCROLL_TOP_THRESHOLD_PX = 600;
const REQUEST_DETAIL_PATH = /^\/tai-khoan\/yeu-cau\/[^/]+$/;
// Trang đăng nhập/đăng ký đã có ô hỗ trợ Zalo + hotline ngay dưới form; cụm nút nổi sẽ đè lên form trên điện thoại
const HIDDEN_ON = ['/quan-tri', '/dang-nhap', '/dang-ky'];
const FLOATING_BUTTON = 'relative grid place-items-center shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95';
const ICON_SHAPE = 'rounded-[28%]'; // bo theo góc của ảnh icon, che phần nền trắng ở 4 góc ảnh
const CONTACT_BUTTON_SIZE = 'h-12 w-12 sm:h-14 sm:w-14';

/** Chú thích hiện khi rê chuột hoặc Tab tới nút. Tailwind chỉ áp group-hover trên thiết bị có chuột. */
function Tooltip({ children }) {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-3 py-1.5 text-sm font-medium text-ground opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      {children}
    </span>
  );
}

function ContactIcon({ src }) {
  return <img src={src} alt="" width="56" height="56" className={`relative h-full w-full ${ICON_SHAPE}`} />;
}

function HotlineButton({ hotline }) {
  return (
    <a href={toTelHref(hotline)} aria-label={`Gọi hotline ${hotline}`} className={`group ${FLOATING_BUTTON} ${ICON_SHAPE} ${CONTACT_BUTTON_SIZE}`}>
      {/* Sóng lan toả; tắt hẳn khi người dùng bật giảm chuyển động */}
      <span className={`pointer-events-none absolute inset-0 animate-ping bg-green-500 opacity-60 motion-reduce:hidden ${ICON_SHAPE}`} aria-hidden="true" />
      <ContactIcon src="/icons/phone.png" />
      <Tooltip>Gọi ngay cho chúng tôi</Tooltip>
    </a>
  );
}

/** Nút mở kênh ngoài (Zalo, Facebook) ở tab mới */
function ExternalContactButton({ href, tooltip, iconSrc }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${tooltip} (mở tab mới)`}
      className={`group ${FLOATING_BUTTON} ${ICON_SHAPE} ${CONTACT_BUTTON_SIZE}`}
    >
      <ContactIcon src={iconSrc} />
      <Tooltip>{tooltip}</Tooltip>
    </a>
  );
}

function ScrollTopButton({ isVisible }) {
  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };
  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Lên đầu trang"
      className={`group h-11 w-11 rounded-full bg-ink text-ground sm:h-12 sm:w-12 ${FLOATING_BUTTON} ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}
    >
      <ArrowUpIcon className="h-5 w-5" />
      <Tooltip>Lên đầu trang</Tooltip>
    </button>
  );
}

function useHasScrolledPast(thresholdPx) {
  const [hasScrolledPast, setHasScrolledPast] = useState(false);
  useEffect(() => {
    const update = () => setHasScrolledPast(window.scrollY > thresholdPx);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [thresholdPx]);
  return hasScrolledPast;
}

/**
 * Cụm nút liên hệ nổi ở góc phải dưới: lên đầu trang, chat (khi đã đăng nhập), Facebook, Zalo, hotline (từ trên xuống).
 * Số điện thoại và các link lấy từ data/siteContact.js; mục chưa điền thì tự ẩn.
 * Không hiện trong trang quản trị và trang đăng nhập/đăng ký.
 */
export default function FloatingContact() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const isPastThreshold = useHasScrolledPast(SCROLL_TOP_THRESHOLD_PX);
  if (HIDDEN_ON.some((prefix) => pathname.startsWith(prefix))) return null;
  // Trang chi tiết yêu cầu đã có khung chat đầy đủ → không cần bong bóng chat
  const showChat = Boolean(user) && !REQUEST_DETAIL_PATH.test(pathname);

  const { hotline } = CONTACT;
  const socialUrl = (name) => SOCIAL_LINKS.find(({ label }) => label === name)?.href;
  const facebookUrl = socialUrl('Facebook');
  const zaloUrl = socialUrl('Zalo');

  return (
    <aside aria-label="Liên hệ nhanh" className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      <ScrollTopButton isVisible={isPastThreshold} />
      {showChat && <ChatWidget />}
      {facebookUrl && <ExternalContactButton href={facebookUrl} tooltip="Fanpage Bali Home" iconSrc="/icons/facebook.png" />}
      {zaloUrl && <ExternalContactButton href={zaloUrl} tooltip="Chat Zalo tư vấn" iconSrc="/icons/zalo.png" />}
      {hotline && <HotlineButton hotline={hotline} />}
    </aside>
  );
}
