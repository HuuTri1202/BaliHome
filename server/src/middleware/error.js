import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  next(new AppError(404, 'NOT_FOUND', `Không tìm thấy ${req.method} ${req.originalUrl}`));
}

// Express 5 tự chuyển lỗi từ async handler vào đây
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: { code: err.code, message: err.message, ...(err.fields && { fields: err.fields }) },
    });
  }

  // JSON gửi lên bị lỗi cú pháp
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: { code: 'BAD_JSON', message: 'Dữ liệu gửi lên không hợp lệ.' } });
  }

  // Vi phạm unique (VD: 2 request đăng ký cùng email gửi đồng thời)
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    const field = [].concat(err.meta?.target ?? [])[0] ?? 'field';
    return res.status(409).json({
      error: { code: 'CONFLICT', message: 'Dữ liệu đã tồn tại.', fields: { [field]: 'Giá trị này đã được sử dụng' } },
    });
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    console.error('[db]', err.message);
    return res.status(503).json({ error: { code: 'DB_UNAVAILABLE', message: 'Hệ thống đang bảo trì, vui lòng thử lại sau.' } });
  }

  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL', message: 'Đã có lỗi xảy ra, vui lòng thử lại.', ...(!env.isProd && { detail: err.message }) },
  });
}
