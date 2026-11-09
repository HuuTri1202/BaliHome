import { Link } from 'react-router-dom';
import { EmptyState } from './PortalLayout.jsx';
import { StatusBadge, StatusStepper } from './StatusBadge.jsx';
import { Button, Spinner } from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { ArrowRightIcon } from '../ui/icons.jsx';
import { fmtDateTime, isRequestEditable } from '../../data/requests.js';

function RequestRow({ request }) {
  const lastNote = [...(request.events ?? [])].reverse().find((event) => event.note)?.note;
  return (
    <li className="overflow-hidden rounded-2xl bg-ground">
      <Link to={`/tai-khoan/yeu-cau/${request.id}`} className="group grid gap-4 p-5 transition-colors hover:bg-ground-3 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lead font-bold group-hover:text-action">{request.needLabel}{request.company ? ` · ${request.company}` : ''}</p>
            <p className="mt-1 text-sm text-ink-2"><span className="font-semibold text-ink">{request.code}</span> · Gửi lúc {fmtDateTime(request.createdAt)}</p>
          </div>
          <StatusBadge status={request.status} />
        </div>
        <StatusStepper status={request.status} compact />
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="line-clamp-1 text-ink-2">{lastNote ? `Bali Home: “${lastNote}”` : 'Chưa có cập nhật mới'}</span>
          <span className="inline-flex shrink-0 items-center gap-1 font-semibold">Chi tiết <ArrowRightIcon className="h-4 w-4" /></span>
        </div>
      </Link>
      {isRequestEditable(request) && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6">
          <Button as={Link} to={`/tai-khoan/yeu-cau/${request.id}/chinh-sua`} variant="soft" size="sm">Chỉnh sửa yêu cầu</Button>
        </div>
      )}
    </li>
  );
}

/**
 * Danh sách yêu cầu kèm trạng thái tải / lỗi / rỗng.
 * @param {{ data: ReturnType<typeof import('../../hooks/useMyRequests.js').useMyRequests>, limit?: number }} props
 */
export default function RequestList({ data, limit }) {
  if (data.status === 'loading') {
    return <div className="grid place-items-center py-10 text-action" role="status" aria-label="Đang tải"><Spinner className="h-6 w-6" /></div>;
  }
  if (data.status === 'error') return <Alert>{data.message}</Alert>;
  if (data.items.length === 0) {
    return (
      <EmptyState to="/bao-gia" cta="Gửi yêu cầu báo giá đầu tiên">
        Bạn chưa gửi yêu cầu nào. Mỗi yêu cầu gửi khi đã đăng nhập sẽ hiện ở đây, cùng tiến độ xử lý từ Bali Home.
      </EmptyState>
    );
  }
  return (
    <ul className="grid gap-2">
      {data.items.slice(0, limit).map((request) => <RequestRow key={request.id} request={request} />)}
    </ul>
  );
}
