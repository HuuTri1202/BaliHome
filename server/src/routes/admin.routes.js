import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { requireAuth } from '../middleware/auth.js';
import { requireAdminFromDb } from '../middleware/admin.js';
import systemRoutes from './admin.system.routes.js';
import { validate } from '../middleware/validate.js';
import { adminUpdateSchema, isUuid, STATUSES } from '../validators/contact.schema.js';
import { withServiceNames } from '../services/requests.service.js';
import { requestUpdateNotification } from '../services/notifications.service.js';

/* =============================================================================
 * API quản trị — MỌI route đều qua requireAuth + requireRole('ADMIN') (kiểm tra ở server,
 * không dựa vào việc ẩn nút ở giao diện).
 * ========================================================================== */
const router = Router();
router.use(requireAuth, requireAdminFromDb);
router.use(systemRoutes); // /overview, /series, /users, /services

const PAGE_SIZE = 20;

const ADMIN_LIST_SELECT = {
  id: true, code: true, fullName: true, phone: true, email: true, company: true, need: true,
  budget: true, deadline: true, status: true, createdAt: true, updatedAt: true,
  _count: { select: { attachments: true } },
};

// GET /api/admin/stats — số yêu cầu theo trạng thái
router.get('/stats', async (_req, res) => {
  const rows = await prisma.contactRequest.groupBy({ by: ['status'], _count: { _all: true } });
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  rows.forEach((r) => { byStatus[r.status] = r._count._all; });
  res.json({ byStatus, total: Object.values(byStatus).reduce((a, b) => a + b, 0) });
});

// GET /api/admin/requests?status=NEW&q=abc&page=1
router.get('/requests', async (req, res) => {
  const status = STATUSES.includes(req.query.status) ? req.query.status : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const page = Math.max(1, Math.min(500, parseInt(req.query.page, 10) || 1));

  const where = {
    ...(status && { status }),
    ...(q && {
      OR: [
        { code: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q.replace(/\s/g, '') } },
        { email: { contains: q, mode: 'insensitive' } },
        { company: { contains: q, mode: 'insensitive' } },
      ],
    }),
  };

  const [total, rows] = await prisma.$transaction([
    prisma.contactRequest.count({ where }),
    prisma.contactRequest.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE, select: ADMIN_LIST_SELECT }),
  ]);
  res.json({ requests: await withServiceNames(rows), page, pageSize: PAGE_SIZE, total });
});

// GET /api/admin/requests/:id — đầy đủ thông tin + file + timeline (kèm người thao tác)
router.get('/requests/:id', async (req, res) => {
  if (!isUuid(req.params.id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const request = await prisma.contactRequest.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      attachments: { orderBy: { createdAt: 'asc' } },
      events: { orderBy: { createdAt: 'asc' }, include: { author: { select: { fullName: true } } } },
    },
  });
  if (!request) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const [withName] = await withServiceNames([request]);
  res.json({ request: withName });
});

// PATCH /api/admin/requests/:id { status?, note? } — đổi trạng thái / gửi ghi chú cho khách → ghi timeline
router.patch('/requests/:id', validate(adminUpdateSchema), async (req, res) => {
  if (!isUuid(req.params.id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const current = await prisma.contactRequest.findUnique({ where: { id: req.params.id }, select: { id: true, status: true, code: true, userId: true } });
  if (!current) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');

  const { status, note } = req.body;
  const statusChanged = status && status !== current.status;
  if (!statusChanged && !note) throw new AppError(422, 'VALIDATION_ERROR', 'Không có gì thay đổi.', { status: 'Trạng thái không đổi' });

  await prisma.$transaction([
    ...(statusChanged ? [prisma.contactRequest.update({ where: { id: current.id }, data: { status } })] : [prisma.contactRequest.update({ where: { id: current.id }, data: { updatedAt: new Date() } })]),
    prisma.requestEvent.create({
      data: {
        requestId: current.id,
        kind: statusChanged ? 'status' : 'note',
        fromStatus: statusChanged ? current.status : null,
        toStatus: statusChanged ? status : null,
        note: note ?? null,
        authorId: req.auth.userId,
      },
    }),
    ...requestUpdateNotification({ request: current, newStatus: statusChanged ? status : null, note }),
  ]);
  res.json({ ok: true });
});

export default router;
