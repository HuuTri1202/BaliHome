// Kiểm tra phía client để phản hồi tức thì.
// ⚠ Giữ đồng bộ với server/src/validators/auth.schema.js (server luôn kiểm tra lại).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^(0|\+84)[1-9]\d{8}$/;
const MIN_PASSWORD_LENGTH = 8;
const HAS_LETTER_RE = /[A-Za-zÀ-ỹ]/;
const HAS_DIGIT_RE = /\d/;

/** Các điều kiện bắt buộc của mật khẩu, để hiện trạng thái theo thời gian thực */
export const passwordChecks = (password) => [
  { label: `Đủ ${MIN_PASSWORD_LENGTH} ký tự`, isMet: password.length >= MIN_PASSWORD_LENGTH },
  { label: 'Có chữ cái', isMet: HAS_LETTER_RE.test(password) },
  { label: 'Có chữ số', isMet: HAS_DIGIT_RE.test(password) },
];

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
    if (v.length < MIN_PASSWORD_LENGTH) return `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`;
    if (v.length > 72) return 'Mật khẩu tối đa 72 ký tự';
    if (!HAS_LETTER_RE.test(v)) return 'Mật khẩu cần có ít nhất 1 chữ cái';
    if (!HAS_DIGIT_RE.test(v)) return 'Mật khẩu cần có ít nhất 1 chữ số';
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
