// Dữ liệu hiển thị cho yêu cầu / báo giá. ⚠ Khoá phải khớp server/src/validators/contact.schema.js

/** Trạng thái yêu cầu theo thứ tự tiến độ (CANCELLED nằm ngoài chuỗi) */
export const STATUS = {
  NEW: { label: 'Mới tiếp nhận', tone: 'bg-ground-3 text-ink' },
  CONTACTED: { label: 'Đã liên hệ', tone: 'bg-[color-mix(in_srgb,#38bdf8_16%,var(--ground))] text-sky-700 dark:text-sky-300' },
  IN_PROGRESS: { label: 'Đang xử lý', tone: 'bg-[color-mix(in_srgb,#f59e0b_20%,var(--ground))] text-amber-700 dark:text-amber-300' },
  DONE: { label: 'Hoàn thành', tone: 'bg-[color-mix(in_srgb,var(--success)_16%,var(--ground))] text-success' },
  CANCELLED: { label: 'Đã huỷ', tone: 'bg-[color-mix(in_srgb,var(--signal)_12%,var(--ground))] text-signal' },
};
export const STATUS_FLOW = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'DONE'];
export const statusLabel = (s) => STATUS[s]?.label ?? s;

export const BUDGETS = [
  { value: 'under-5m', label: 'Dưới 5 triệu' },
  { value: '5-15m', label: '5 – 15 triệu' },
  { value: '15-50m', label: '15 – 50 triệu' },
  { value: 'over-50m', label: 'Trên 50 triệu' },
  { value: 'unsure', label: 'Chưa xác định' },
];
export const budgetLabel = (v) => BUDGETS.find((b) => b.value === v)?.label ?? '—';

/** Gợi ý lĩnh vực (khách vẫn có thể gõ lĩnh vực khác) */
export const INDUSTRIES = ['F&B / Nhà hàng', 'Bán lẻ', 'Bất động sản', 'Giáo dục', 'Làm đẹp / Spa', 'Công nghệ', 'Sản xuất', 'Dịch vụ'];

const pad = (n) => String(n).padStart(2, '0');
export const fmtDate = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  return `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}`;
};
export const fmtDateTime = (d) => (d ? `${pad(new Date(d).getHours())}:${pad(new Date(d).getMinutes())}, ${fmtDate(d)}` : '—');
export const fmtBytes = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
export const shortId = (id = '') => `YC-${id.replace(/-/g, '').slice(0, 6).toUpperCase()}`;
