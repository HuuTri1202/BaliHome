import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AreaChart from '../../components/admin/AreaChart.jsx';
import { StatusBadge } from '../../components/portal/StatusBadge.jsx';
import { Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowRightIcon, ChatIcon, CheckIcon, ClockIcon, FileIcon, GridIcon, TrendIcon, UserIcon } from '../../components/ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../../lib/api.js';
import { STATUS, fmtDateTime } from '../../data/requests.js';

/* =============================================================================
 * /quan-tri — Tổng quan toàn hệ thống. MỌI con số lấy từ /api/admin/overview (dữ liệu thật).
 * ========================================================================== */
const RANGES = [[7, '7 ngày'], [30, '30 ngày'], [90, '90 ngày']];

const greeting = () => {
  const h = new Date().getHours();
  if (h < 11) return 'Chào buổi sáng';
  if (h < 14) return 'Chào buổi trưa';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

/** Cảnh hoàng hôn vẽ bằng SVG (chưa có ảnh thật), mờ dần về nền ở cạnh trái và cạnh dưới */
function SunsetScene() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] overflow-hidden" aria-hidden="true">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1200 560" preserveAspectRatio="xMaxYMin slice">
        <defs>
          <linearGradient id="bh-dusk" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1228" />
            <stop offset="0.42" stopColor="#2a2f55" />
            <stop offset="0.66" stopColor="#a8704f" />
            <stop offset="0.78" stopColor="#efb26e" />
          </linearGradient>
          <radialGradient id="bh-sunset" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#ffe3b0" stopOpacity="0.95" />
            <stop offset="1" stopColor="#ffb867" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1200" height="560" fill="url(#bh-dusk)" />
        <circle cx="965" cy="330" r="210" fill="url(#bh-sunset)" />
        <path fill="#39375a" d="M380 430 L520 372 L640 402 L760 340 L860 386 L960 352 L1200 300 V560 H380Z" />
        <path fill="#1d2140" d="M620 450 L760 392 L850 430 L1000 262 L1058 316 L1110 276 L1200 332 V560 H620Z" />
        <path fill="#0e1328" d="M0 500 C 300 462, 620 478, 820 446 S 1100 420, 1200 436 V560 H0Z" />
      </svg>
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, var(--ground) 8%, color-mix(in srgb, var(--ground) 72%, transparent) 42%, transparent 72%)' }} />
      <div className="absolute inset-x-0 bottom-0 h-44" style={{ background: 'linear-gradient(0deg, var(--ground), transparent)' }} />
    </div>
  );
}

function KpiCard({ to, icon: Icon, label, value, note, highlight, className = '' }) {
  return (
    <Link
      to={to}
      className={`glass group flex flex-col justify-between gap-5 rounded-2xl p-5 transition-transform hover:-translate-y-0.5 ${highlight ? 'border-action/70 ring-1 ring-action/40' : ''} ${className}`}
    >
      <span className="flex items-start justify-between gap-2">
        <Icon className={`h-6 w-6 ${highlight ? 'text-action' : 'text-ink-2'}`} />
        <ArrowRightIcon className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-70" />
      </span>
      <span>
        <span className="block font-display text-[2.25rem] leading-none tabular-nums">{value}</span>
        <span className="mt-2 block text-[15px] font-medium">{label}</span>
        {note && <span className="block text-sm text-ink-2">{note}</span>}
      </span>
    </Link>
  );
}

function RequestChart() {
  const [days, setDays] = useState(30);
  const [state, setState] = useState({ status: 'loading', series: [] });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, status: 'loading' }));
    adminApi
      .series(days)
      .then(({ series }) => alive && setState({ status: 'ready', series }))
      .catch((e) => alive && setState({ status: 'error', series: [], message: e.message }));
    return () => { alive = false; };
  }, [days]);

  return (
    <section className="h-full rounded-3xl bg-ground-2 p-5 sm:p-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-display text-[1.5rem]"><TrendIcon className="h-5 w-5 text-action" /> Yêu cầu theo ngày</h2>
        <div role="group" aria-label="Khoảng thời gian" className="flex gap-1 rounded-full bg-ground p-1">
          {RANGES.map(([d, label]) => (
            <button
              key={d}
              type="button"
              aria-pressed={days === d}
              onClick={() => setDays(d)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${days === d ? 'bg-ground-3 text-action' : 'text-ink-2 hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {state.status === 'error' && <Alert>{state.message}</Alert>}
      {state.series.length > 0 ? (
        <div className={state.status === 'loading' ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
          <AreaChart data={state.series} label={`Số yêu cầu theo ngày, ${days} ngày gần nhất`} />
        </div>
      ) : (
        state.status === 'loading' && <div className="grid h-[260px] place-items-center text-action"><Spinner className="h-6 w-6" /></div>
      )}
    </section>
  );
}

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ status: 'loading' });

  useEffect(() => {
    document.title = 'Tổng quan — Quản trị Bali Home';
    let alive = true;
    adminApi
      .overview()
      .then((d) => alive && setData({ status: 'ready', ...d }))
      .catch((e) => alive && setData({ status: 'error', message: e.message }));
    return () => { alive = false; };
  }, []);

  const firstName = user?.fullName?.trim().split(/\s+/).slice(-1)[0] ?? '';
  const ready = data.status === 'ready';
  const v = (n) => (ready ? n : '—');
  const delta = ready ? data.last7 - data.prev7 : 0;
  const serviceRows = (data.byService ?? []).slice(0, 10);
  const maxServiceCount = Math.max(1, ...serviceRows.map((s) => s.count));

  const details = ready
    ? [
        [CheckIcon, 'Tỉ lệ hoàn thành', data.completionRate == null ? 'Chưa có' : `${data.completionRate}%`],
        [TrendIcon, '7 ngày qua', `${data.last7} yêu cầu`],
        [ClockIcon, 'So với 7 ngày trước', delta === 0 ? 'Không đổi' : `${delta > 0 ? '+' : ''}${delta}`],
        [UserIcon, 'Khách mới (7 ngày)', data.newUsers7d],
        [GridIcon, 'Dịch vụ đang bật', `${data.servicesActive} / ${data.servicesTotal}`],
        [FileIcon, 'Tải tệp', data.uploadsEnabled ? 'Đang bật' : 'Chưa bật'],
      ]
    : [];

  return (
    <AdminLayout hero={<SunsetScene />}>
      {/* ---------- Hero ---------- */}
      <section className="grid items-end gap-8 pb-8 pt-4 lg:grid-cols-[1fr_auto] lg:pb-10 lg:pt-8" aria-labelledby="ov-title">
        <div>
          <p className="eyebrow flex items-center gap-3 text-action">Tổng quan hệ thống <span className="h-px w-12 bg-action/60" aria-hidden="true" /></p>
          <h1 id="ov-title" className="mt-4 font-display text-[2.75rem] font-normal leading-[1.05] sm:text-[3.5rem]">
            {greeting()},<br />{firstName}
          </h1>
          <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-ink">
            Theo dõi yêu cầu của khách, khách hàng và dịch vụ của Bali Home ở một nơi.
          </p>
        </div>
        <div className="lg:pr-6 lg:text-right">
          <p className="font-display text-[5.5rem] leading-none tabular-nums sm:text-[7rem]">{v(data.open)}</p>
          <p className="mt-2 text-lg font-medium">Yêu cầu đang mở</p>
          <p className="text-[15px] text-ink">Tổng cộng {v(data.total)} yêu cầu</p>
        </div>
      </section>

      {data.status === 'error' && <Alert className="mb-6">{data.message}</Alert>}

      {/* ---------- Hàng thẻ ---------- */}
      <section aria-label="Số liệu chính" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard to="/quan-tri/yeu-cau?status=NEW" icon={ChatIcon} label={STATUS.NEW.label} value={v(data.byStatus?.NEW)} note="Cần gọi lại" highlight={ready && data.byStatus.NEW > 0} />
        <KpiCard to="/quan-tri/yeu-cau?status=CONTACTED" icon={ClockIcon} label={STATUS.CONTACTED.label} value={v(data.byStatus?.CONTACTED)} note="Chờ phản hồi" />
        <KpiCard to="/quan-tri/yeu-cau?status=IN_PROGRESS" icon={TrendIcon} label={STATUS.IN_PROGRESS.label} value={v(data.byStatus?.IN_PROGRESS)} note="Đang triển khai" />
        <KpiCard to="/quan-tri/yeu-cau?status=DONE" icon={CheckIcon} label={STATUS.DONE.label} value={v(data.byStatus?.DONE)} note={`${v(data.byStatus?.CANCELLED)} đã huỷ`} />
        <KpiCard to="/quan-tri/khach-hang" icon={UserIcon} label="Khách hàng" value={v(data.users)} note="Tài khoản đã đăng ký" className="col-span-2 md:col-span-1" />
      </section>

      {/* ---------- Biểu đồ + chi tiết + thẻ ảnh ---------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-7"><RequestChart /></div>

        <section className="rounded-3xl bg-ground-2 p-5 sm:p-7 xl:col-span-3">
          <h2 className="font-display text-[1.5rem]">Chi tiết</h2>
          <dl className="mt-4">
            {details.map(([Icon, label, value], i) => (
              <div key={label} className={`flex items-center justify-between gap-3 py-3 ${i ? 'border-t border-ink/5' : ''}`}>
                <dt className="flex items-center gap-2.5 text-[15px] text-ink-2"><Icon className="h-4 w-4 shrink-0" /> {label}</dt>
                <dd className="font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
            {!ready && data.status !== 'error' && <div className="grid h-40 place-items-center text-action"><Spinner className="h-6 w-6" /></div>}
          </dl>
        </section>

        <section className="relative isolate flex min-h-[260px] flex-col justify-end overflow-hidden rounded-3xl p-6 xl:col-span-2" aria-label="Thông điệp thương hiệu">
          <svg className="absolute inset-0 -z-10 h-full w-full" viewBox="0 0 240 360" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <linearGradient id="bh-card-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#141b3a" />
                <stop offset="0.5" stopColor="#4a3f5e" />
                <stop offset="0.72" stopColor="#d99a60" />
              </linearGradient>
            </defs>
            <rect width="240" height="360" fill="url(#bh-card-sky)" />
            <path fill="#272a4c" d="M0 240 L60 180 L100 214 L160 150 L240 226 V360 H0Z" />
            <path fill="#0c1124" d="M0 290 L70 248 L130 282 L190 240 L240 270 V360 H0Z" />
          </svg>
          <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(0deg, rgb(7 11 24 / .85), transparent 65%)' }} aria-hidden="true" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">Bali Home</p>
          <p className="mt-2 font-display text-[1.35rem] leading-snug text-white">“Một đầu mối cho mọi việc của thương hiệu.”</p>
          <span className="mt-4 block h-px w-10 bg-action" aria-hidden="true" />
        </section>
      </div>

      {/* ---------- Dịch vụ + yêu cầu mới nhất ---------- */}
      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
        <section className="rounded-3xl bg-ground-2 p-5 sm:p-7 xl:col-span-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[1.5rem]">Dịch vụ được quan tâm</h2>
            <Link to="/quan-tri/dich-vu" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-action hover:bg-ground-3">
              Quản lý dịch vụ <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {serviceRows.map((s) => (
              <li key={s.slug} className="flex items-center gap-3">
                <span className="hex hex-ratio grid w-11 shrink-0 place-items-center bg-ground-3 font-display text-lg text-action" aria-hidden="true">{s.name.charAt(0)}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="truncate font-semibold">{s.name}{s.isActive ? '' : ' (đang ẩn)'}</span>
                    <span className="shrink-0 text-sm tabular-nums text-ink-2">{s.count} yêu cầu</span>
                  </span>
                  {/* Thanh tỉ lệ so với dịch vụ nhiều yêu cầu nhất; con số thật nằm ngay bên trên */}
                  <span className="mt-2 block h-1 rounded-full bg-ground-3" aria-hidden="true">
                    <span className="block h-full rounded-full bg-action" style={{ width: `${(s.count / maxServiceCount) * 100}%` }} />
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl bg-ground-2 p-5 sm:p-7 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-display text-[1.5rem]">Yêu cầu mới nhất</h2>
            <Link to="/quan-tri/yeu-cau" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-action hover:bg-ground-3">
              Tất cả <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          {ready && data.recent.length === 0 && <p className="py-6 text-ink-2">Chưa có yêu cầu nào.</p>}
          <ul className="grid gap-1">
            {(data.recent ?? []).map((r) => (
              <li key={r.id}>
                <Link to={`/quan-tri/yeu-cau/${r.id}`} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-ground-3">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{r.fullName}{r.company ? ` · ${r.company}` : ''}</span>
                    <span className="block truncate text-sm text-ink-2">{r.needLabel} · {fmtDateTime(r.createdAt)}</span>
                  </span>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminLayout>
  );
}
