import { Link } from 'react-router-dom';

/** Logo + tên thương hiệu, dùng ở navbar & trang xác thực */
export default function BrandMark({ light = false, subtitle = 'Thương mại · Dịch vụ' }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500">
      <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-900/5 transition-transform group-hover:rotate-6" />
      <span className="leading-tight">
        <span className={`block text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand-900'}`}>BALI HOME</span>
        <span className={`block text-[11px] font-medium uppercase tracking-[.18em] ${light ? 'text-white/60' : 'text-slate-500'}`}>{subtitle}</span>
      </span>
    </Link>
  );
}
