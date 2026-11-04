import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal, { item } from '../components/Reveal.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import { ServicesSkeleton, ServicesError } from '../components/services/ServiceStates.jsx';
import { ArrowRightIcon } from '../components/ui/icons.jsx';
import { useServices } from '../hooks/useServices.js';
import { groupServices, formatPrice } from '../data/needs.js';

/* =============================================================================
 * /dich-vu — toàn bộ dịch vụ, chia theo nhóm.
 * Bố cục: mỗi nhóm = 1 section có tiêu đề; mỗi dịch vụ = 1 hàng lớn (tên + giới thiệu | bạn nhận được).
 * Không dùng lưới thẻ giống nhau; hàng xen kẽ bậc tông nền.
 * ========================================================================== */

function ServiceRow({ s, i }) {
  return (
    <article {...item(1 + i, `grid gap-8 rounded-3xl p-7 sm:p-10 lg:grid-cols-12 lg:gap-12 lg:p-14 ${i % 2 ? 'bg-ground-3' : 'bg-ground-2'}`)}>
      <div className="lg:col-span-5">
        <h3 className="text-[2.25rem] font-display font-normal leading-[1.05] sm:text-[2.75rem]">{s.name}</h3>
        <p className="mt-4 text-lead font-semibold">{s.tagline}</p>
        <p className="mt-4 max-w-[46ch] text-ink-2">{s.summary}</p>
      </div>
      <div className="flex flex-col justify-between gap-8 lg:col-span-7">
        <div>
          <p className="text-[15px] font-semibold text-ink-2">Bạn nhận được</p>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-x-8">
            {s.deliverables.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="hex hex-ratio mt-1.5 w-3 shrink-0 bg-action" aria-hidden="true" />
                {d}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="font-semibold">{formatPrice(s.priceFrom)}</span>
          <Link
            to={`/dich-vu/${s.slug}`}
            className="group inline-flex items-center gap-2 py-2 text-[17px] font-bold text-action"
            aria-label={`Xem chi tiết dịch vụ ${s.name}`}
          >
            Xem chi tiết <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ServicesPage() {
  const { services, status, error, reload } = useServices();
  const groups = groupServices(services);

  useEffect(() => { document.title = 'Dịch vụ — Bali Home'; }, []);

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main>
        {/* Mở đầu: tiêu đề + mục lục nhóm (liên kết tới từng nhóm) */}
        <section className={`${CONTAINER} grid gap-10 pt-16 pb-16 lg:grid-cols-12 lg:items-end lg:pt-24`}>
          <div className="lg:col-span-7">
            <h1 className="animate-rise font-display text-display font-normal">Dịch vụ Bali Home</h1>
            <p className="mt-8 max-w-[40ch] animate-rise text-lead [animation-delay:90ms]">
              Tám dịch vụ cho thương hiệu của bạn, từ bản thiết kế đầu tiên đến đơn hàng đầu tiên. Chọn một, hoặc để Bali Home lo trọn gói.
            </p>
          </div>
          <nav aria-label="Nhóm dịch vụ" className="grid gap-1 lg:col-span-5">
            {groupServices(services.length ? services : []).map((g) => (
              <a key={g.id} href={`#${g.id}`} className="group flex items-center justify-between rounded-3xl bg-ground-2 px-5 py-4 font-semibold transition-colors hover:bg-ground-3">
                <span>{g.name}</span>
                <span className="text-ink-2">{g.services.map((s) => s.name).join(' · ')}</span>
              </a>
            ))}
          </nav>
        </section>

        {status === 'loading' && <div className={`${CONTAINER} pb-24`}><ServicesSkeleton /></div>}
        {status === 'error' && <div className={`${CONTAINER} pb-24`}><ServicesError error={error} onRetry={reload} /></div>}

        {groups.map((g) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className="pb-20 lg:pb-28">
            <Reveal className={CONTAINER}>
              <div {...item(0, 'mb-8 flex flex-wrap items-end justify-between gap-4')}>
                <h2 id={`${g.id}-title`} className="font-display text-title font-normal">{g.name}</h2>
                <p className="max-w-[40ch] text-lead text-ink-2">{g.intro}</p>
              </div>
              <div className="grid gap-1">
                {g.services.map((s, i) => <ServiceRow key={s.slug} s={s} i={i} />)}
              </div>
            </Reveal>
          </section>
        ))}

        <ContactSection
          title="Chưa biết chọn gì?"
          intro="Kể cho Bali Home nghe về thương hiệu và mục tiêu của bạn. Chúng tôi sẽ đề xuất những dịch vụ thật sự cần."
          defaultService="other"
        />
      </main>
      <Footer />
    </div>
  );
}
