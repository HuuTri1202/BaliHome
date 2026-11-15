import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { isUuid } from '../validators/contact.schema.js';
import { cancelledRequestRows, staffRecipientIds } from './notifications.service.js';

/* =============================================================================
 * Thao tác khách tự làm với yêu cầu của CHÍNH MÌNH (mọi truy vấn đều lọc theo userId).
 * ========================================================================== */

/** Khách tự huỷ được khi yêu cầu chưa xong. ⚠ Khớp isRequestCancellable ở client/src/data/requests.js */
export const CANCELLABLE_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS'];
export const CANCELLED_EVENT = 'cancelled';

const notFound = () => new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');
const notCancellable = () =>
  new AppError(409, 'REQUEST_NOT_CANCELLABLE', 'Yêu cầu này đã hoàn thành hoặc đã huỷ nên không huỷ được nữa.');

/**
 * Huỷ yêu cầu: đổi trạng thái sang CANCELLED, ghi mốc vào khung chat (kèm lý do) và báo mọi nhân viên.
 * Điều kiện trạng thái nằm ngay trong câu UPDATE → nếu Bali Home vừa đánh dấu Hoàn thành cùng lúc thì không huỷ đè.
 * @param {{ userId: string, requestId: string, reason?: string }} input
 */
export async function cancelCustomerRequest({ userId, requestId, reason }) {
  if (!isUuid(requestId)) throw notFound();
  const request = await prisma.contactRequest.findFirst({
    where: { id: requestId, userId },
    select: { id: true, code: true, status: true, fullName: true },
  });
  if (!request) throw notFound(); // yêu cầu của người khác: coi như không tồn tại
  if (!CANCELLABLE_STATUSES.includes(request.status)) throw notCancellable();

  const recipients = await staffRecipientIds(userId);
  await prisma.$transaction(async (tx) => {
    const { count } = await tx.contactRequest.updateMany({
      where: { id: request.id, userId, status: { in: CANCELLABLE_STATUSES } },
      data: { status: 'CANCELLED' },
    });
    if (count === 0) throw notCancellable();
    await tx.requestEvent.create({
      data: { requestId: request.id, kind: CANCELLED_EVENT, fromStatus: request.status, toStatus: 'CANCELLED', note: reason ?? null, authorId: userId },
    });
    if (recipients.length > 0) await tx.notification.createMany({ data: cancelledRequestRows(recipients, { request, reason }) });
  });
}
