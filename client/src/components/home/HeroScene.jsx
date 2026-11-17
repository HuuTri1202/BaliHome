import LogoCanvas from '../LazyLogoCanvas.jsx';
import QuoteButton from '../QuoteButton.jsx';
import { PlayIcon } from '../ui/icons.jsx';
import { THEMES } from '../../data/themes.js';
import HeroSearch from './HeroSearch.jsx';

/* =============================================================================
 * Hero "cinematic": hoàng hôn tím–cam, mặt nước phản chiếu, cổng vòm neon sau logo 3D, khối kính lơ lửng.
 * Toàn bộ vẽ bằng SVG/CSS (không ảnh nặng). Tiêu đề hiện ngay (là nội dung LCP), không hiệu ứng mờ dần.
 * ========================================================================== */

/** Cảnh nền: bầu trời → mặt trời → núi xa → mặt nước phản chiếu → đá tiền cảnh */
function CinematicScenery() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="hero-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#120d33" />
            <stop offset="0.38" stopColor="#3b2a7a" />
            <stop offset="0.6" stopColor="#8c5bb8" />
            <stop offset="0.74" stopColor="#e58f8f" />
            <stop offset="0.82" stopColor="#f7b27a" />
          </linearGradient>
          <radialGradient id="hero-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fff1d6" stopOpacity="0.95" />
            <stop offset="0.35" stopColor="#ffc58a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ff9f7a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f2a77d" stopOpacity="0.55" />
            <stop offset="0.35" stopColor="#6a4aa8" stopOpacity="0.85" />
            <stop offset="1" stopColor="#140f34" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#hero-sky)" />
        <circle cx="1010" cy="560" r="300" fill="url(#hero-sun)" />
        {/* núi xa → gần */}
        <path fill="#7a58b4" opacity="0.75" d="M0 600 L120 548 L240 572 L380 500 L520 552 L660 488 L800 540 L930 470 L1070 540 L1200 498 L1330 552 L1440 520 V900 H0Z" />
        <path fill="#4a3889" d="M0 628 L180 586 L330 604 L470 560 L620 592 L760 548 L900 590 L1060 552 L1220 598 L1440 566 V900 H0Z" />
        {/* mặt nước + vệt sáng phản chiếu */}
        <rect y="622" width="1440" height="278" fill="url(#hero-water)" />
        <g fill="#ffd3a3" opacity="0.55">
          <rect x="930" y="640" width="160" height="3" rx="1.5" />
          <rect x="960" y="664" width="110" height="3" rx="1.5" />
          <rect x="900" y="690" width="210" height="2" rx="1" />
          <rect x="985" y="716" width="70" height="2" rx="1" />
        </g>
        {/* đá tiền cảnh */}
        <g fill="#1a143f">
          <ellipse cx="90" cy="820" rx="190" ry="70" />
          <ellipse cx="300" cy="860" rx="160" ry="56" />
          <ellipse cx="1300" cy="826" rx="210" ry="74" />
          <ellipse cx="1120" cy="868" rx="150" ry="50" />
        </g>
        <g fill="#2a2160">
          <ellipse cx="70" cy="800" rx="120" ry="34" />
          <ellipse cx="1320" cy="804" rx="130" ry="36" />
        </g>
      </svg>
      {/* lớp tối dần phía dưới để chữ và ô tìm kiếm luôn dễ đọc */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(11_10_31/0.75)_0%,rgb(11_10_31/0.25)_55%,transparent_80%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ground to-transparent" />
    </div>
  );
}

/** Cổng vòm neon + khối kính lơ lửng quanh logo 3D (chỉ trang trí) */
function NeonStage() {
  const cubes = [
    { className: 'left-[12%] top-[10%] h-12 w-12 [--tilt:18deg] bg-[linear-gradient(135deg,#c4b5fd,#7c3aed)]', delay: '0s' },
    { className: 'right-[14%] top-[4%] h-9 w-9 [--tilt:-14deg] bg-[linear-gradient(135deg,#93c5fd,#4f46e5)]', delay: '-2s' },
    { className: 'right-[4%] top-[48%] h-10 w-10 [--tilt:26deg] bg-[linear-gradient(135deg,#fde68a,#f59e0b)]', delay: '-4s' },
    { className: 'left-[4%] bottom-[18%] h-8 w-8 [--tilt:-24deg] bg-[linear-gradient(135deg,#f0abfc,#a855f7)]', delay: '-1s' },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* cổng vòm: viền tím–xanh phát sáng */}
      <div className="absolute inset-x-[14%] bottom-[6%] top-[4%] rounded-t-full border-[14px] border-b-0 border-violet-300/70 shadow-[0_0_60px_8px_rgb(167_139_250/0.55),inset_0_0_40px_rgb(129_140_248/0.5)] [border-image:none]" />
      <div className="absolute inset-x-[16%] bottom-[6%] top-[6%] rounded-t-full border-[3px] border-b-0 border-white/60 blur-[1px]" />
      {cubes.map(({ className, delay }) => (
        <span
          key={className}
          className={`absolute rounded-lg opacity-90 shadow-[0_0_28px_rgb(167_139_250/0.6)] ring-1 ring-white/40 motion-safe:animate-hover-float ${className}`}
          style={{ animationDelay: delay, transform: 'rotate(var(--tilt))' }}
        />
      ))}
      {/* quả cầu sáng */}
      <span className="absolute bottom-[10%] right-[10%] h-12 w-12 rounded-full bg-[radial-gradient(circle_at_35%_30%,#ffffff,#c4b5fd_35%,#6d28d9_75%)] shadow-[0_0_40px_10px_rgb(167_139_250/0.55)]" />
    </div>
  );
}

export default function HeroScene() {
  return (
    <section aria-labelledby="hero-title" className="relative p-2 sm:p-3 lg:p-4">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] pb-28 ring-1 ring-white/10 lg:flex lg:min-h-[max(720px,calc(100svh-6rem))] lg:items-center lg:rounded-[2.25rem] lg:pb-32">
        <CinematicScenery />

        <div className="relative z-10 px-5 pt-14 sm:px-8 lg:max-w-[58%] lg:py-20 lg:pl-16">
          <p className="glass-card inline-flex whitespace-nowrap rounded-full px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-2 sm:text-[11px] sm:tracking-[0.22em]">
            Sáng tạo · Công nghệ · Tăng trưởng
          </p>
          {/* Không có hiệu ứng mờ dần: đây là nội dung lớn nhất màn hình đầu (LCP), cần hiện ngay */}
          <h1 id="hero-title" className="mt-6 text-balance font-display text-[clamp(2.6rem,5.4vw,5rem)] font-extrabold leading-[1.06] tracking-[-0.03em] text-white">
            Một đầu mối duy nhất <span className="text-gradient-violet">cho mọi nhu cầu tăng trưởng.</span>
          </h1>
          <p className="mt-6 max-w-[46ch] animate-rise text-[1.0625rem] leading-relaxed text-ink-2 [animation-delay:80ms] sm:text-lg">
            Thiết kế, in ấn, website, nội dung và marketing: Bali Home lo trọn từ ý tưởng đến thành phẩm.
          </p>
          <div className="mt-9 flex animate-rise flex-wrap items-center gap-5 [animation-delay:160ms]">
            <QuoteButton />
            <a href="#cach-lam-viec" className="group inline-flex items-center gap-3 text-[15px] font-semibold text-white">
              <span className="grid h-12 w-12 place-items-center rounded-full ring-1 ring-white/40 transition-colors group-hover:bg-white/10">
                <PlayIcon className="h-4 w-4 translate-x-px" />
              </span>
              Xem cách làm việc
            </a>
          </div>
        </div>

        {/* Logo 3D trong cổng vòm neon (kéo để xoay) */}
        <div className="relative mx-auto h-[340px] max-w-[460px] sm:h-[420px] lg:absolute lg:right-[3%] lg:top-1/2 lg:h-[70%] lg:w-[40%] lg:max-w-none lg:-translate-y-1/2">
          <NeonStage />
          <LogoCanvas theme={THEMES[0]} className="absolute inset-[12%]" />
        </div>
      </div>

      {/* Ô tìm dịch vụ nổi trên mép dưới khung hero */}
      <div className="relative z-20 mx-auto -mt-16 w-[min(100%-2rem,760px)] lg:-mt-20">
        <HeroSearch />
      </div>
    </section>
  );
}
