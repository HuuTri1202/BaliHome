import { Link, useLocation } from 'react-router-dom';

/* Đường cắt theo đúng khung lục giác trong ảnh logo → bỏ nền trắng vuông, chỉ còn lục giác */
const LOGO_CLIP = 'polygon(50% 5.5%, 89% 27.6%, 89% 72.6%, 50% 94.5%, 11% 72.6%, 11% 27.6%)';

const LOGO_MASK = 'url(/icons/logo-mask.png) center / contain no-repeat';
// --ink luôn tương phản với nền Header: logo trắng trên nền sáng và logo đen trên nền tối vẫn thấy được
const LOGO_OUTLINE = 'drop-shadow(0 0 1px var(--ink))';

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

/** Lục giác logo một màu: phần nét lấy từ ảnh mask, màu là màu nền → đổi màu mượt bằng CSS */
function TintedLogoHex({ color }) {
  return (
    <span
      aria-hidden="true"
      className="block h-full w-full transition-colors duration-300"
      style={{ backgroundColor: color, WebkitMask: LOGO_MASK, mask: LOGO_MASK, clipPath: LOGO_CLIP }}
    />
  );
}

/**
 * Logo + chữ "BALI HOME" giãn rộng.
 * @param {{ light?: boolean, color?: { value: string, needsOutline: boolean } | null }} props
 *   light = chữ trắng (đặt trên mảng tối cố định); color = màu khách chọn, null là logo nguyên bản
 */
export default function BrandMark({ light = false, color = null }) {
  const outlineStyle = color?.needsOutline ? { filter: LOGO_OUTLINE } : undefined;
  return (
    <HomeLink className="group inline-flex shrink-0 items-center gap-3">
      {/* Xoay ở thẻ ngoài, đổi màu ở thẻ trong: một phần tử chỉ giữ được một khai báo transition */}
      <span className="block h-10 w-10 transition-transform duration-500 group-hover:rotate-[60deg]" style={outlineStyle}>
        {color ? <TintedLogoHex color={color.value} /> : <LogoHex className="h-full w-full" />}
      </span>
      {/* text-ink là token theo giao diện: chữ tối trên nền sáng, chữ sáng trên nền tối */}
      <span
        className={`hidden text-[13px] font-semibold uppercase tracking-[0.32em] transition-colors duration-300 sm:inline ${light ? 'text-white' : 'text-ink'}`}
        style={{ color: color?.value, ...outlineStyle }}
      >
        Bali Home
      </span>
    </HomeLink>
  );
}
