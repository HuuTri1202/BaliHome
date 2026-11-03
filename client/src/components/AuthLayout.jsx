import { Link } from 'react-router-dom';
import BrandMark from './BrandMark.jsx';
import LogoCanvas from './LazyLogoCanvas.jsx';
import { THEMES } from '../data/themes.js';
import { ArrowLeftIcon, ShieldIcon, SparkIcon, ClockIcon } from './ui/icons.jsx';

const PERKS = [
  [ShieldIcon, 'Bảo mật', 'Mật khẩu được mã hoá, phiên đăng nhập an toàn.'],
  [SparkIcon, 'Ưu đãi riêng', 'Nhận thông tin khuyến mãi dành cho thành viên.'],
  [ClockIcon, 'Theo dõi dễ dàng', 'Quản lý yêu cầu và lịch sử giao dịch ở một nơi.'],
];

/**
 * Bố cục trang xác thực:
 *  - Desktop: panel thương hiệu (logo 3D) bên trái, form bên phải
 *  - Mobile : chỉ form, logo nhỏ trên cùng → tập trung vào nhiệm vụ chính
 */
export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-dvh bg-white">
      {/* ---------- Panel thương hiệu ---------- */}
      <aside className="relative hidden w-[46%] max-w-[720px] flex-col overflow-hidden bg-brand-950 p-10 text-white lg:flex xl:p-14">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full bg-brand-500/40 blur-[120px]" />
          <div className="absolute -bottom-40 -right-20 h-[420px] w-[420px] rounded-full bg-accent-500/25 blur-[120px]" />
          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:22px_22px]" />
        </div>

        <div className="relative">
          <BrandMark light />
        </div>

        <div className="relative -mx-6 my-4 min-h-[320px] flex-1">
          <LogoCanvas theme={THEMES[0]} />
        </div>

        <div className="relative">
          <h2 className="text-3xl font-black leading-tight tracking-tight xl:text-4xl">
            Kiến tạo giá trị,<br />
            <span className="bg-gradient-to-r from-brand-200 to-white bg-clip-text text-transparent">vững bước cùng bạn.</span>
          </h2>
          <ul className="mt-8 grid gap-5">
            {PERKS.map(([Icon, title, text]) => (
              <li key={title} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5 text-brand-200" />
                </span>
                <span>
                  <span className="block font-bold">{title}</span>
                  <span className="block text-sm text-white/60">{text}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-10 text-xs text-white/40">© {new Date().getFullYear()} Công ty TNHH Thương mại Dịch vụ Bali Home</p>
        </div>
      </aside>

      {/* ---------- Form ---------- */}
      <main className="relative flex flex-1 flex-col px-4 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <div className="lg:hidden"><BrandMark /></div>
          <Link to="/" className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
            <ArrowLeftIcon className="h-4 w-4" /> Trang chủ
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center py-10">
          <div className="animate-rise">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-[34px]">{title}</h1>
            {subtitle && <p className="mt-2 text-[15px] text-slate-500">{subtitle}</p>}
          </div>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 text-center text-sm text-slate-500">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
