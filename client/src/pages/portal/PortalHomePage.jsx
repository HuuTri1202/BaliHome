import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PortalLayout, { Panel, EmptyState } from '../../components/portal/PortalLayout.jsx';
import { StatusBadge, StatusStepper } from '../../components/portal/StatusBadge.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowRightIcon } from '../../components/ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { contactApi } from '../../lib/api.js';
import { fmtDate, shortId } from '../../data/requests.js';

/** /tai-khoan — Tổng quan cổng khách hàng: số liệu + danh sách yêu cầu kèm tiến độ */
export default function PortalHomePage() {
  const { user } = useAuth();
  const { state } = useLocation();
  const [data, setData] = useState({ status: 'loading', items: [] });

  useEffect(() => {
    let alive = true;
    contactApi
      .mine()
      .then(({ requests }) => alive && setData({ status: 'ready', items: requests }))
      .catch((e) => alive && setData({ status: 'error', items: [], message: e.message }));
    return () => { alive = false; };
  }, []);

  const items = data.items;
  const count = (fn) => items.filter(fn).length;
  const stats = [
    ['Tổng yêu cầu', items.length],
    ['Đang xử lý', count((r) => ['NEW', 'CONTACTED', 'IN_PROGRESS'].includes(r.status))],
    ['Hoàn thành', count((r) => r.status === 'DONE')],
  ];

  return (
    <PortalLayout
      title={`Xin chào, ${user.fullName.split(' ').slice(-1)[0]}`}
      subtitle="Theo dõi tiến độ các yêu cầu và báo giá bạn đã gửi Bali Home."
      actions={<Button as={Link} to="/bao-gia" bubble>Yêu cầu báo giá mới</Button>}
    >
      {state?.welcome && <Alert type="success" className="mb-6">Tạo tài khoản thành công. Chào mừng bạn đến với Bali Home!</Alert>}
      {state?.sent && <Alert type="success" className="mb-6">Đã gửi yêu cầu. Bali Home sẽ liên hệ với bạn sớm.</Alert>}

      <dl className="grid gap-3 sm:grid-cols-3">
        {stats.map(([label, n]) => (
          <div key={label} className="rounded-3xl bg-ground-2 p-6">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="mt-2 font-display text-[2.5rem] leading-none tabular-nums">{data.status === 'ready' ? n : '—'}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Yêu cầu của bạn" className="mt-6">
        {data.status === 'loading' && <div className="grid place-items-center py-10 text-action" role="status" aria-label="Đang tải"><Spinner className="h-6 w-6" /></div>}
        {data.status === 'error' && <Alert>{data.message}</Alert>}
        {data.status === 'ready' && items.length === 0 && (
          <EmptyState to="/bao-gia" cta="Gửi yêu cầu báo giá đầu tiên">
            Bạn chưa gửi yêu cầu nào. Mỗi yêu cầu gửi khi đã đăng nhập sẽ hiện ở đây, cùng tiến độ xử lý từ Bali Home.
          </EmptyState>
        )}
        {items.length > 0 && (
          <ul className="grid gap-2">
            {items.map((r) => {
              const lastNote = [...(r.events ?? [])].reverse().find((e) => e.note)?.note;
              return (
                <li key={r.id}>
                  <Link to={`/tai-khoan/yeu-cau/${r.id}`} className="group grid gap-4 rounded-2xl bg-ground p-5 transition-colors hover:bg-ground-3 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm text-ink-2">{shortId(r.id)} · Gửi ngày {fmtDate(r.createdAt)}</p>
                        <p className="mt-1 text-lead font-bold group-hover:text-action">{r.needLabel}{r.company ? ` · ${r.company}` : ''}</p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <StatusStepper status={r.status} compact />
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="line-clamp-1 text-ink-2">{lastNote ? `Bali Home: “${lastNote}”` : 'Chưa có cập nhật mới'}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-semibold">Chi tiết <ArrowRightIcon className="h-4 w-4" /></span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </PortalLayout>
  );
}
