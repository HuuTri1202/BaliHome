import { Link, useLocation } from 'react-router-dom';

/* Đường cắt theo đúng khung lục giác trong ảnh logo → bỏ nền trắng vuông, chỉ còn lục giác */
const LOGO_CLIP = 'polygon(50% 5.5%, 89% 27.6%, 89% 72.6%, 50% 94.5%, 11% 72.6%, 11% 27.6%)';

/** Lục giác logo (dùng riêng ở nhiều chỗ) */
export function LogoHex({ className = 'h-11 w-11' }) {
  return <img src="/logo.png" alt="" width="44" height="44" className={`object-contain ${className}`} style={{ clipPath: LOGO_CLIP }} />;
}

/** Link của mọi logo: về trang chủ; nếu đang ở trang chủ thì cuộn lên đầu trang */
export function HomeLink({ children, ...props }) {
  const { pathname } = useLocation();
  const scrollUpIfHome = () => {
    if (pathname === '/') window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <Link to="/" onClick={scrollUpIfHome} aria-label="Bali Home — về trang chủ" {...props}>
      {children}
    </Link>
  );
}

// Viền mảnh màu --ink: chữ trắng trên nền sáng (hoặc tối trên nền tối) vẫn đọc được
const TONE_CLASS = {
  white: 'text-white drop-shadow-[0_0_1px_var(--ink)]',
  dark: 'text-slate-900 drop-shadow-[0_0_1px_var(--ink)]',
};

/**
 * Logo + chữ "BALI HOME" giãn rộng.
 * @param {{ light?: boolean, tone?: 'white'|'dark'|null }} props
 *   light = chữ trắng (đặt trên mảng tối cố định); tone = màu khách chọn trên Header
 */
export default function BrandMark({ light = false, tone = null }) {
  // text-ink là token theo giao diện: chữ tối trên nền sáng, chữ sáng trên nền tối
  const textClass = TONE_CLASS[tone] ?? (light ? 'text-white' : 'text-ink');
  return (
    <HomeLink className="group inline-flex shrink-0 items-center gap-3">
      <LogoHex className="h-10 w-10 transition-transform duration-500 group-hover:rotate-[60deg]" />
      <span className={`hidden text-[13px] font-semibold uppercase tracking-[0.32em] transition-colors duration-300 sm:inline ${textClass}`}>
        Bali Home
      </span>
    </HomeLink>
  );
}
