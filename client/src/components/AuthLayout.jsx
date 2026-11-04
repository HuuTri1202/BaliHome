import { Link } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import LogoCanvas from './LazyLogoCanvas.jsx';
import { THEMES } from '../data/themes.js';
import { ArrowLeftIcon } from './ui/icons.jsx';

const PERKS = [
  ['Theo dõi yêu cầu', 'Mỗi yêu cầu tư vấn được lưu lại cùng trạng thái xử lý.'],
  ['Không phải khai lại', 'Họ tên, số điện thoại được điền sẵn cho lần sau.'],
  ['An toàn', 'Mật khẩu được mã hoá; phiên đăng nhập có thể thu hồi.'],
];

/**
 * Bố cục trang xác thực (app screen):
 *  - Desktop: mảng navy phẳng bên trái — lục giác motif làm sân khấu cho logo 3D; form bên phải
 *  - Mobile : chỉ form → tập trung vào nhiệm vụ chính
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh bg-ground">
      {/* ---------- Mảng thương hiệu ---------- */}
      <aside className="relative hidden w-[44%] max-w-[700px] flex-col overflow-hidden bg-motif p-10 text-on-motif lg:flex xl:p-14">
        <BrandMark light />

        <div className="relative my-8 flex flex-1 items-center justify-center">
          <div className="hex hex-ratio hex-hero relative w-[min(78%,420px)] bg-brand-950">
            <LogoCanvas theme={THEMES[0]} className="absolute left-[8%] top-[18%] h-[64%] w-[84%]" />
          </div>
        </div>

        <div>
          <h2 className="max-w-[14ch] text-[2.5rem] font-display font-normal leading-[1.05]">Thành viên Bali Home</h2>
          <ul className="mt-8 grid gap-5">
            {PERKS.map(([t, d]) => (
              <li key={t} className="flex gap-4">
                <span className="hex hex-ratio mt-1.5 w-3 shrink-0 bg-accent-500" aria-hidden="true" />
                <span>
                  <span className="block font-bold">{t}</span>
                  <span className="block text-on-motif-2">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* ---------- Form ---------- */}
      <main className="relative flex flex-1 flex-col px-5 py-5 sm:px-10">
        <div className="flex items-center justify-between gap-3">
          <div className="lg:hidden"><BrandMark /></div>
          <div className="ml-auto flex items-center gap-1">
            <Link to="/" className="hidden items-center gap-1.5 px-3 py-2 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink sm:inline-flex">
              <ArrowLeftIcon className="h-4 w-4" /> Trang chủ
            </Link>
            <ThemeToggle />
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-[460px] flex-1 flex-col justify-center py-12">
          <div className="animate-rise">
            <h1 className="text-[2.5rem] font-display font-normal leading-[1.05] sm:text-[3rem]">{title}</h1>
            {subtitle && <p className="mt-3 text-[17px] text-ink-2">{subtitle}</p>}
          </div>
          <div className="mt-10">{children}</div>
          {footer && <div className="mt-10 text-[15px] text-ink-2">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
