import { Link } from 'react-router-dom';
import BrandMark from '../BrandMark.jsx';
import LogoCanvas from '../LazyLogoCanvas.jsx';
import { THEMES } from '../../data/themes.js';
import { ArrowLeftIcon, CheckIcon } from '../ui/icons.jsx';

const SLOGAN = 'Một đầu mối cho mọi nhu cầu thương hiệu.';
const SLOGAN_DETAIL = 'Thiết kế, in ấn, website, nội dung và marketing: Bali Home lo trọn từ ý tưởng đến thành phẩm.';

const PERKS = [
  'Theo dõi từng yêu cầu bằng mã BLH riêng',
  'Nhắn tin trực tiếp với đội ngũ Bali Home',
  'Thông tin liên hệ được điền sẵn cho lần sau',
];

/** Các khối gradient trôi chậm phía sau. Tắt chuyển động khi người dùng bật giảm chuyển động. */
function GradientOrbs({ isCompact = false }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className={`absolute rounded-full bg-[radial-gradient(circle,var(--color-brand-500),transparent_65%)] opacity-70 blur-2xl motion-safe:animate-drift ${isCompact ? '-left-16 -top-24 h-64 w-64' : '-left-32 -top-40 h-[34rem] w-[34rem]'}`} />
      <div className={`absolute rounded-full bg-[radial-gradient(circle,var(--color-accent-500),transparent_65%)] opacity-40 blur-2xl motion-safe:animate-drift [animation-delay:-9s] ${isCompact ? '-right-20 top-6 h-56 w-56' : '-bottom-40 -right-24 h-[30rem] w-[30rem]'}`} />
      {!isCompact && (
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,#8b5cf6,transparent_65%)] opacity-25 blur-3xl" />
      )}
      {/* Lưới mảnh mờ dần về phía dưới: tạo chiều sâu mà không tranh chỗ với nội dung */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.05)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" />
    </div>
  );
}

/** Desktop (lg+): nửa trái màn hình, nền tối với logo 3D, slogan và lợi ích thành viên */
export function AuthBrandPanel() {
  return (
    <aside className="relative hidden w-1/2 max-w-[760px] flex-col overflow-hidden border-r border-white/10 bg-slate-950 p-10 text-white lg:flex xl:p-14">
      <GradientOrbs />
      <div className="relative flex items-center justify-between">
        <BrandMark light />
        <Link to="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
          <ArrowLeftIcon className="h-4 w-4" /> Quay lại trang chủ
        </Link>
      </div>

      <div className="relative my-6 flex flex-1 items-center justify-center">
        <div className="relative aspect-square w-[min(70%,380px)]">
          <div className="absolute inset-[12%] rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
          <LogoCanvas theme={THEMES[0]} className="absolute inset-0 h-full w-full" />
        </div>
      </div>

      <div className="relative">
        <h2 className="max-w-[16ch] font-display text-[2.75rem] leading-[1.05] xl:text-[3.25rem]">{SLOGAN}</h2>
        <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-slate-300">{SLOGAN_DETAIL}</p>
        <ul className="mt-8 grid gap-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-center gap-3 text-[15px] text-slate-200">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 ring-1 ring-white/15" aria-hidden="true">
                <CheckIcon className="h-3.5 w-3.5" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

/** Điện thoại / máy tính bảng (< lg): dải tối gọn phía trên form, giữ nhận diện mà không đẩy form xuống quá sâu */
export function AuthBrandHeader({ actions }) {
  return (
    <header className="relative overflow-hidden bg-slate-950 px-5 pb-14 pt-5 text-white sm:px-10 lg:hidden">
      <GradientOrbs isCompact />
      <div className="relative flex items-center justify-between gap-3">
        <BrandMark light />
        <div className="flex items-center gap-1">
          <Link to="/" className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
            <ArrowLeftIcon className="h-4 w-4" /> Trang chủ
          </Link>
          {actions}
        </div>
      </div>
      <p className="relative mt-8 max-w-[22ch] font-display text-[1.75rem] leading-[1.1] sm:text-[2.25rem]">{SLOGAN}</p>
    </header>
  );
}
