import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';
import { cloudinaryEnabled, signUpload } from '../lib/cloudinary.js';

// Mỗi chữ ký dùng cho 1 lần tải file → giới hạn 30 lần / giờ / IP
const signLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Bạn tải lên quá nhiều tệp, vui lòng thử lại sau.' } }),
});

const router = Router(); // /api/uploads

// GET /api/uploads/config — client hỏi xem tính năng tải file có bật không
router.get('/config', (_req, res) => res.json({ enabled: cloudinaryEnabled() }));

// POST /api/uploads/signature — cấp chữ ký để trình duyệt tải thẳng lên Cloudinary
router.post('/signature', signLimiter, (_req, res) => {
  if (!cloudinaryEnabled()) throw new AppError(503, 'UPLOAD_DISABLED', 'Tính năng tải tệp chưa được bật.');
  res.json(signUpload());
});

export default router;
