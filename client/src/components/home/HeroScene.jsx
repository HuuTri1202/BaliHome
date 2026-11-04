import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../Navbar.jsx';
import LogoCanvas from '../LazyLogoCanvas.jsx';
import { LogoHex } from '../BrandMark.jsx';
import { Button } from '../ui/Button.jsx';
import {
  HomeIcon, GridIcon, UserIcon, ChatIcon, PlayIcon, LayersIcon, HexagonIcon,
  ArrowRightIcon, ArrowLeftIcon, ArrowUpRightIcon,
} from '../ui/icons.jsx';
import { THEMES } from '../../data/themes.js';
import { useServices } from '../../hooks/useServices.js';
import { groupServices } from '../../data/needs.js';

/* =============================================================================
 * Hero kiểu "light luxury" (theo mẫu tham khảo người dùng chọn):
 *  khung bo lớn + cảnh nền (đồi núi vẽ SVG, đổi màu theo sáng/tối) + menu kính +
 *  thanh icon dọc + tiêu đề serif + logo 3D ở vị trí "công trình" + 3 thẻ kính nổi.
 * Logo 3D giữ nguyên như cũ (Three.js, kéo để xoay).
 * ========================================================================== */

const pad = (n) => String(n).padStart(2, '0');
const prefersReduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Cảnh nền: trời → mặt trời → 4 lớp đồi. Màu lấy từ biến CSS (--sky-*, --hill-*) → tự đổi theo chế độ */
function Scenery() {
  return (
    <div className="absolute inset-0 -z-10" aria-hidden="true" style={{ background: 'linear-gradient(180deg, var(--sky-top), var(--sky-bottom) 72%)' }}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice">
        <defs>
          <radialGradient id="bh-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="var(--sun)" stopOpacity="1" />
            <stop offset="1" stopColor="var(--sun)" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="600" cy="560" r="330" fill="url(#bh-sun)" />
        <path style={{ fill: 'var(--hill-1)' }} d="M0 610 L130 548 L240 580 L380 478 L500 530 L620 446 L740 512 L860 462 L1000 530 L1130 478 L1280 548 L1440 508 V900 H0Z" />
        <path style={{ fill: 'var(--hill-2)' }} d="M0 700 L170 646 L310 668 L470 598 L610 628 L790 392 L850 444 L905 408 L1080 566 L1220 616 L1440 586 V900 H0Z" />
        <path style={{ fill: 'var(--hill-3)' }} d="M0 768 C 250 708, 440 748, 660 726 S 1110 694, 1440 738 V900 H0Z" />
        <path style={{ fill: 'var(--hill-4)' }} d="M0 846 C 320 806, 700 866, 1010 826 S 1310 806, 1440 836 V900 H0Z" />
      </svg>
    </div>
  );
}

/** Thanh icon dọc bên trái (desktop) */
function SideRail() {
  const items = [
    [HomeIcon, 'Trang chủ', '/', true],
    [GridIcon, 'Dịch vụ', '/dich-vu'],
    [UserIcon, 'Tài khoản', '/tai-khoan'],
    [ChatIcon, 'Liên hệ', '#lien-he'],
  ];
  return (
    <nav aria-label="Lối tắt" className="glass absolute left-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full p-2 lg:flex">
      {items.map(([Icon, label, href, active]) => {
        const cls = `grid h-11 w-11 place-items-center rounded-full transition-colors ${active ? 'bg-ink text-ground' : 'text-ink hover:bg-ground/70'}`;
        return href.startsWith('#') ? (
          <a key={label} href={href} className={cls} aria-label={label} title={label}><Icon className="h-5 w-5" /></a>
        ) : (
          <Link key={label} to={href} className={cls} aria-label={label} title={label} aria-current={active ? 'page' : undefined}><Icon className="h-5 w-5" /></Link>
        );
      })}
      <span className="my-2 grid h-14 w-14 place-items-center rounded-full bg-ground" aria-hidden="true">
        <LogoHex className="h-9 w-9" />
      </span>
      <a href="#cach-lam-viec" className="group flex flex-col items-center gap-1.5 px-1 pb-2 text-center text-[11px] font-semibold leading-tight text-ink">
        <span className="grid h-11 w-11 place-items-center rounded-full border border-ink/25 transition-colors group-hover:bg-ink group-hover:text-ground">
          <PlayIcon className="h-4 w-4" />
        </span>
        Cách<br />làm việc
      </a>
    </nav>
  );
}

/** Thẻ "Dịch vụ nổi bật": trình chiếu 8 dịch vụ thật, tự chuyển 6s, dừng khi rê chuột/focus */
function FeaturedService() {
  const { services, status } = useServices();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = services.length;

  useEffect(() => {
    if (!count || paused || prefersReduced()) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count, paused]);

  if (status === 'loading') {
    return <div className="glass float-shadow h-[188px] animate-pulse rounded-[1.75rem]" aria-hidden="true" />;
  }
  // API lỗi / chưa có dữ liệu → vẫn hiện thẻ có ích thay vì khung chờ mãi
  if (!count) {
    return (
      <Link to="/dich-vu" className="glass float-shadow flex min-h-[188px] flex-col justify-between rounded-[1.75rem] p-6 transition-transform hover:-translate-y-0.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-2">Dịch vụ</span>
        <span>
          <span className="block font-display text-[1.6rem] leading-tight">In ấn, design, web và hơn thế</span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold">Xem tất cả dịch vụ <ArrowRightIcon className="h-4 w-4" /></span>
        </span>
      </Link>
    );
  }

  const s = services[index % count];
  const go = (d) => setIndex((i) => (i + d + count) % count);

  return (
    <article
      aria-roledescription="trình chiếu"
      aria-label="Dịch vụ nổi bật"
      className="glass float-shadow flex gap-4 rounded-[1.75rem] p-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative w-32 shrink-0 overflow-hidden rounded-[1.25rem] bg-motif text-on-motif sm:w-40">
        <span className="absolute left-3 top-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-on-motif-2">Nổi bật</span>
        <span className="hex hex-ratio absolute -bottom-8 -right-6 w-24 bg-action" aria-hidden="true" />
        <span className="hex hex-ratio absolute -bottom-3 right-12 w-7 bg-accent-500" aria-hidden="true" />
        <div key={s.slug} className="relative grid h-full min-h-[164px] animate-rise place-items-center">
          <span className="font-display text-6xl leading-none">{s.name.charAt(0)}</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col py-2 pr-1">
        <div className="flex items-start justify-between gap-3">
          <h3 key={s.slug} className="animate-rise font-display text-[1.6rem] leading-tight">{s.name}</h3>
          <span className="pt-1.5 text-sm tabular-nums text-ink-2">{pad(index + 1)} / {pad(count)}</span>
        </div>
        <p className="mt-1 line-clamp-2 text-sm text-ink-2">{s.tagline}</p>
        <Link to={`/dich-vu/${s.slug}`} className="mt-2 inline-flex w-fit items-center gap-1.5 text-sm font-semibold hover:text-action">
          Xem dịch vụ <ArrowRightIcon className="h-4 w-4" />
        </Link>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <div className="flex items-center gap-1" aria-hidden="true">
            {services.map((x, k) => (
              <span key={x.slug} className={`h-1 rounded-full transition-all duration-500 ${k === index ? 'w-6 bg-ink' : 'w-2.5 bg-ink/20'}`} />
            ))}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => go(-1)} aria-label="Dịch vụ trước" className="grid h-10 w-10 place-items-center rounded-full bg-ground-3 text-ink transition-colors hover:bg-line">
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Dịch vụ tiếp theo" className="grid h-10 w-10 place-items-center rounded-full bg-ink text-ground transition-opacity hover:opacity-85">
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Thẻ số liệu — chỉ dùng số THẬT (không bịa "250+ dự án") */
function FactsCard() {
  const { services } = useServices();
  const facts = [
    [GridIcon, services.length || 8, 'Dịch vụ'],
    [LayersIcon, groupServices(services).length || 3, 'Nhóm dịch vụ'],
    [HexagonIcon, 1, 'Đầu mối duy nhất'],
  ];
  return (
    <div className="glass float-shadow grid grid-cols-3 rounded-[1.75rem] px-2 py-6">
      {facts.map(([Icon, n, label], i) => (
        <div key={label} className={`px-4 ${i ? 'border-l border-ink/10' : ''}`}>
          <Icon className="h-6 w-6 text-ink-2" />
          <p className="mt-4 font-display text-[2.25rem] leading-none tabular-nums">{n}</p>
          <p className="mt-2 text-sm text-ink-2">{label}</p>
        </div>
      ))}
    </div>
  );
}

/** Thẻ tối kêu gọi hành động */
function CtaCard() {
  return (
    <a href="/bao-gia" className="group float-shadow flex min-h-[188px] flex-col justify-between rounded-[1.75rem] bg-ink p-5 text-ground transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ground" aria-hidden="true">
          <LogoHex className="h-9 w-9" />
        </span>
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ground text-ink transition-transform group-hover:rotate-45" aria-hidden="true">
          <ArrowUpRightIcon className="h-5 w-5" />
        </span>
      </div>
      <div>
        <p className="font-display text-[1.6rem] leading-tight">Biến ý tưởng thành thương hiệu</p>
        <p className="mt-1.5 text-sm opacity-70">Kể Bali Home nghe về dự án của bạn.</p>
        <span className="mt-4 block h-0.5 overflow-hidden rounded-full bg-ground/20" aria-hidden="true">
          <span className="block h-full w-1/3 rounded-full bg-ground transition-all duration-500 group-hover:w-full" />
        </span>
      </div>
    </a>
  );
}

export default function HeroScene() {
  return (
    <section aria-labelledby="hero-title" className="p-2 sm:p-3 lg:p-4">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] lg:min-h-[max(840px,calc(100svh-2rem))] lg:rounded-[2.25rem]">
        <Scenery />
        <Navbar floating />
        <SideRail />

        {/* Danh sách giá trị nhỏ góc phải (như "Modern · Sustainable…") */}
        <ul className="eyebrow absolute right-8 top-32 z-10 hidden space-y-2 border-l border-ink/30 pl-4 text-[11px] text-ink lg:block xl:right-10">
          <li>Sáng tạo</li>
          <li>Rõ ràng</li>
          <li>Đúng hẹn</li>
          <li>Tận tâm</li>
        </ul>

        {/* Nội dung chữ */}
        <div className="relative z-10 px-5 pt-28 sm:px-8 lg:max-w-[52%] lg:pl-32 lg:pt-40 xl:pt-44">
          <p className="eyebrow animate-rise text-ink-2">In ấn — Design — Web — Marketing</p>
          <h1 id="hero-title" className="mt-5 animate-rise font-display text-display font-normal [animation-delay:60ms]">
            Thương hiệu <span className="block italic text-action">bừng sáng</span>
          </h1>
          <p className="mt-6 max-w-[42ch] animate-rise text-[17px] leading-relaxed text-ink [animation-delay:120ms]">
            Bali Home lo trọn in ấn, design, web, edit, profile card, sales, marketing và content: một đầu mối cho mọi việc của thương hiệu.
          </p>
          <div className="mt-8 flex animate-rise flex-wrap items-center gap-x-6 gap-y-4 [animation-delay:180ms]">
            <Button as={Link} to="/dich-vu" size="lg" bubble>
              Khám phá dịch vụ
            </Button>
            <a href="#cach-lam-viec" className="group inline-flex items-center gap-3 text-[15px] font-semibold text-ink">
              <span className="grid h-12 w-12 place-items-center rounded-full border border-ink/30 transition-colors group-hover:bg-ink group-hover:text-ground">
                <PlayIcon className="h-4 w-4" />
              </span>
              Cách chúng tôi làm việc
            </a>
          </div>
        </div>

        {/* Logo 3D — đứng ở vị trí "công trình" của cảnh (giữ nguyên như cũ, kéo để xoay) */}
        <div className="relative h-[320px] sm:h-[400px] lg:absolute lg:right-[3%] lg:top-[12%] lg:h-[60%] lg:w-[46%]">
          <LogoCanvas theme={THEMES[0]} className="absolute inset-0" />
        </div>

        {/* 3 thẻ kính nổi */}
        <div className="relative z-10 grid gap-3 p-3 sm:p-4 lg:absolute lg:inset-x-5 lg:bottom-5 lg:left-28 lg:grid-cols-12 lg:gap-4 lg:p-0">
          <div className="lg:col-span-5"><FeaturedService /></div>
          <div className="lg:col-span-4"><FactsCard /></div>
          <div className="lg:col-span-3"><CtaCard /></div>
        </div>
      </div>
    </section>
  );
}
