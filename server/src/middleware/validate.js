import { AppError } from '../utils/AppError.js';

/** Kiểm tra req.body theo Zod schema; hợp lệ → req.body = dữ liệu đã chuẩn hoá */
export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body ?? {});
  if (!result.success) {
    const fields = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      fields[key] ??= issue.message; // chỉ giữ lỗi đầu tiên mỗi ô
    }
    throw new AppError(422, 'VALIDATION_ERROR', 'Vui lòng kiểm tra lại thông tin.', fields);
  }
  req.body = result.data;
  next();
};
