import { Link } from 'react-router-dom';

/* Đường cắt theo đúng khung lục giác trong ảnh logo → bỏ nền trắng vuông, chỉ còn lục giác */
const LOGO_CLIP = 'polygon(50% 5.5%, 89% 27.6%, 89% 72.6%, 50% 94.5%, 11% 72.6%, 11% 27.6%)';

/** Lục giác logo (dùng riêng ở nhiều chỗ) */
export function LogoHex({ className = 'h-11 w-11' }) {
  return <img src="/logo.png" alt="" width="44" height="44" className={`object-contain ${className}`} style={{ clipPath: LOGO_CLIP }} />;
}

/** Logo + tên thương hiệu. light = chữ trắng (đặt trên mảng navy cố định) */
export default function BrandMark({ light = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="Bali Home — về trang chủ">
      <LogoHex className="h-11 w-11 transition-transform duration-500 group-hover:rotate-[60deg]" />
      <span className="leading-none">
        <span className={`block text-[19px] font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'}`}>Bali Home</span>
        <span className={`mt-1 block whitespace-nowrap text-[13px] font-medium ${light ? 'text-on-motif-2' : 'text-ink-2'}`}>
          Thương mại &amp; Dịch vụ
        </span>
      </span>
    </Link>
  );
}
