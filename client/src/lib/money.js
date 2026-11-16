/* =============================================================================
 * Tiền đồng trong form: khách gõ "15.000.000", "15000000" hay "15 000 000" đều hiểu là 15 triệu.
 * ⚠ Giới hạn khớp MAX_DESIRED_PRICE ở server/src/validators/contact.schema.js
 * ========================================================================== */
export const MAX_DESIRED_PRICE = 2_000_000_000;

/** "15.000.000" → 15000000; rỗng → null; không phải số → NaN (để form báo lỗi) */
export function parseVnd(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;
  const digits = raw.replace(/[\s.,_]/g, '').replace(/(đ|vnd|vnđ)$/i, '');
  return /^\d+$/.test(digits) ? Number(digits) : Number.NaN;
}

/** 15000000 → "15.000.000" (để hiện trong ô nhập) */
export const groupDigits = (value) => (value == null || value === '' ? '' : Number(value).toLocaleString('vi-VN'));

/** 15000000 → "15.000.000 đ"; không có → "—" */
export const formatVnd = (value) => (value == null ? '—' : `${groupDigits(value)} đ`);

/** Kiểm tra giá trị ô "Mức giá mong muốn" (không bắt buộc) */
export function validateDesiredPrice(input) {
  const value = parseVnd(input);
  if (value === null) return undefined;
  if (Number.isNaN(value)) return 'Chỉ nhập số, ví dụ 15.000.000';
  if (value > MAX_DESIRED_PRICE) return 'Mức giá tối đa 2.000.000.000 đ';
  return undefined;
}
