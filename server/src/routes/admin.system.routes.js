import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { validate } from '../middleware/validate.js';
import { cloudinaryEnabled } from '../lib/cloudinary.js';
import { adminRoleSchema, adminServiceSchema, isUuid, STATUSES } from '../validators/contact.schema.js';
import { serviceNameMap, withServiceNames } from '../services/requests.service.js';

/* =============================================================================
 * API quản trị toàn hệ thống: tổng quan, khách hàng, dịch vụ.
 * Được gắn BÊN TRONG admin.routes.js → đã qua requireAuth + requireAdminFromDb.
 * Mọi con số đều tính từ dữ liệu thật trong DB.
 * ========================================================================== */
const router = Router();

const DAY = 86_400_000;
const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const USERS_PAGE_SIZE = 20;
const ALLOWED_RANGES = [7, 30, 90];
const OPEN_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS'];

/** Ngày YYYY-MM-DD theo giờ Việt Nam */
const vnDay = (date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(date);

/** Số yêu cầu theo từng ngày, đủ cả ngày không có yêu cầu (= 0) */
async function requestSeries(days) {
  const since = new Date(Date.now() - (days - 1) * DAY);
  const rows = await prisma.$queryRaw`
    SELECT to_char(created_at AT TIME ZONE 'UTC' AT TIME ZONE ${TIME_ZONE}, 'YYYY-MM-DD') AS day, count(*)::int AS count
    FROM contact_requests
    WHERE created_at >= ${new Date(since.getTime() - DAY)}
    GROUP BY 1`;
  const byDay = new Map(rows.map((r) => [r.day, r.count]));
  return Array.from({ length: days }, (_, i) => {
    const day = vnDay(new Date(since.getTime() + i * DAY));
    return { day, count: byDay.get(day) ?? 0 };
  });
}

// GET /api/admin/overview — số liệu tổng quan cho trang đầu
router.get('/overview', async (_req, res) => {
  const now = Date.now();
  const [statusRows, users, newUsers7d, last7, prev7, attachments, needRows, services, recent] = await Promise.all([
    prisma.contactRequest.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: new Date(now - 7 * DAY) } } }),
    prisma.contactRequest.count({ where: { createdAt: { gte: new Date(now - 7 * DAY) } } }),
    prisma.contactRequest.count({ where: { createdAt: { gte: new Date(now - 14 * DAY), lt: new Date(now - 7 * DAY) } } }),
    prisma.attachment.count(),
    prisma.contactRequest.groupBy({ by: ['need'], _count: { _all: true } }),
    prisma.service.findMany({ select: { slug: true, name: true, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.contactRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      select: { id: true, fullName: true, company: true, need: true, status: true, createdAt: true },
    }),
  ]);

  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  statusRows.forEach((r) => { byStatus[r.status] = r._count._all; });
  const total = Object.values(byStatus).reduce((a, b) => a + b, 0);
  const open = OPEN_STATUSES.reduce((sum, s) => sum + byStatus[s], 0);
  const decided = total - byStatus.CANCELLED;

  const counts = new Map(needRows.map((r) => [r.need, r._count._all]));
  const nameOf = await serviceNameMap(needRows.map((r) => r.need));
  const byService = [
    ...services.map((s) => ({ slug: s.slug, name: s.name, isActive: s.isActive, count: counts.get(s.slug) ?? 0 })),
    ...(counts.has('other') ? [{ slug: 'other', name: nameOf('other'), isActive: true, count: counts.get('other') }] : []),
  ].sort((a, b) => b.count - a.count);

  res.json({
    byStatus,
    total,
    open,
    completionRate: decided ? Math.round((byStatus.DONE / decided) * 100) : null,
    last7,
    prev7,
    users,
    newUsers7d,
    attachments,
    servicesActive: services.filter((s) => s.isActive).length,
    servicesTotal: services.length,
    uploadsEnabled: cloudinaryEnabled(),
    byService,
    recent: await withServiceNames(recent),
  });
});

// GET /api/admin/series?days=7|30|90 — yêu cầu theo ngày cho biểu đồ
router.get('/series', async (req, res) => {
  const days = Number(req.query.days);
  res.json({ series: await requestSeries(ALLOWED_RANGES.includes(days) ? days : 30) });
});

/* ------------------------------ Khách hàng ------------------------------ */

// GET /api/admin/users?q=abc&role=ADMIN&page=1
router.get('/users', async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 100) : '';
  const role = ['USER', 'ADMIN'].includes(req.query.role) ? req.query.role : undefined;
  const page = Math.max(1, Math.min(500, parseInt(req.query.page, 10) || 1));
  const where = {
    ...(role && { role }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q.replace(/\s/g, '') } },
      ],
    }),
  };
  const [total, users] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * USERS_PAGE_SIZE,
      take: USERS_PAGE_SIZE,
      // Tuyệt đối không select passwordHash
      select: {
        id: true, email: true, fullName: true, phone: true, role: true, createdAt: true, lastLoginAt: true,
        _count: { select: { contactRequests: true } },
      },
    }),
  ]);
  res.json({ users, page, pageSize: USERS_PAGE_SIZE, total });
});

// PATCH /api/admin/users/:id/role { role } — cấp / gỡ quyền quản trị
router.patch('/users/:id/role', validate(adminRoleSchema), async (req, res) => {
  const id = String(req.params.id);
  if (!isUuid(id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản.');
  // Không tự đổi quyền của mình → tránh việc hệ thống không còn admin nào
  if (id === req.auth.userId) throw new AppError(422, 'CANNOT_CHANGE_SELF', 'Bạn không thể tự đổi quyền của chính mình.');

  const target = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!target) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy tài khoản.');

  const user = await prisma.user.update({
    where: { id },
    data: { role: req.body.role },
    select: { id: true, role: true },
  });
  res.json({ user });
});

/* ------------------------------- Dịch vụ -------------------------------- */

// GET /api/admin/services — toàn bộ dịch vụ, kể cả đang ẩn
router.get('/services', async (_req, res) => {
  const services = await prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
  res.json({ services });
});

// PATCH /api/admin/services/:slug — sửa nội dung, giá, thứ tự, ẩn/hiện
router.patch('/services/:slug', validate(adminServiceSchema), async (req, res) => {
  const slug = String(req.params.slug).toLowerCase();
  const exists = await prisma.service.findUnique({ where: { slug }, select: { id: true } });
  if (!exists) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy dịch vụ.');
  const service = await prisma.service.update({ where: { slug }, data: req.body });
  res.json({ service });
});

export default router;
