import { useEffect, useState } from 'react';
import { Panel } from './PortalLayout.jsx';
import { authApi } from '../../lib/api.js';
import { fmtDateTime } from '../../data/requests.js';

/** Tài khoản Google / Facebook đã liên kết. Liên kết được tạo khi khách đăng nhập bằng nhà cung cấp đó. */
export default function LinkedAccounts({ className = '' }) {
  const [state, setState] = useState({ status: 'loading', identities: [] });

  useEffect(() => {
    let isCurrent = true;
    authApi
      .identities()
      .then(({ identities }) => isCurrent && setState({ status: 'ready', identities }))
      .catch(() => isCurrent && setState({ status: 'error', identities: [] }));
    return () => { isCurrent = false; };
  }, []);

  return (
    <Panel title="Tài khoản liên kết" className={className}>
      {state.status === 'loading' && <p className="text-sm text-ink-2" role="status">Đang tải…</p>}
      {state.status === 'error' && <p className="text-sm text-signal">Không tải được danh sách liên kết. Vui lòng tải lại trang.</p>}
      {state.status === 'ready' && state.identities.length === 0 && (
        <p className="text-sm text-ink-2">Chưa liên kết. Lần sau bấm “Đăng nhập bằng Google/Facebook” với cùng email này để liên kết.</p>
      )}
      {state.identities.length > 0 && (
        <ul className="grid gap-2">
          {state.identities.map(({ provider, label, linkedAt }) => (
            <li key={provider} className="flex items-center justify-between gap-3 rounded-2xl bg-ground px-4 py-3">
              <span className="font-semibold">{label}</span>
              <span className="text-sm text-ink-2">Từ {fmtDateTime(linkedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
