import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import { StatusBadge, StatusStepper } from '../../components/portal/StatusBadge.jsx';
import RequestChat from '../../components/chat/RequestChat.jsx';
import Attachments from '../../components/portal/Attachments.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowLeftIcon } from '../../components/ui/icons.jsx';
import { contactApi } from '../../lib/api.js';
import { budgetLabel, fmtDate, fmtDateTime, isRequestEditable } from '../../data/requests.js';

/** /tai-khoan/yeu-cau/:id — tiến độ + khung chat với Bali Home + thông tin + tệp của 1 yêu cầu */
export default function RequestDetailPage() {
  const { id } = useParams();
  const { state } = useLocation();
  const [data, setData] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    setData({ status: 'loading' });
    contactApi
      .mineOne(id)
      .then(({ request }) => alive && setData({ status: 'ready', request }))
      .catch((e) => alive && setData({ status: 'error', message: e.message }));
    return () => { alive = false; };
  }, [id]);

  const r = data.request;
  const back = (
    <Link to="/tai-khoan/yeu-cau" className="inline-flex items-center gap-1.5 font-semibold text-ink-2 hover:text-ink">
      <ArrowLeftIcon className="h-4 w-4" /> Tất cả yêu cầu
    </Link>
  );

  if (data.status !== 'ready') {
    return (
      <PortalLayout title="Chi tiết yêu cầu" actions={back}>
        {data.status === 'loading' ? (
          <div className="grid place-items-center py-16 text-action" role="status" aria-label="Đang tải"><Spinner className="h-7 w-7" /></div>
        ) : (
          <Alert>{data.message}</Alert>
        )}
      </PortalLayout>
    );
  }

  const info = [
    ['Mã yêu cầu', r.code],
    ['Dịch vụ', r.needLabel],
    ['Số điện thoại', r.phone],
    ['Doanh nghiệp', r.company || '—'],
    ['Lĩnh vực', r.industry || '—'],
    ['Ngân sách dự kiến', budgetLabel(r.budget)],
    ['Deadline mong muốn', fmtDate(r.deadline)],
    ['Gửi lúc', fmtDateTime(r.createdAt)],
  ];

  return (
    <PortalLayout
      title={r.needLabel}
      subtitle={`${r.code} · cập nhật ${fmtDateTime(r.updatedAt)}`}
      actions={
        <div className="flex flex-wrap items-center gap-4">
          {isRequestEditable(r) && <Button as={Link} to={`/tai-khoan/yeu-cau/${r.id}/chinh-sua`} variant="soft" size="sm">Chỉnh sửa yêu cầu</Button>}
          {back}
        </div>
      }
    >
      {state?.edited && <Alert type="success" className="mb-6">Đã lưu thay đổi của bạn.</Alert>}
      <Panel>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="font-semibold">Tiến độ</p>
          <StatusBadge status={r.status} />
        </div>
        <StatusStepper status={r.status} />
      </Panel>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-5">
        <Panel title={`Trao đổi với Bali Home · ${r.code}`} className="xl:col-span-3">
          <RequestChat
            viewer="customer"
            initialMessages={r.events}
            fetchMessages={() => contactApi.messages(r.id)}
            sendMessage={(payload) => contactApi.sendMessage(r.id, payload)}
          />
        </Panel>
        <div className="grid gap-6 xl:col-span-2">
          <Panel title="Thông tin yêu cầu">
            <dl className="grid gap-1">
              {info.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[9.5rem_1fr] gap-3 rounded-2xl bg-ground px-4 py-3 text-[15px]">
                  <dt className="text-ink-2">{k}</dt>
                  <dd className="min-w-0 break-words font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            {r.message && <p className="mt-4 whitespace-pre-line rounded-2xl bg-ground px-4 py-3 text-[15px] leading-relaxed">{r.message}</p>}
          </Panel>
          <Panel title="Tệp đính kèm">
            <Attachments files={r.attachments} />
          </Panel>
        </div>
      </div>
    </PortalLayout>
  );
}
