import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { contactSchema, OTHER_NEED } from '../validators/contact.schema.js';

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

// POST /api/contact — gửi yêu cầu tư vấn / báo giá (khách hoặc thành viên)
router.post('/', contactLimiter, optionalAuth, validate(contactSchema), async (req, res) => {
  const { fullName, phone, email, need, message } = req.body;

  if (need !== OTHER_NEED) {
    const exists = await prisma.service.findFirst({ where: { slug: need, isActive: true }, select: { id: true } });
    if (!exists) throw new AppError(422, 'VALIDATION_ERROR', 'Vui lòng kiểm tra lại thông tin.', { need: 'Dịch vụ không tồn tại' });
  }

  const request = await prisma.contactRequest.create({
    data: { fullName, phone, email, need, message, userId: req.auth?.userId ?? null, ip: req.ip ?? null },
    select: { id: true, createdAt: true },
  });
  res.status(201).json({ request });
});

// GET /api/contact/mine — các yêu cầu của thành viên đang đăng nhập (mới nhất trước), kèm tên dịch vụ
router.get('/mine', requireAuth, async (req, res) => {
  const requests = await prisma.contactRequest.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, need: true, message: true, status: true, createdAt: true },
  });

  const slugs = [...new Set(requests.map((r) => r.need))];
  const services = await prisma.service.findMany({ where: { slug: { in: slugs } }, select: { slug: true, name: true } });
  const nameOf = Object.fromEntries(services.map((s) => [s.slug, s.name]));

  res.json({
    requests: requests.map((r) => ({ ...r, needLabel: nameOf[r.need] ?? (r.need === OTHER_NEED ? 'Tư vấn khác' : r.need) })),
  });
});

export default router;
