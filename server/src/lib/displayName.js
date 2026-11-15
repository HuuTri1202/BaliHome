/* =============================================================================
 * Họ tên mặc định cho tài khoản tạo từ Google / Facebook (chỉ dùng lúc TẠO MỚI; khách sửa được ở Hồ sơ).
 * Thứ tự ưu tiên:
 *   1. name do nhà cung cấp trả về
 *   2. ghép họ + tên (Google: family_name/given_name, Facebook: last_name/first_name)
 *   3. phần trước @ của email
 *   4. "Khách hàng #<8 ký tự đầu của id>"
 * Mỗi bước được làm sạch trước; bước nào không dùng được (rỗng, quá ngắn, không có chữ cái) thì chuyển bước sau.
 * ========================================================================== */
export const MAX_NAME_LENGTH = 100; // trùng giới hạn họ tên ở validators/auth.schema.js
const MIN_NAME_LENGTH = 2;
// Web cho khách Việt: họ đứng trước ("Nguyễn" + "Văn An" → "Nguyễn Văn An"). Đổi thành false nếu muốn kiểu phương Tây.
const FAMILY_NAME_FIRST = true;

/**
 * Chuẩn hoá Unicode về dạng dựng sẵn (NFC: cùng chữ "Nguyễn" luôn lưu một kiểu → tìm kiếm không sót),
 * bỏ ký tự điều khiển / vô hình, gộp khoảng trắng, cắt độ dài.
 */
export function cleanName(raw) {
  if (typeof raw !== 'string') return '';
  return raw
    .normalize('NFC')
    .replace(/\s+/g, ' ') // trước: Tab/xuống dòng cũng là ký tự điều khiển, xoá trước thì 2 từ dính vào nhau
    .replace(/[\p{Cc}\p{Cf}]/gu, '')
    .replace(/ {2,}/g, ' ')
    .trim()
    .slice(0, MAX_NAME_LENGTH)
    .trim();
}

const isUsableName = (name) => name.length >= MIN_NAME_LENGTH && /\p{L}/u.test(name);

const joinName = (givenName, familyName) => {
  const parts = FAMILY_NAME_FIRST ? [familyName, givenName] : [givenName, familyName];
  return parts.filter((part) => typeof part === 'string' && part.trim()).join(' ');
};

/**
 * @param {{ name?: string|null, givenName?: string|null, familyName?: string|null, email?: string|null, userId: string }} profile
 * @returns {string}
 */
export function pickDisplayName({ name, givenName, familyName, email, userId }) {
  const candidates = [name, joinName(givenName, familyName), typeof email === 'string' ? email.split('@')[0] : ''];
  for (const candidate of candidates) {
    const cleaned = cleanName(candidate);
    if (isUsableName(cleaned)) return cleaned;
  }
  return `Khách hàng #${userId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
}
