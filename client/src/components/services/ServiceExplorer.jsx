import { useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';
import { ArrowRightIcon, CheckIcon } from '../ui/icons.jsx';
import { ServiceExplorerSkeleton } from './ServiceStates.jsx';
import { useServices } from '../../hooks/useServices.js';
import { groupServices, formatPrice } from '../../data/needs.js';

/* =============================================================================
 * Bộ chọn dịch vụ: bấm 1 dịch vụ → bảng mô tả bên cạnh đổi ngay (không tải lại trang).
 *  - Desktop: danh sách theo nhóm bên trái | mô tả bên phải. Phone: thanh chọn vuốt ngang.
 *  - Chuẩn ARIA tabs: role tablist/tab/tabpanel, roving tabindex, ←↑→↓ Home End.
 *  - Dịch vụ đang chọn lưu trên URL (?dv=web) → chia sẻ link mở đúng dịch vụ.
 * ========================================================================== */

const PARAM = 'dv';

function DetailPanel({ service, groupName, panelId, tabId }) {
  const process = Array.isArray(service.process) ? service.process : [];
  const faqs = Array.isArray(service.faqs) ? service.faqs : [];

  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={tabId}
      tabIndex={0}
      className="rounded-[2rem] bg-ground-2 p-6 sm:p-8 lg:p-10"
    >
      {/* key = slug → mỗi lần đổi dịch vụ nội dung "mọc" lên lại */}
      <div key={service.slug} className="animate-rise">
        <p className="eyebrow text-ink-2">{groupName}</p>
        <h3 className="mt-3 font-display text-[2.5rem] leading-[1.05] sm:text-[3rem]">{service.name}</h3>
        <p className="mt-4 max-w-[46ch] text-lead font-semibold">{service.tagline}</p>
        <p className="mt-4 max-w-[62ch] leading-relaxed text-ink">{service.summary}</p>

        <div className="mt-10 grid gap-10 xl:grid-cols-2">
          <section aria-label={`${service.name}: bạn nhận được`}>
            <h4 className="text-[15px] font-bold">Bạn nhận được</h4>
            <ul className="mt-4 grid gap-3">
              {service.deliverables.map((d) => (
                <li key={d} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-action text-on-action" aria-hidden="true">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {d}
                </li>
              ))}
            </ul>
            {service.idealFor?.length > 0 && (
              <>
                <h4 className="mt-8 text-[15px] font-bold">Phù hợp khi</h4>
                <ul className="mt-3 grid gap-2 text-ink-2">
                  {service.idealFor.map((t) => <li key={t}>— {t}</li>)}
                </ul>
              </>
            )}
          </section>

          {process.length > 0 && (
            <section aria-label={`${service.name}: quy trình`}>
              <h4 className="text-[15px] font-bold">Quy trình</h4>
              <ol className="mt-4 grid gap-3">
                {process.map((p, i) => (
                  <li key={p.title} className="flex gap-4 rounded-2xl bg-ground p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ink font-display text-lg text-ground" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block font-semibold">{p.title}</span>
                      <span className="mt-0.5 block text-sm text-ink-2">{p.text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {faqs.length > 0 && (
          <section aria-label={`${service.name}: câu hỏi thường gặp`} className="mt-10">
            <h4 className="text-[15px] font-bold">Câu hỏi thường gặp</h4>
            <div className="mt-4 grid gap-2">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl bg-ground px-5 py-4 open:pb-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ground-3 text-lg leading-none transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-3 text-ink-2">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink/10 pt-6">
          <p>
            <span className="block text-sm text-ink-2">Chi phí</span>
            <span className="font-semibold">{formatPrice(service.priceFrom)}</span>
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/dich-vu/${service.slug}`} className="inline-flex items-center gap-1.5 px-2 py-2 font-semibold hover:text-action">
              Xem chi tiết <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Button as={Link} to={`/bao-gia?dv=${service.slug}`} bubble>
              Nhận báo giá {service.name}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServiceExplorer({ idPrefix = 'sv' }) {
  const { services, status } = useServices();
  const [params, setParams] = useSearchParams();
  const tabRefs = useRef({});

  if (status === 'loading') return <ServiceExplorerSkeleton />;

  const groups = groupServices(services);
  const ordered = groups.flatMap((g) => g.services);
  if (!ordered.length) return null;

  const current = ordered.find((s) => s.slug === params.get(PARAM)) ?? ordered[0];
  const currentGroup = groups.find((g) => g.services.includes(current));
  const tabId = (slug) => `${idPrefix}-tab-${slug}`;
  const panelId = `${idPrefix}-panel`;

  const select = (slug, focus = false) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(PARAM, slug);
        return next;
      },
      { replace: true }
    );
    if (focus) tabRefs.current[slug]?.focus();
  };

  // Bàn phím: ←↑ trước, →↓ sau, Home đầu, End cuối (vòng tròn)
  const onKeyDown = (e) => {
    const i = ordered.indexOf(current);
    const map = { ArrowDown: i + 1, ArrowRight: i + 1, ArrowUp: i - 1, ArrowLeft: i - 1, Home: 0, End: ordered.length - 1 };
    if (!(e.key in map)) return;
    e.preventDefault();
    const n = (map[e.key] + ordered.length) % ordered.length;
    select(ordered[n].slug, true);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:gap-6 xl:grid-cols-[340px_1fr]">
      <div
        role="tablist"
        aria-label="Chọn dịch vụ"
        aria-orientation="vertical"
        onKeyDown={onKeyDown}
        className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:sticky lg:top-28 lg:flex-col lg:self-start lg:overflow-visible lg:rounded-[2rem] lg:bg-ground-2 lg:p-3"
      >
        {groups.map((g) => (
          <div key={g.id} className="contents lg:block lg:[&+&]:mt-3">
            <p className="hidden px-4 pb-2 pt-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-2 lg:block">{g.name}</p>
            {g.services.map((s) => {
              const active = s.slug === current.slug;
              return (
                <button
                  key={s.slug}
                  ref={(el) => { tabRefs.current[s.slug] = el; }}
                  id={tabId(s.slug)}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={panelId}
                  tabIndex={active ? 0 : -1}
                  onClick={() => select(s.slug)}
                  className={
                    'group flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-full px-5 py-3 text-left text-[15px] font-semibold transition-colors lg:w-full lg:rounded-2xl lg:px-4 ' +
                    (active ? 'bg-ink text-ground' : 'bg-ground-2 text-ink hover:bg-ground-3 lg:bg-transparent lg:hover:bg-ground')
                  }
                >
                  <span>
                    <span className="block">{s.name}</span>
                    <span className={`hidden max-w-[230px] truncate text-[13px] font-normal lg:block ${active ? 'text-ground/70' : 'text-ink-2'}`}>{s.tagline}</span>
                  </span>
                  <ArrowRightIcon className={`hidden h-4 w-4 shrink-0 transition-transform lg:block ${active ? 'translate-x-0.5' : 'opacity-0 group-hover:opacity-60'}`} />
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <DetailPanel service={current} groupName={currentGroup?.name} panelId={panelId} tabId={tabId(current.slug)} />
    </div>
  );
}
