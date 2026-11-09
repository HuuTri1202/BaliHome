import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import RequestList from '../../components/portal/RequestList.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { useMyRequests } from '../../hooks/useMyRequests.js';

/** /tai-khoan/yeu-cau — toàn bộ yêu cầu tài khoản đã gửi: dịch vụ, trạng thái, thời gian */
export default function MyRequestsPage() {
  const data = useMyRequests();

  useEffect(() => { document.title = 'Yêu cầu của tôi — Bali Home'; }, []);

  return (
    <PortalLayout
      title="Yêu cầu của tôi"
      subtitle={data.status === 'ready' ? `${data.items.length} yêu cầu đã gửi` : undefined}
      actions={<Button as={Link} to="/bao-gia" bubble>Yêu cầu báo giá mới</Button>}
    >
      <Panel>
        <RequestList data={data} />
      </Panel>
    </PortalLayout>
  );
}
