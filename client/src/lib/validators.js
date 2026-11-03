// Kiểm tra phía client để phản hồi tức thì.
// ⚠ Giữ đồng bộ với server/src/validators/auth.schema.js (server luôn kiểm tra lại).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(0|\+84)[1-9]\d{8}$/;

export const rules = {
  fullName: (v) => {
    const s = v.trim();
    if (!s) return 'Vui lòng nhập họ tên';
    if (s.length < 2) return 'Họ tên tối thiểu 2 ký tự';
    if (s.length > 100) return 'Họ tên tối đa 100 ký tự';
  },
  email: (v) => {
    const s = v.trim();
    if (!s) return 'Vui lòng nhập email';
    if (!EMAIL_RE.test(s)) return 'Email không hợp lệ';
  },
  phone: (v) => {
    const s = v.replace(/[\s.-]/g, '');
    if (s && !PHONE_RE.test(s)) return 'Số điện thoại không hợp lệ';
  },
  newPassword: (v) => {
    if (!v) return 'Vui lòng nhập mật khẩu';
    if (v.length < 8) return 'Mật khẩu tối thiểu 8 ký tự';
    if (v.length > 72) return 'Mật khẩu tối đa 72 ký tự';
    if (!/[A-Za-zÀ-ỹ]/.test(v)) return 'Mật khẩu cần có ít nhất 1 chữ cái';
    if (!/\d/.test(v)) return 'Mật khẩu cần có ít nhất 1 chữ số';
  },
  password: (v) => (!v ? 'Vui lòng nhập mật khẩu' : undefined),
};

/** Chạy rules cho cả form → { field: 'lỗi' } (rỗng = hợp lệ) */
export function validateForm(values, schema) {
  const errors = {};
  for (const [field, rule] of Object.entries(schema)) {
    const msg = rule(values[field] ?? '', values);
    if (msg) errors[field] = msg;
  }
  return errors;
}

/** Chấm điểm độ mạnh mật khẩu 0–4 */
export function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}
