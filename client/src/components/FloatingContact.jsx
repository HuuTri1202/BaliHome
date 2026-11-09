import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowUpIcon, FacebookIcon, PhoneIcon } from './ui/icons.jsx';
import { CONTACT, SOCIAL_LINKS, toTelHref } from '../data/siteContact.js';

const SCROLL_TOP_THRESHOLD_PX = 600;
const ZALO_BLUE = '#0068ff';
const FACEBOOK_BLUE = '#1877f2';
const ROUND_BUTTON = 'relative grid place-items-center rounded-full shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95';
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

function HotlineButton({ hotline }) {
  return (
    <a href={toTelHref(hotline)} aria-label={`Gọi hotline ${hotline}`} className={`group bg-emerald-600 text-white ${ROUND_BUTTON} ${CONTACT_BUTTON_SIZE}`}>
      {/* Sóng lan toả; tắt hẳn khi người dùng bật giảm chuyển động */}
      <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" aria-hidden="true" />
      <PhoneIcon className="relative h-5 w-5 sm:h-6 sm:w-6" />
      <Tooltip>Gọi ngay cho chúng tôi</Tooltip>
    </a>
  );
}

/** Nút mở kênh ngoài (Zalo, Facebook) ở tab mới */
function ExternalContactButton({ href, tooltip, color, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${tooltip} (mở tab mới)`}
      style={{ backgroundColor: color }}
      className={`group text-white ${ROUND_BUTTON} ${CONTACT_BUTTON_SIZE}`}
    >
      {children}
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
      className={`group h-11 w-11 bg-ink text-ground sm:h-12 sm:w-12 ${ROUND_BUTTON} ${isVisible ? 'visible opacity-100' : 'invisible opacity-0'}`}
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
 * Cụm nút liên hệ nổi ở góc phải dưới: lên đầu trang, Facebook, Zalo, hotline (từ trên xuống).
 * Số điện thoại và các link lấy từ data/siteContact.js; mục chưa điền thì tự ẩn.
 * Không hiện trong trang quản trị.
 */
export default function FloatingContact() {
  const { pathname } = useLocation();
  const isPastThreshold = useHasScrolledPast(SCROLL_TOP_THRESHOLD_PX);
  if (pathname.startsWith('/quan-tri')) return null;

  const { hotline } = CONTACT;
  const socialUrl = (name) => SOCIAL_LINKS.find(({ label }) => label === name)?.href;
  const facebookUrl = socialUrl('Facebook');
  const zaloUrl = socialUrl('Zalo');

  return (
    <aside aria-label="Liên hệ nhanh" className="fixed bottom-6 right-6 z-40 flex flex-col items-center gap-3">
      <ScrollTopButton isVisible={isPastThreshold} />
      {facebookUrl && (
        <ExternalContactButton href={facebookUrl} tooltip="Fanpage Bali Home" color={FACEBOOK_BLUE}>
          <FacebookIcon className="h-6 w-6 sm:h-7 sm:w-7" />
        </ExternalContactButton>
      )}
      {zaloUrl && (
        <ExternalContactButton href={zaloUrl} tooltip="Chat Zalo tư vấn" color={ZALO_BLUE}>
          <span className="text-[13px] font-extrabold tracking-tight sm:text-[15px]" aria-hidden="true">Zalo</span>
        </ExternalContactButton>
      )}
      {hotline && <HotlineButton hotline={hotline} />}
    </aside>
  );
}
