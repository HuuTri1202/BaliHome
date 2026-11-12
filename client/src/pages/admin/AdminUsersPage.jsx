import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { initials } from '../../lib/initials.js';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowLeftIcon, ArrowRightIcon } from '../../components/ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { adminApi } from '../../lib/api.js';
import { fmtDate, fmtDateTime } from '../../data/requests.js';

const ROLE_FILTERS = [['', 'Tất cả'], ['USER', 'Thành viên'], ['ADMIN', 'Quản trị viên']];

/** /quan-tri/khach-hang — danh sách tài khoản, tìm kiếm, cấp / gỡ quyền quản trị */
export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const role = params.get('role') ?? '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [search, setSearch] = useState(q);
  const [data, setData] = useState({ status: 'loading' });
  const [confirm, setConfirm] = useState(null); // tài khoản đang chờ xác nhận đổi quyền
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const setParam = (patch) =>
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, String(v)) : next.delete(k)));
      return next;
    });

  // Chỉ nhận phản hồi của lần tải mới nhất, tránh phản hồi chậm ghi đè bộ lọc vừa chọn
  const latestLoad = useRef(0);
  const load = useCallback(() => {
    const loadId = ++latestLoad.current;
    return adminApi
      .users({ q, role, page })
      .then((res) => { if (loadId === latestLoad.current) setData({ status: 'ready', ...res }); })
      .catch((e) => { if (loadId === latestLoad.current) setData({ status: 'error', message: e.message }); });
  }, [q, role, page]);

  useEffect(() => { document.title = 'Khách hàng — Quản trị Bali Home'; load(); }, [load]);

  const applyRole = async () => {
    const nextRole = confirm.role === 'ADMIN' ? 'USER' : 'ADMIN';
    setSaving(true);
    setFeedback(null);
    try {
      await adminApi.setRole(confirm.id, nextRole);
      setFeedback({ type: 'success', text: `${confirm.fullName} giờ là ${nextRole === 'ADMIN' ? 'quản trị viên' : 'thành viên'}.` });
      await load();
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
      setConfirm(null);
    }
  };

  const totalPages = data.total ? Math.ceil(data.total / data.pageSize) : 1;

  return (
    <AdminLayout title="Khách hàng" subtitle={data.total != null ? `${data.total} tài khoản` : undefined}>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-full bg-ground-2 p-1" role="group" aria-label="Lọc theo vai trò">
          {ROLE_FILTERS.map(([value, label]) => (
            <button
              key={value || 'all'}
              type="button"
              aria-pressed={role === value}
              onClick={() => setParam({ role: value, page: '' })}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${role === value ? 'bg-ground-3 text-action' : 'text-ink-2 hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>
        <form className="flex min-w-[240px] flex-1 gap-2" role="search" onSubmit={(e) => { e.preventDefault(); setParam({ q: search.trim(), page: '' }); }}>
          <label htmlFor="user-search" className="sr-only">Tìm khách hàng</label>
          <input
            id="user-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại…"
            className="h-11 min-w-0 flex-1 rounded-full border border-line bg-ground-2 px-5 text-[15px] outline-none focus:border-action"
          />
          <Button type="submit" variant="soft">Tìm</Button>
        </form>
      </div>

      {feedback && <Alert type={feedback.type} className="mt-4">{feedback.text}</Alert>}
      {data.status === 'error' && <Alert className="mt-4">{data.message}</Alert>}

      <section className="mt-5 rounded-3xl bg-ground-2 p-3 sm:p-4" aria-label="Danh sách tài khoản">
        {data.status === 'loading' && <div className="grid place-items-center py-14 text-action" role="status" aria-label="Đang tải"><Spinner className="h-7 w-7" /></div>}
        {data.users?.length === 0 && <p className="p-6 text-ink-2">Không có tài khoản nào khớp bộ lọc.</p>}
        <ul className="grid gap-1">
          {data.users?.map((u) => {
            const isMe = u.id === me?.id;
            return (
              <li key={u.id} className="grid gap-3 rounded-2xl p-4 transition-colors hover:bg-ground-3 md:grid-cols-[1.4fr_1fr_auto] md:items-center">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="hex hex-ratio grid w-11 shrink-0 place-items-center bg-ground-3 text-xs font-bold text-action" aria-hidden="true">{initials(u.fullName)}</span>
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {u.fullName}{isMe && <span className="font-normal text-ink-2"> (bạn)</span>}
                    </span>
                    <span className="block truncate text-sm text-ink-2">{u.email}{u.phone ? ` · ${u.phone}` : ''}</span>
                  </span>
                </div>
                <p className="text-sm text-ink-2">
                  Tham gia {fmtDate(u.createdAt)} · <span className="tabular-nums">{u._count.contactRequests}</span> yêu cầu
                  <span className="block">Đăng nhập: {fmtDateTime(u.lastLoginAt)}</span>
                </p>
                <div className="flex items-center gap-3 md:justify-end">
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${u.role === 'ADMIN' ? 'bg-[color-mix(in_srgb,var(--action)_18%,transparent)] text-action' : 'bg-ground-3 text-ink'}`}>
                    {u.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                  </span>
                  {!isMe && (
                    <Button variant="ghost" size="sm" onClick={() => setConfirm(u)}>
                      {u.role === 'ADMIN' ? 'Gỡ quyền' : 'Cấp quyền'}
                    </Button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        {totalPages > 1 && (
          <nav className="mt-3 flex items-center justify-between p-2" aria-label="Phân trang">
            <Button variant="soft" size="sm" disabled={page <= 1} onClick={() => setParam({ page: page - 1 })}><ArrowLeftIcon className="h-4 w-4" /> Trước</Button>
            <span className="text-sm text-ink-2">Trang {page} / {totalPages}</span>
            <Button variant="soft" size="sm" disabled={page >= totalPages} onClick={() => setParam({ page: page + 1 })}>Sau <ArrowRightIcon className="h-4 w-4" /></Button>
          </nav>
        )}
      </section>

      {/* Xác nhận đổi quyền: thao tác nhạy cảm */}
      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="role-title">
          <div className="w-full max-w-md rounded-3xl bg-ground-2 p-7">
            <h2 id="role-title" className="font-display text-[1.75rem] leading-tight">
              {confirm.role === 'ADMIN' ? 'Gỡ quyền quản trị?' : 'Cấp quyền quản trị?'}
            </h2>
            <p className="mt-3 text-ink">
              <strong>{confirm.fullName}</strong> ({confirm.email}){' '}
              {confirm.role === 'ADMIN'
                ? 'sẽ không còn vào được trang quản trị.'
                : 'sẽ xem được toàn bộ yêu cầu, thông tin khách hàng và sửa được dịch vụ.'}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="soft" onClick={() => setConfirm(null)} autoFocus>Huỷ</Button>
              <Button variant={confirm.role === 'ADMIN' ? 'danger' : 'brand'} loading={saving} onClick={applyRole}>
                {confirm.role === 'ADMIN' ? 'Gỡ quyền' : 'Cấp quyền'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
