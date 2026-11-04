import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { contactSchema } from '../validators/contact.schema.js';

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

// POST /api/contact — gửi yêu cầu tư vấn (khách hoặc thành viên)
router.post('/', contactLimiter, optionalAuth, validate(contactSchema), async (req, res) => {
  const { fullName, phone, email, need, message } = req.body;
  const request = await prisma.contactRequest.create({
    data: { fullName, phone, email, need, message, userId: req.auth?.userId ?? null, ip: req.ip ?? null },
    select: { id: true, createdAt: true },
  });
  res.status(201).json({ request });
});

// GET /api/contact/mine — các yêu cầu của thành viên đang đăng nhập (mới nhất trước)
router.get('/mine', requireAuth, async (req, res) => {
  const requests = await prisma.contactRequest.findMany({
    where: { userId: req.auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, need: true, message: true, status: true, createdAt: true },
  });
  res.json({ requests });
});

export default router;
