/**
 * Lỗi nghiệp vụ có chủ đích → error handler trả về JSON thống nhất:
 *   { error: { code, message, fields? } }
 * - code   : mã máy đọc (frontend dùng để rẽ nhánh)
 * - message: thông báo tiếng Việt hiển thị cho người dùng
 * - fields : lỗi theo từng ô nhập { email: '...', password: '...' }
 */
export class AppError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}
