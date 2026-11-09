import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { Panel } from '../../components/portal/PortalLayout.jsx';
import { StatusBadge, StatusStepper } from '../../components/portal/StatusBadge.jsx';
import Timeline from '../../components/portal/Timeline.jsx';
import Attachments from '../../components/portal/Attachments.jsx';
import { TextArea } from '../../components/ui/Field.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowLeftIcon } from '../../components/ui/icons.jsx';
import { adminApi } from '../../lib/api.js';
import { STATUS, budgetLabel, fmtDate, fmtDateTime } from '../../data/requests.js';

/** /quan-tri/yeu-cau/:id — xem đầy đủ + đổi trạng thái + gửi ghi chú (khách nhìn thấy ghi chú) */
export default function AdminRequestDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState({ status: 'loading' });
  const [next, setNext] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const load = useCallback(() => {
    return adminApi
      .get(id)
      .then(({ request }) => { setData({ status: 'ready', request }); setNext(request.status); })
      .catch((e) => setData({ status: 'error', message: e.message }));
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const r = data.request;
  const back = (
    <Link to="/quan-tri/yeu-cau" className="inline-flex items-center gap-1.5 font-semibold text-ink-2 hover:text-ink">
      <ArrowLeftIcon className="h-4 w-4" /> Danh sách yêu cầu
    </Link>
  );

  if (data.status !== 'ready') {
    return (
      <AdminLayout title="Chi tiết yêu cầu" actions={back}>
        {data.status === 'loading'
          ? <div className="grid place-items-center py-16 text-action" role="status" aria-label="Đang tải"><Spinner className="h-7 w-7" /></div>
          : <Alert>{data.message}</Alert>}
      </AdminLayout>
    );
  }

  const changed = next !== r.status;
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!changed && !note.trim()) return setFeedback({ type: 'error', text: 'Hãy đổi trạng thái hoặc nhập ghi chú.' });
    setSaving(true);
    setFeedback(null);
    try {
      await adminApi.update(r.id, { ...(changed && { status: next }), ...(note.trim() && { note: note.trim() }) });
      setNote('');
      await load();
      setFeedback({ type: 'success', text: 'Đã cập nhật. Khách sẽ thấy thay đổi trong tài khoản của họ.' });
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const info = [
    ['Khách hàng', r.fullName],
    ['Số điện thoại', <a key="p" href={`tel:${r.phone}`} className="text-action hover:underline">{r.phone}</a>],
    ['Email', r.email ? <a key="e" href={`mailto:${r.email}`} className="text-action hover:underline">{r.email}</a> : '—'],
    ['Tài khoản', r.user ? `${r.user.fullName} (thành viên)` : 'Khách vãng lai'],
    ['Doanh nghiệp', r.company || '—'],
    ['Lĩnh vực', r.industry || '—'],
    ['Dịch vụ', r.needLabel],
    ['Ngân sách', budgetLabel(r.budget)],
    ['Deadline', fmtDate(r.deadline)],
    ['Gửi lúc', fmtDateTime(r.createdAt)],
  ];

  return (
    <AdminLayout title={r.fullName} subtitle={`${r.code} · ${r.needLabel}`} actions={back}>
      <Panel>
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="font-semibold">Tiến độ hiện tại</p>
          <StatusBadge status={r.status} />
        </div>
        <StatusStepper status={r.status} />
      </Panel>

      <div className="mt-6 grid items-start gap-6 xl:grid-cols-5">
        <div className="grid gap-6 xl:col-span-3">
          <Panel title="Cập nhật cho khách">
            <form onSubmit={onSubmit} className="grid gap-5">
              {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}
              <fieldset>
                <legend className="mb-3 text-[15px] font-semibold">Trạng thái</legend>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS).map(([value, s]) => (
                    <label key={value} className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-action ${next === value ? 'bg-ink text-ground' : 'bg-ground text-ink hover:bg-ground-3'}`}>
                      <input type="radio" name="status" value={value} checked={next === value} onChange={() => setNext(value)} className="sr-only" />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <TextArea
                label="Ghi chú gửi khách"
                optional
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Đã gửi báo giá qua email, mời anh/chị xem và phản hồi."
                hint="Khách nhìn thấy ghi chú này trong dòng thời gian của yêu cầu."
              />
              <div><Button type="submit" loading={saving}>Lưu cập nhật</Button></div>
            </form>
          </Panel>
          <Panel title="Dòng thời gian">
            <Timeline events={r.events} showAuthor />
          </Panel>
        </div>

        <div className="grid gap-6 xl:col-span-2">
          <Panel title="Thông tin">
            <dl className="grid gap-1">
              {info.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-3 rounded-2xl bg-ground px-4 py-3 text-[15px]">
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
    </AdminLayout>
  );
}
