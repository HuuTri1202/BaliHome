import { Link, useLocation } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import RequestList from '../../components/portal/RequestList.jsx';
import { Button } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowRightIcon } from '../../components/ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useMyRequests } from '../../hooks/useMyRequests.js';

const RECENT_REQUESTS_LIMIT = 3;
const OPEN_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS'];

/** /tai-khoan — Tổng quan cổng khách hàng: số liệu + vài yêu cầu gần nhất */
export default function PortalHomePage() {
  const { user } = useAuth();
  const { state } = useLocation();
  const data = useMyRequests();

  const items = data.items;
  const stats = [
    ['Tổng yêu cầu', items.length],
    ['Đang xử lý', items.filter((r) => OPEN_STATUSES.includes(r.status)).length],
    ['Hoàn thành', items.filter((r) => r.status === 'DONE').length],
  ];
  const viewAllLink = items.length > RECENT_REQUESTS_LIMIT && (
    <Link to="/tai-khoan/yeu-cau" className="inline-flex items-center gap-1.5 font-semibold text-action hover:underline">
      Xem tất cả <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );

  return (
    <PortalLayout
      title={`Xin chào, ${user.fullName.split(' ').slice(-1)[0]}`}
      subtitle="Theo dõi tiến độ các yêu cầu và báo giá bạn đã gửi Bali Home."
      actions={<Button as={Link} to="/bao-gia" bubble>Yêu cầu báo giá mới</Button>}
    >
      {state?.welcome && <Alert type="success" className="mb-6">Tạo tài khoản thành công. Chào mừng bạn đến với Bali Home!</Alert>}
      {state?.sent && <Alert type="success" className="mb-6">Đã gửi yêu cầu. Bali Home sẽ liên hệ với bạn sớm.</Alert>}

      <dl className="grid gap-3 sm:grid-cols-3">
        {stats.map(([label, count]) => (
          <div key={label} className="rounded-3xl bg-ground-2 p-6">
            <dt className="text-sm text-ink-2">{label}</dt>
            <dd className="mt-2 font-display text-[2.5rem] leading-none tabular-nums">{data.status === 'ready' ? count : '—'}</dd>
          </div>
        ))}
      </dl>

      <Panel title="Yêu cầu gần đây" action={viewAllLink} className="mt-6">
        <RequestList data={data} limit={RECENT_REQUESTS_LIMIT} />
      </Panel>
    </PortalLayout>
  );
}
