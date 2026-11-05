import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

/** Quyền lấy từ DB (không tin role trong JWT có thể cũ tới 15 phút) → hạ quyền là mất quyền ngay */
export async function requireAdminFromDb(req, _res, next) {
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { role: true } });
  if (user?.role !== 'ADMIN') throw new AppError(403, 'FORBIDDEN', 'Bạn không có quyền truy cập.');
  next();
}
