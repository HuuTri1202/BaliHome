import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { requireAuth } from '../middleware/auth.js';
import { isUuid } from '../validators/contact.schema.js';

const LIST_LIMIT = 20;

/* Thông báo của tài khoản đang đăng nhập. Mọi truy vấn đều lọc theo userId của phiên. */
const router = Router();
router.use(requireAuth);

// GET /api/notifications — thông báo mới nhất + số chưa đọc
router.get('/', async (req, res) => {
  const { userId } = req.auth;
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
      select: { id: true, requestId: true, kind: true, title: true, body: true, readAt: true, createdAt: true },
    }),
    prisma.notification.count({ where: { userId, readAt: null } }),
  ]);
  res.json({ notifications, unreadCount });
});

// POST /api/notifications/read-all
router.post('/read-all', async (req, res) => {
  await prisma.notification.updateMany({ where: { userId: req.auth.userId, readAt: null }, data: { readAt: new Date() } });
  res.json({ ok: true });
});

// POST /api/notifications/requests/:requestId/read — khách mở cuộc trò chuyện của 1 yêu cầu
router.post('/requests/:requestId/read', async (req, res) => {
  if (!isUuid(req.params.requestId)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  await prisma.notification.updateMany({
    where: { userId: req.auth.userId, requestId: req.params.requestId, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ ok: true });
});

// POST /api/notifications/:id/read
router.post('/:id/read', async (req, res) => {
  if (!isUuid(req.params.id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy thông báo.');
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId: req.auth.userId, readAt: null },
    data: { readAt: new Date() },
  });
  res.json({ ok: true });
});

export default router;
