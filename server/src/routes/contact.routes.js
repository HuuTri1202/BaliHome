import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { contactSchema, OTHER_NEED } from '../validators/contact.schema.js';
import { isOwnUpload } from '../lib/cloudinary.js';
import { CUSTOMER_REQUEST_SELECT, withServiceNames } from '../services/requests.service.js';

// Chống spam: tối đa 5 yêu cầu / giờ / IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({
      error: { code: 'TOO_MANY_REQUESTS', message: 'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi trực tiếp cho Bali Home.' },
    }),
});

const router = Router();

// POST /api/contact — gửi yêu cầu tư vấn / báo giá (form nhanh hoặc form nhiều bước)
router.post('/', contactLimiter, optionalAuth, validate(contactSchema), async (req, res) => {
  const { attachments, ...data } = req.body;

  if (data.need !== OTHER_NEED) {
    const exists = await prisma.service.findFirst({ where: { slug: data.need, isActive: true }, select: { id: true } });
    if (!exists) throw new AppError(422, 'VALIDATION_ERROR', 'Vui lòng kiểm tra lại thông tin.', { need: 'Dịch vụ không tồn tại' });
  }
  // Chỉ nhận file đã tải lên đúng tài khoản + thư mục Cloudinary của Bali Home
  if (attachments.some((a) => !isOwnUpload(a))) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Tệp đính kèm không hợp lệ.', { attachments: 'Tệp đính kèm không hợp lệ' });
  }

  const request = await prisma.contactRequest.create({
    data: {
      ...data,
      userId: req.auth?.userId ?? null,
      ip: req.ip ?? null,
      events: { create: { kind: 'created', toStatus: 'NEW' } },
      attachments: { create: attachments.map(({ url, publicId, fileName, bytes, format }) => ({ url, publicId, fileName, bytes, format: format ?? null })) },
    },
    select: { id: true, createdAt: true },
  });
  res.status(201).json({ request });
});

// GET /api/contact/mine — yêu cầu của thành viên đang đăng nhập (mới nhất trước), kèm timeline
router.get('/mine', requireAuth, async (req, res) => {
  const requests = await prisma.contactRequest.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: CUSTOMER_REQUEST_SELECT,
  });
  res.json({ requests: await withServiceNames(requests) });
});

// GET /api/contact/mine/:id — chi tiết 1 yêu cầu CỦA CHÍNH người dùng (không xem được của người khác)
router.get('/mine/:id', requireAuth, async (req, res) => {
  const id = String(req.params.id);
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const request = await prisma.contactRequest.findFirst({
    where: { id, userId: req.auth.userId },
    select: CUSTOMER_REQUEST_SELECT,
  });
  if (!request) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const [withName] = await withServiceNames([request]);
  res.json({ request: withName });
});

export default router;
