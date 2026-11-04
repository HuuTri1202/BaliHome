import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal, { item } from '../components/Reveal.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import { ServicesSkeleton, ServicesError } from '../components/services/ServiceStates.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ArrowRightIcon, ArrowLeftIcon } from '../components/ui/icons.jsx';
import { useServices } from '../hooks/useServices.js';
import { GROUPS, formatPrice } from '../data/needs.js';

/* =============================================================================
 * /dich-vu/:slug — chi tiết 1 dịch vụ
 * Hero: tên dịch vụ cỡ lớn + "thẻ giá" hình lục giác (motif) | Bạn nhận được · Phù hợp khi |
 * Form báo giá chọn sẵn dịch vụ | Dịch vụ khác
 * Dữ liệu lấy từ danh sách đã cache (useServices) → chuyển giữa các dịch vụ không phải tải lại.
 * ========================================================================== */

const HexList = ({ items }) => (
  <ul className="grid gap-4">
    {items.map((t) => (
      <li key={t} className="flex gap-4 text-[18px]">
        <span className="hex hex-ratio mt-2 w-3 shrink-0 bg-action" aria-hidden="true" />
        {t}
      </li>
    ))}
  </ul>
);

function NotFound() {
  return (
    <section className={`${CONTAINER} py-24`}>
      <h1 className="font-display text-title font-normal">Không tìm thấy dịch vụ</h1>
      <p className="mt-6 max-w-[40ch] text-lead">Dịch vụ này không tồn tại hoặc đã ngừng cung cấp.</p>
      <Button as={Link} to="/dich-vu" size="lg" className="mt-10">Xem tất cả dịch vụ</Button>
    </section>
  );
}

export default function ServiceDetailPage() {
  const { slug } = useParams();
  const { services, status, error, reload } = useServices();
  const service = services.find((s) => s.slug === slug);
  const group = GROUPS.find((g) => g.id === service?.group);
  const others = services.filter((s) => s.slug !== slug);

  const { hash } = useLocation();
  const process = Array.isArray(service?.process) ? service.process : [];
  const faqs = Array.isArray(service?.faqs) ? service.faqs : [];

  useEffect(() => {
    document.title = service ? `${service.name} — Dịch vụ Bali Home` : 'Dịch vụ — Bali Home';
  }, [service]);

  // Mở trang: có #bao-gia (từ nút "Nhận báo giá") → cuộn tới form; không có → về đầu trang
  useEffect(() => {
    if (!service) return undefined;
    const id = setTimeout(() => {
      const target = hash ? document.getElementById(hash.slice(1)) : null;
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      else window.scrollTo({ top: 0 });
    }, 0);
    return () => clearTimeout(id);
  }, [slug, hash, Boolean(service)]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main>
        {status === 'loading' && <div className={`${CONTAINER} py-24`}><ServicesSkeleton rows={3} /></div>}
        {status === 'error' && <div className={`${CONTAINER} py-24`}><ServicesError error={error} onRetry={reload} /></div>}
        {status === 'ready' && !service && <NotFound />}

        {service && (
          <>
            {/* ========== Hero ========== */}
            <section className={`${CONTAINER} grid items-center gap-12 pt-10 pb-20 lg:grid-cols-12 lg:pt-16 lg:pb-28`} aria-labelledby="sv-title">
              <div className="lg:col-span-7">
                <nav aria-label="Đường dẫn" className="flex flex-wrap items-center gap-2 text-[15px] text-ink-2">
                  <Link to="/dich-vu" className="inline-flex items-center gap-1.5 font-semibold hover:text-ink">
                    <ArrowLeftIcon className="h-4 w-4" /> Dịch vụ
                  </Link>
                  <span aria-hidden="true">/</span>
                  <span>{group?.name}</span>
                </nav>
                <h1 id="sv-title" key={slug} className="mt-8 animate-rise font-display text-display font-normal">{service.name}</h1>
                <p key={slug + 't'} className="mt-8 max-w-[34ch] animate-rise text-lead font-semibold [animation-delay:90ms]">{service.tagline}</p>
                <p key={slug + 's'} className="mt-5 max-w-[56ch] animate-rise text-[18px] leading-relaxed text-ink [animation-delay:160ms]">{service.summary}</p>
              </div>

              {/* "Thẻ giá" theo motif lục giác */}
              <div className="lg:col-span-5">
                <div className="hex hex-ratio hex-hero mx-auto grid w-[min(82vw,400px)] place-items-center bg-motif text-on-motif">
                  <div className="flex w-[64%] flex-col items-center text-center">
                    <p className="text-sm font-medium text-on-motif-2">Chi phí</p>
                    <p className="mt-2 text-[1.75rem] font-extrabold leading-tight">{formatPrice(service.priceFrom)}</p>
                    <p className="mt-3 text-sm text-on-motif-2">Tư vấn miễn phí, báo giá chi tiết trước khi làm.</p>
                    <Button as="a" href="#bao-gia" variant="onMotif" className="mt-6">
                      Nhận báo giá <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </section>

            {/* ========== Bạn nhận được · Phù hợp khi ========== */}
            <section aria-labelledby="sv-get" className="bg-ground-2 py-20 lg:py-28">
              <Reveal key={slug} className={`${CONTAINER} grid gap-14 lg:grid-cols-12`}>
                <div className="lg:col-span-7">
                  <h2 id="sv-get" {...item(0, 'font-display text-title font-normal')}>Bạn nhận được</h2>
                  <div {...item(1, 'mt-10')}><HexList items={service.deliverables} /></div>
                </div>
                <div className="lg:col-span-5">
                  <h2 {...item(2, 'font-display text-title font-normal')}>Phù hợp khi</h2>
                  <div {...item(3, 'mt-10')}><HexList items={service.idealFor} /></div>
                </div>
              </Reveal>
            </section>

            {/* ========== Quy trình · Câu hỏi thường gặp (nội dung riêng từng dịch vụ) ========== */}
            {(process.length > 0 || faqs.length > 0) && (
              <section aria-labelledby="sv-process" className="py-20 lg:py-28">
                <Reveal key={slug + 'p'} className={`${CONTAINER} grid gap-14 lg:grid-cols-12`}>
                  {process.length > 0 && (
                    <div className="lg:col-span-7">
                      <h2 id="sv-process" {...item(0, 'font-display text-title font-normal')}>Quy trình</h2>
                      <ol className="mt-10 grid gap-3">
                        {process.map((p, i) => (
                          <li key={p.title} {...item(1 + i, 'flex gap-5 rounded-3xl bg-ground-2 p-6 sm:p-7')}>
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink font-display text-xl text-ground" aria-hidden="true">{i + 1}</span>
                            <span>
                              <span className="block text-lead font-bold">{p.title}</span>
                              <span className="mt-1 block text-ink-2">{p.text}</span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {faqs.length > 0 && (
                    <div className="lg:col-span-5">
                      <h2 {...item(1, 'font-display text-title font-normal')}>Câu hỏi thường gặp</h2>
                      <div {...item(2, 'mt-10 grid gap-2')}>
                        {faqs.map((f) => (
                          <details key={f.q} className="group rounded-3xl bg-ground-2 px-6 py-5">
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[17px] font-semibold [&::-webkit-details-marker]:hidden">
                              {f.q}
                              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ground text-xl leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                            </summary>
                            <p className="mt-3 text-ink-2">{f.a}</p>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}
                </Reveal>
              </section>
            )}

            {/* ========== Báo giá (form chọn sẵn dịch vụ này) ========== */}
            <ContactSection
              id="bao-gia"
              title="Nhận báo giá"
              intro={`Cho Bali Home biết bạn cần gì cho dịch vụ ${service.name}. Chúng tôi sẽ gọi lại để hỏi rõ và gửi báo giá chi tiết.`}
              defaultService={service.slug}
            />

            {/* ========== Dịch vụ khác ========== */}
            <section aria-labelledby="sv-others" className="pb-24 lg:pb-28">
              <div className={CONTAINER}>
                <h2 id="sv-others" className="font-display text-title font-normal">Dịch vụ khác</h2>
                <ul className="mt-10 grid gap-1 sm:grid-cols-2 lg:grid-cols-4">
                  {others.map((s) => (
                    <li key={s.slug}>
                      <Link to={`/dich-vu/${s.slug}`} className="group flex h-full flex-col justify-between gap-6 rounded-3xl bg-ground-2 p-6 transition-colors hover:bg-ground-3">
                        <span>
                          <span className="block text-lead font-bold">{s.name}</span>
                          <span className="mt-2 block text-ink-2">{s.tagline}</span>
                        </span>
                        <ArrowRightIcon className="h-5 w-5 text-action transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                  {/* 7 dịch vụ khác trên lưới 4 cột → ô thứ 8 dẫn về trang tất cả dịch vụ (không để ô trống) */}
                  <li>
                    <Link to="/dich-vu" className="group flex h-full flex-col justify-between gap-6 bg-motif p-6 text-on-motif transition-opacity hover:opacity-90">
                      <span className="block text-lead font-bold">Xem tất cả dịch vụ</span>
                      <ArrowRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                </ul>
              </div>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
