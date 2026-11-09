import { useState } from 'react';
import LogoCanvas from '../LazyLogoCanvas.jsx';
import QuoteButton from '../QuoteButton.jsx';
import LogoThemePicker from './LogoThemePicker.jsx';
import { Button } from '../ui/Button.jsx';
import { THEMES } from '../../data/themes.js';
import { CORE_SERVICES } from '../../data/coreServices.js';

/* =============================================================================
 * Hero tối giản: khung bo lớn + cảnh nền SVG + 1 tiêu đề + badge dịch vụ + 2 CTA + logo 3D.
 * Logo 3D giữ nguyên như cũ (Three.js, kéo để xoay).
 * ========================================================================== */

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

function ServiceBadges() {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Dịch vụ cốt lõi">
      {CORE_SERVICES.map(({ slug, badge, Icon, tone }) => (
        <li key={slug} className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${tone}`}>
          <Icon className="h-4 w-4" />
          {badge}
        </li>
      ))}
    </ul>
  );
}

export default function HeroScene() {
  const [logoThemeId, setLogoThemeId] = useState(THEMES[0].id);
  const logoTheme = THEMES.find((theme) => theme.id === logoThemeId);

  return (
    <section aria-labelledby="hero-title" className="p-2 sm:p-3 lg:p-4">
      <div className="relative isolate overflow-hidden rounded-[1.75rem] lg:flex lg:min-h-[max(720px,calc(100svh-7rem))] lg:items-center lg:rounded-[2.25rem]">
        <Scenery />

        <div className="relative z-10 px-5 pt-16 sm:px-8 lg:max-w-[60%] lg:py-20 lg:pl-16">
          <h1 id="hero-title" className="animate-rise text-balance font-display text-[clamp(2.5rem,4.8vw,4.5rem)] font-extrabold leading-[1.14] tracking-[-0.03em]">
            Một đầu mối duy nhất cho mọi nhu cầu tăng trưởng
          </h1>
          <div className="mt-8 animate-rise [animation-delay:80ms]">
            <ServiceBadges />
          </div>
          <div className="mt-10 flex animate-rise flex-wrap items-center gap-3 [animation-delay:160ms]">
            <QuoteButton />
            <Button as="a" href="#lien-he" variant="glass" size="lg">Tư vấn miễn phí</Button>
          </div>
        </div>

        {/* Logo 3D — đứng ở vị trí "công trình" của cảnh (giữ nguyên như cũ, kéo để xoay) */}
        <div className="relative h-[384px] sm:h-[464px] lg:absolute lg:right-[2%] lg:top-1/2 lg:h-[66%] lg:w-[40%] lg:-translate-y-1/2">
          {/* Dưới lg chừa 4rem ở đáy cho thanh chọn màu, không đè lên logo */}
          <LogoCanvas theme={logoTheme} className="absolute inset-x-0 bottom-16 top-0 lg:bottom-0" />
          <div className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 lg:bottom-0">
            <LogoThemePicker themes={THEMES} selectedId={logoThemeId} onSelect={setLogoThemeId} />
          </div>
        </div>
      </div>
    </section>
  );
}
