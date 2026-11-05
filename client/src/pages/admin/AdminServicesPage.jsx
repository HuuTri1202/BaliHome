import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { Field, TextArea } from '../../components/ui/Field.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowUpRightIcon } from '../../components/ui/icons.jsx';
import { adminApi, ApiError } from '../../lib/api.js';
import { invalidateServices } from '../../hooks/useServices.js';
import { GROUPS } from '../../data/needs.js';

/* =============================================================================
 * /quan-tri/dich-vu — sửa nội dung dịch vụ ngay trên web.
 * Danh sách dạng nhiều dòng: mỗi dòng 1 mục. Quy trình / FAQ: "Tiêu đề | Nội dung".
 * ========================================================================== */
const SEP = ' | ';
const lines = (text) => text.split('\n').map((l) => l.trim()).filter(Boolean);
const pairsToText = (arr, a, b) => (Array.isArray(arr) ? arr.map((x) => `${x[a]}${SEP}${x[b]}`).join('\n') : '');

function toForm(s) {
  return {
    name: s.name,
    group: s.group,
    tagline: s.tagline,
    summary: s.summary,
    deliverables: s.deliverables.join('\n'),
    idealFor: s.idealFor.join('\n'),
    process: pairsToText(s.process, 'title', 'text'),
    faqs: pairsToText(s.faqs, 'q', 'a'),
    priceFrom: s.priceFrom == null ? '' : String(s.priceFrom),
    sortOrder: String(s.sortOrder),
    isActive: s.isActive,
  };
}

/** Đổi "Tiêu đề | Nội dung" → object; trả về lỗi nếu dòng thiếu dấu | */
function parsePairs(text, a, b, label) {
  const items = [];
  for (const line of lines(text)) {
    const i = line.indexOf('|');
    const left = i < 0 ? '' : line.slice(0, i).trim();
    const right = i < 0 ? '' : line.slice(i + 1).trim();
    if (!left || !right) return { error: `${label}: mỗi dòng phải có dạng “Tiêu đề | Nội dung”. Dòng lỗi: “${line.slice(0, 40)}”` };
    items.push({ [a]: left, [b]: right });
  }
  return { items };
}

/** Lỗi server theo từng mục ("faqs.2.a") → gom về ô nhập của danh sách đó ("faqs: Dòng 3: ...") */
function toFieldErrors(fields) {
  const errors = {};
  for (const [path, message] of Object.entries(fields)) {
    const [root, index] = path.split('.');
    if (!errors[root]) errors[root] = index === undefined ? message : `Dòng ${Number(index) + 1}: ${message}`;
  }
  return errors;
}

function ServiceEditor({ service, onSaved, onDirtyChange }) {
  const [form, setForm] = useState(() => toForm(service));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const set = (field) => (e) => {
    onDirtyChange(true);
    setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
    setErrors((x) => ({ ...x, [field]: undefined }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    const process = parsePairs(form.process, 'title', 'text', 'Quy trình');
    const faqs = parsePairs(form.faqs, 'q', 'a', 'Câu hỏi thường gặp');
    const local = {
      ...(process.error && { process: process.error }),
      ...(faqs.error && { faqs: faqs.error }),
      ...(form.priceFrom !== '' && !/^\d+$/.test(form.priceFrom) && { priceFrom: 'Giá chỉ gồm chữ số (đồng), hoặc để trống' }),
      ...(!/^\d+$/.test(form.sortOrder) && { sortOrder: 'Thứ tự chỉ gồm chữ số' }),
    };
    if (Object.keys(local).length) return setErrors(local);

    setSaving(true);
    try {
      const { service: saved } = await adminApi.updateService(service.slug, {
        name: form.name.trim(),
        group: form.group,
        tagline: form.tagline.trim(),
        summary: form.summary.trim(),
        deliverables: lines(form.deliverables),
        idealFor: lines(form.idealFor),
        process: process.items,
        faqs: faqs.items,
        priceFrom: form.priceFrom === '' ? null : Number(form.priceFrom),
        sortOrder: Number(form.sortOrder),
        isActive: form.isActive,
      });
      invalidateServices();
      onDirtyChange(false);
      onSaved(saved);
      setFeedback({ type: 'success', text: 'Đã lưu. Khách sẽ thấy nội dung mới sau vài phút.' });
    } catch (err) {
      if (err instanceof ApiError) setErrors(toFieldErrors(err.fields));
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6 rounded-3xl bg-ground-2 p-5 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[2rem] leading-tight">{service.name}</h2>
        <Link to={`/dich-vu/${service.slug}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold text-action hover:underline">
          Xem trên website <ArrowUpRightIcon className="h-4 w-4" />
        </Link>
      </div>

      {feedback && <Alert type={feedback.type}>{feedback.text}</Alert>}

      <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-ground p-4">
        <input type="checkbox" checked={form.isActive} onChange={set('isActive')} className="h-5 w-5 accent-[var(--action)]" />
        <span>
          <span className="block font-semibold">Hiển thị trên website</span>
          <span className="text-sm text-ink-2">Tắt để ẩn dịch vụ. Các yêu cầu cũ của dịch vụ này vẫn được giữ.</span>
        </span>
      </label>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Tên dịch vụ" value={form.name} onChange={set('name')} error={errors.name} />
        <div>
          <label htmlFor="sv-group" className="mb-2 block text-[15px] font-semibold">Nhóm</label>
          <select id="sv-group" value={form.group} onChange={set('group')} className="h-13 w-full rounded-2xl border border-line bg-ground px-4 text-[16px] outline-none focus:border-action">
            {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
      </div>
      <Field label="Câu giới thiệu ngắn" value={form.tagline} onChange={set('tagline')} error={errors.tagline} />
      <TextArea label="Mô tả" rows={4} value={form.summary} onChange={set('summary')} error={errors.summary} />

      <div className="grid gap-6 lg:grid-cols-2">
        <TextArea label="Bạn nhận được" rows={5} value={form.deliverables} onChange={set('deliverables')} error={errors.deliverables} hint="Mỗi dòng một mục." />
        <TextArea label="Phù hợp khi" rows={5} value={form.idealFor} onChange={set('idealFor')} error={errors.idealFor} hint="Mỗi dòng một mục." />
      </div>
      <TextArea label="Quy trình" rows={4} value={form.process} onChange={set('process')} error={errors.process} hint="Mỗi dòng một bước: Tên bước | Mô tả" />
      <TextArea label="Câu hỏi thường gặp" rows={4} value={form.faqs} onChange={set('faqs')} error={errors.faqs} hint="Mỗi dòng một câu: Câu hỏi | Trả lời" />

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Giá từ (đồng)" inputMode="numeric" optional value={form.priceFrom} onChange={set('priceFrom')} error={errors.priceFrom} placeholder="Để trống = Báo giá theo yêu cầu" />
        <Field label="Thứ tự hiển thị" inputMode="numeric" value={form.sortOrder} onChange={set('sortOrder')} error={errors.sortOrder} hint="Số nhỏ đứng trước." />
      </div>

      <div><Button type="submit" variant="brand" size="lg" loading={saving}>Lưu thay đổi</Button></div>
    </form>
  );
}

export default function AdminServicesPage() {
  const [data, setData] = useState({ status: 'loading', services: [] });
  const [slug, setSlug] = useState('');
  const isDirty = useRef(false);

  const selectService = (nextSlug) => {
    if (nextSlug === slug) return;
    if (isDirty.current && !window.confirm('Bạn có thay đổi chưa lưu. Chuyển dịch vụ khác sẽ mất các thay đổi này?')) return;
    isDirty.current = false;
    setSlug(nextSlug);
  };

  useEffect(() => {
    document.title = 'Dịch vụ — Quản trị Bali Home';
    adminApi
      .services()
      .then(({ services }) => { setData({ status: 'ready', services }); setSlug(services[0]?.slug ?? ''); })
      .catch((e) => setData({ status: 'error', services: [], message: e.message }));
  }, []);

  const current = data.services.find((s) => s.slug === slug);
  const replace = (saved) => setData((d) => ({ ...d, services: d.services.map((s) => (s.slug === saved.slug ? saved : s)) }));

  return (
    <AdminLayout title="Dịch vụ" subtitle="Sửa nội dung, giá và ẩn/hiện dịch vụ trên website.">
      {data.status === 'error' && <Alert>{data.message}</Alert>}
      {data.status === 'loading' && <div className="grid place-items-center py-16 text-action" role="status" aria-label="Đang tải"><Spinner className="h-7 w-7" /></div>}
      {data.status === 'ready' && (
        <div className="grid items-start gap-4 lg:grid-cols-[260px_1fr]">
          <nav aria-label="Chọn dịch vụ" className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 lg:sticky lg:top-6 lg:flex-col lg:gap-1 lg:rounded-3xl lg:bg-ground-2 lg:p-2">
            {data.services.map((s) => (
              <button
                key={s.slug}
                type="button"
                aria-current={s.slug === slug ? 'true' : undefined}
                onClick={() => selectService(s.slug)}
                className={`flex shrink-0 items-center justify-between gap-3 whitespace-nowrap rounded-full px-4 py-2.5 text-left text-[15px] font-semibold transition-colors lg:rounded-2xl ${
                  s.slug === slug ? 'bg-ground-3 text-action' : 'bg-ground-2 text-ink hover:bg-ground-3 lg:bg-transparent'
                }`}
              >
                {s.name}
                {!s.isActive && <span className="text-xs font-medium text-ink-2">Đang ẩn</span>}
              </button>
            ))}
          </nav>
          {/* key = slug → đổi dịch vụ thì form nạp lại dữ liệu của dịch vụ đó */}
          {current && (
            <ServiceEditor
              key={current.slug}
              service={current}
              onSaved={replace}
              onDirtyChange={(dirty) => { isDirty.current = dirty; }}
            />
          )}
        </div>
      )}
    </AdminLayout>
  );
}
