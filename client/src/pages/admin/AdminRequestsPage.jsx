import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import { StatusBadge } from '../../components/portal/StatusBadge.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowRightIcon, ArrowLeftIcon } from '../../components/ui/icons.jsx';
import { adminApi } from '../../lib/api.js';
import { STATUS, budgetLabel, fmtDateTime, shortId } from '../../data/requests.js';

/** /quan-tri — danh sách yêu cầu: lọc theo trạng thái, tìm kiếm, phân trang (lưu trên URL) */
export default function AdminRequestsPage() {
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? '';
  const q = params.get('q') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(q);
  const [stats, setStats] = useState(null);
  const [data, setData] = useState({ status: 'loading' });

  const setParam = (patch) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
      return next;
    });

  useEffect(() => { adminApi.stats().then(setStats).catch(() => setStats(null)); }, []);

  useEffect(() => {
    let alive = true;
    setData((d) => ({ ...d, status: 'loading' }));
    adminApi
      .list({ status, q, page })
      .then((res) => alive && setData({ status: 'ready', ...res }))
      .catch((e) => alive && setData({ status: 'error', message: e.message }));
    return () => { alive = false; };
  }, [status, q, page]);

  const totalPages = data.total ? Math.ceil(data.total / data.pageSize) : 1;
  const chips = [['', 'Tất cả', stats?.total], ...Object.keys(STATUS).map((s) => [s, STATUS[s].label, stats?.byStatus?.[s]])];

  return (
    <PortalLayout admin title="Yêu cầu khách hàng" subtitle="Tiếp nhận, cập nhật tiến độ và gửi ghi chú cho khách.">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Lọc theo trạng thái">
        {chips.map(([value, label, n]) => (
          <button
            key={value || 'all'}
            type="button"
            aria-pressed={status === value}
            onClick={() => setParam({ status: value, page: '' })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${status === value ? 'bg-ink text-ground' : 'bg-ground-2 text-ink hover:bg-ground-3'}`}
          >
            {label} <span className="ml-1 tabular-nums opacity-70">{n ?? '…'}</span>
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        role="search"
        onSubmit={(e) => { e.preventDefault(); setParam({ q: search.trim(), page: '' }); }}
      >
        <label htmlFor="admin-search" className="sr-only">Tìm yêu cầu</label>
        <input
          id="admin-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, số điện thoại, email, doanh nghiệp…"
          className="h-12 min-w-0 flex-1 rounded-full border border-line bg-ground px-5 text-[15px] outline-none focus:border-action focus:ring-4 focus:ring-[color-mix(in_srgb,var(--action)_18%,transparent)]"
        />
        <Button type="submit">Tìm</Button>
      </form>

      <Panel className="mt-6">
        {data.status === 'error' && <Alert>{data.message}</Alert>}
        {data.status === 'loading' && !data.requests && (
          <div className="grid place-items-center py-12 text-action" role="status" aria-label="Đang tải"><Spinner className="h-7 w-7" /></div>
        )}
        {data.requests && data.requests.length === 0 && <p className="py-6 text-ink-2">Không có yêu cầu nào khớp bộ lọc.</p>}
        {data.requests?.length > 0 && (
          <ul className={`grid gap-2 transition-opacity ${data.status === 'loading' ? 'opacity-60' : ''}`}>
            {data.requests.map((r) => (
              <li key={r.id}>
                <Link to={`/quan-tri/yeu-cau/${r.id}`} className="group grid gap-3 rounded-2xl bg-ground p-5 transition-colors hover:bg-ground-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <p className="text-sm text-ink-2">{shortId(r.id)} · {fmtDateTime(r.createdAt)}{r._count?.attachments ? ` · ${r._count.attachments} tệp` : ''}</p>
                    <p className="mt-1 font-bold group-hover:text-action">
                      {r.fullName}{r.company ? ` · ${r.company}` : ''} <span className="font-normal text-ink-2">— {r.needLabel}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-ink-2">{r.phone}{r.email ? ` · ${r.email}` : ''} · Ngân sách: {budgetLabel(r.budget)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={r.status} />
                    <ArrowRightIcon className="hidden h-5 w-5 md:block" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav className="mt-6 flex items-center justify-between" aria-label="Phân trang">
            <Button variant="soft" size="sm" disabled={page <= 1} onClick={() => setParam({ page: page - 1 })}>
              <ArrowLeftIcon className="h-4 w-4" /> Trước
            </Button>
            <span className="text-sm text-ink-2">Trang {page} / {totalPages} · {data.total} yêu cầu</span>
            <Button variant="soft" size="sm" disabled={page >= totalPages} onClick={() => setParam({ page: page + 1 })}>
              Sau <ArrowRightIcon className="h-4 w-4" />
            </Button>
          </nav>
        )}
      </Panel>
    </PortalLayout>
  );
}
