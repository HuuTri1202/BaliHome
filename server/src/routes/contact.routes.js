import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { contactEditSchema, contactSchema, isUuid, OTHER_NEED } from '../validators/contact.schema.js';
import { isOwnUpload } from '../lib/cloudinary.js';
import { createWithUniqueCode } from '../lib/requestCode.js';
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

const editLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (_req, res) =>
    res.status(429).json({ error: { code: 'TOO_MANY_REQUESTS', message: 'Bạn đã sửa quá nhiều lần. Vui lòng thử lại sau ít phút.' } }),
});

/** Chỉ yêu cầu còn ở trạng thái này khách mới được tự sửa */
const EDITABLE_STATUS = 'NEW';

async function assertServiceAvailable(need) {
  if (need === OTHER_NEED) return;
  const service = await prisma.service.findFirst({ where: { slug: need, isActive: true }, select: { id: true } });
  if (!service) throw new AppError(422, 'VALIDATION_ERROR', 'Vui lòng kiểm tra lại thông tin.', { need: 'Dịch vụ không tồn tại' });
}

const router = Router();

// POST /api/contact — gửi yêu cầu tư vấn / báo giá (form nhanh hoặc form nhiều bước)
router.post('/', contactLimiter, optionalAuth, validate(contactSchema), async (req, res) => {
  const { attachments, ...data } = req.body;

  await assertServiceAvailable(data.need);
  // Chỉ nhận file đã tải lên đúng tài khoản + thư mục Cloudinary của Bali Home
  if (attachments.some((a) => !isOwnUpload(a))) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Tệp đính kèm không hợp lệ.', { attachments: 'Tệp đính kèm không hợp lệ' });
  }

  const request = await createWithUniqueCode((code) =>
    prisma.contactRequest.create({
      data: {
        ...data,
        code,
        userId: req.auth?.userId ?? null,
        ip: req.ip ?? null,
        events: { create: { kind: 'created', toStatus: 'NEW' } },
        attachments: { create: attachments.map(({ url, publicId, fileName, bytes, format }) => ({ url, publicId, fileName, bytes, format: format ?? null })) },
      },
      select: { id: true, code: true, createdAt: true },
    })
  );
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
  if (!isUuid(id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const request = await prisma.contactRequest.findFirst({
    where: { id, userId: req.auth.userId },
    select: CUSTOMER_REQUEST_SELECT,
  });
  if (!request) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const [withName] = await withServiceNames([request]);
  res.json({ request: withName });
});

const requestLocked = () =>
  new AppError(409, 'REQUEST_LOCKED', 'Yêu cầu này đã được Bali Home tiếp nhận xử lý nên không sửa được nữa. Vui lòng gọi hotline nếu cần thay đổi.');

// PATCH /api/contact/mine/:id { phone, need, message } — khách tự sửa yêu cầu còn chờ xử lý
router.patch('/mine/:id', editLimiter, requireAuth, validate(contactEditSchema), async (req, res) => {
  const id = String(req.params.id);
  if (!isUuid(id)) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  const ownedRequest = { id, userId: req.auth.userId };

  const current = await prisma.contactRequest.findFirst({ where: ownedRequest, select: { status: true, phone: true, need: true, message: true } });
  if (!current) throw new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
  if (current.status !== EDITABLE_STATUS) throw requestLocked();

  const changes = { phone: req.body.phone, need: req.body.need, message: req.body.message ?? null };
  const isUnchanged = Object.entries(changes).every(([field, value]) => current[field] === value);
  if (isUnchanged) return res.json({ ok: true });
  // Dịch vụ cũ đã bị ẩn thì khách vẫn giữ được; chỉ kiểm tra khi đổi sang dịch vụ khác
  if (changes.need !== current.need) await assertServiceAvailable(changes.need);

  await prisma.$transaction(async (tx) => {
    // Điều kiện status nằm ngay trong câu UPDATE: admin đổi trạng thái cùng lúc thì bản sửa không lọt qua
    const { count } = await tx.contactRequest.updateMany({ where: { ...ownedRequest, status: EDITABLE_STATUS }, data: changes });
    if (count === 0) throw requestLocked();
    await tx.requestEvent.create({ data: { requestId: id, kind: 'edited', authorId: req.auth.userId } });
  });
  return res.json({ ok: true });
});

export default router;
