import { Router } from 'express';
import { byUser, createLimiter } from '../lib/rateLimit.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { validate } from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { cancelRequestSchema, contactEditSchema, contactSchema, isUuid, messageSchema } from '../validators/contact.schema.js';
import * as thread from '../controllers/thread.controller.js';
import * as myRequests from '../controllers/myRequests.controller.js';
import { newRequestNotifications, staffRecipientIds } from '../services/notifications.service.js';
import { isOwnUpload } from '../lib/cloudinary.js';
import { createWithUniqueCode } from '../lib/requestCode.js';
import { CUSTOMER_REQUEST_SELECT, assertServiceAvailable, withServiceNames } from '../services/requests.service.js';

// Chống spam: tối đa 5 yêu cầu / giờ / IP (khách vãng lai cũng gửi được nên phải tính theo IP)
const contactLimiter = createLimiter({
  name: 'contact',
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Bạn đã gửi nhiều yêu cầu. Vui lòng thử lại sau ít phút hoặc gọi trực tiếp cho Bali Home.',
});

// Sửa yêu cầu & nhắn tin bắt buộc đăng nhập → đếm theo tài khoản, không theo IP
const editLimiter = createLimiter({
  name: 'contact-edit',
  windowMs: 60 * 60 * 1000,
  limit: 30,
  keyGenerator: byUser,
  message: 'Bạn đã sửa quá nhiều lần. Vui lòng thử lại sau ít phút.',
});

const messageLimiter = createLimiter({
  name: 'customer-message',
  windowMs: 10 * 60 * 1000,
  limit: 40,
  keyGenerator: byUser,
  message: 'Bạn gửi tin nhắn hơi nhanh. Vui lòng đợi ít phút rồi gửi tiếp.',
});

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
  await announceToStaff({ ...request, fullName: data.fullName, need: data.need }, req.auth?.userId);
  res.status(201).json({ request });
});

/** Báo nhân viên có yêu cầu mới. Lỗi ở bước này không được làm hỏng việc gửi yêu cầu của khách (đã lưu xong). */
async function announceToStaff(request, authorId) {
  try {
    const [{ needLabel }] = await withServiceNames([{ need: request.need }]);
    const recipients = await staffRecipientIds(authorId ?? null);
    await prisma.$transaction(newRequestNotifications(recipients, { request, serviceLabel: needLabel }));
  } catch (error) {
    console.error('[notifications] không tạo được thông báo yêu cầu mới', request.code, error.message);
  }
}

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

// Khách tự huỷ yêu cầu chưa hoàn thành (controllers/myRequests.controller.js → services/customerRequests.service.js)
router.post('/mine/:id/cancel', requireAuth, editLimiter, validate(cancelRequestSchema), myRequests.cancelMyRequest);

// Khung chat của khách (logic + phân quyền: controllers/thread.controller.js → services/requestThread.service.js)
router.get('/mine/:id/messages', requireAuth, thread.customerThread);
router.post('/mine/:id/messages', requireAuth, messageLimiter, validate(messageSchema), thread.customerSendMessage);

// Khách sửa toàn bộ thông tin yêu cầu còn "Mới tiếp nhận" (controllers/myRequests.controller.js → services/customerRequests.service.js)
router.patch('/mine/:id', requireAuth, editLimiter, validate(contactEditSchema), myRequests.updateMyRequest);

export default router;
