import { useId } from 'react';
import { Link, useLocation } from 'react-router-dom';

/* Đường cắt theo đúng khung lục giác trong ảnh logo → bỏ nền trắng vuông, chỉ còn lục giác */
const LOGO_CLIP = 'polygon(50% 5.5%, 89% 27.6%, 89% 72.6%, 50% 94.5%, 11% 72.6%, 11% 27.6%)';

/** Lục giác logo (dùng riêng ở nhiều chỗ) */
export function LogoHex({ className = 'h-11 w-11' }) {
  // logo-144.png (25 KB) đủ nét cho cỡ tối đa 48px trên màn hình 3x; logo.png gốc 1024px nặng gần 700 KB
  return <img src="/logo-144.png" alt="" width="44" height="44" decoding="async" className={`object-contain ${className}`} style={{ clipPath: LOGO_CLIP }} />;
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

/*
 * Chữ "A" vẽ theo chữ A trong logo lục giác (không có thanh ngang):
 *  - dải chéo dày bên phải, đi từ đỉnh xuống góc phải;
 *  - bên trái: chân trái + thanh đáy + móc ngược lên (dáng chữ G), tam giác đỏ nằm trong móc.
 * Hình dáng lấy từ logo gốc, nét làm dày hơn cho cân với chữ Montserrat ExtraBold bên cạnh.
 * Khung 126 × 100 (rộng × cao), chân chữ ở y = 100. Các cạnh xiên song song theo đúng 2 hướng của logo.
 */
const LOGO_A_WIDTH = 126;
const LOGO_A_HEIGHT = 100;
const LOGO_A_RIGHT_BAND = '44.5,15 63,0 126,100 98,100';
const LOGO_A_LEFT_HOOK = '0,100 92,100 66.8,60 48,60 55.6,72 62,72 69.6,84 32.2,84 56.4,46 42,34';
const LOGO_A_RED_TRIANGLE = '48,61 55,72 45,72';

function LogoLetterA() {
  const gradientId = `logo-a${useId().replace(/:/g, '')}`; // mỗi chữ A một id riêng (Header + chân trang cùng lúc)
  return (
    <svg
      viewBox={`0 0 ${LOGO_A_WIDTH} ${LOGO_A_HEIGHT}`}
      aria-hidden="true"
      // Cao bằng chữ in hoa của Montserrat (~0.7em), đặt trên đường chân chữ như một ký tự thường
      style={{ height: '0.7em', width: `${(0.7 * LOGO_A_WIDTH) / LOGO_A_HEIGHT}em`, margin: '0 0.04em', verticalAlign: 'baseline', display: 'inline-block' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
      </defs>
      <polygon points={LOGO_A_RIGHT_BAND} fill={`url(#${gradientId})`} />
      <polygon points={LOGO_A_LEFT_HOOK} fill={`url(#${gradientId})`} />
      <polygon points={LOGO_A_RED_TRIANGLE} fill="#e5232d" />
    </svg>
  );
}

/**
 * Chữ thương hiệu "BALIHOME": viết liền, in hoa, Montserrat ExtraBold; chữ A vẽ theo logo.
 * Màu và cỡ chữ do nơi dùng truyền vào qua className (chữ A giữ màu xanh–đỏ của logo).
 */
export function Wordmark({ className = '' }) {
  return (
    <span className={`font-wordmark font-extrabold uppercase leading-none tracking-[0.01em] whitespace-nowrap ${className}`}>
      <span className="sr-only">BALIHOME</span>
      <span aria-hidden="true">B<LogoLetterA />LIHOME</span>
    </span>
  );
}

/**
 * Logo + chữ "BALIHOME".
 * @param {{ light?: boolean }} props light = chữ trắng (đặt trên mảng tối cố định, vd. trang đăng nhập)
 */
export default function BrandMark({ light = false }) {
  // text-ink là token theo giao diện: chữ tối trên nền sáng, chữ sáng trên nền tối
  const textClass = light ? 'text-white' : 'text-ink';
  return (
    <HomeLink className="group inline-flex shrink-0 items-center gap-3">
      <LogoHex className="h-10 w-10 transition-transform duration-500 group-hover:rotate-[60deg]" />
      <Wordmark className={`hidden text-[1.375rem] transition-colors duration-300 sm:inline ${textClass}`} />
    </HomeLink>
  );
}
