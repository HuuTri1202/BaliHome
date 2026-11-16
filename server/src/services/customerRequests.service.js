import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { isUuid } from '../validators/contact.schema.js';
import { cancelledRequestRows, editedRequestRows, staffRecipientIds } from './notifications.service.js';
import { assertServiceAvailable } from './requests.service.js';

/* =============================================================================
 * Thao tác khách tự làm với yêu cầu của CHÍNH MÌNH (mọi truy vấn đều lọc theo userId).
 * ========================================================================== */

/** Khách tự huỷ được khi yêu cầu chưa xong. ⚠ Khớp isRequestCancellable ở client/src/data/requests.js */
export const CANCELLABLE_STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS'];
export const CANCELLED_EVENT = 'cancelled';

const notFound = () => new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');

/* ---------------------------------- Sửa yêu cầu ---------------------------------- */

/** Khách chỉ tự sửa được yêu cầu chưa ai xử lý. ⚠ Khớp isRequestEditable ở client/src/data/requests.js */
export const EDITABLE_STATUS = 'NEW';
const DAY_MS = 24 * 3600 * 1000;

/** Các trường khách sửa được, theo thứ tự hiện trong thông báo "Đã sửa: …" */
export const EDITABLE_FIELDS = {
  fullName: 'Họ tên',
  phone: 'Số điện thoại',
  email: 'Email',
  company: 'Doanh nghiệp',
  industry: 'Lĩnh vực',
  need: 'Dịch vụ',
  budget: 'Ngân sách',
  desiredPrice: 'Mức giá mong muốn',
  deadline: 'Deadline',
  message: 'Mô tả',
};

const requestLocked = () =>
  new AppError(409, 'REQUEST_LOCKED', 'Yêu cầu này đã được Bali Home tiếp nhận xử lý nên không sửa được nữa. Vui lòng gọi hotline nếu cần thay đổi.');

const sameValue = (a, b) => (a instanceof Date || b instanceof Date ? a?.getTime?.() === b?.getTime?.() : (a ?? null) === (b ?? null));

/** Nhãn các trường được gửi lên VÀ thật sự khác bản đang lưu (trường không gửi = giữ nguyên, bỏ qua) */
export const changedFieldLabels = (current, changes) =>
  Object.keys(EDITABLE_FIELDS)
    .filter((field) => field in changes && !sameValue(current[field], changes[field]))
    .map((field) => EDITABLE_FIELDS[field]);

/**
 * Khách sửa thông tin yêu cầu còn "Mới tiếp nhận". Ghi mốc "edited" (kèm các mục đã sửa) vào khung chat và báo nhân viên.
 * @param {{ userId: string, requestId: string, changes: Partial<Record<keyof typeof EDITABLE_FIELDS, unknown>> }} input
 *   changes: chỉ các trường khách gửi lên (thiếu trường nào thì giữ nguyên trường đó)
 * @returns {Promise<{ changed: string[] }>} nhãn các mục đã sửa (rỗng nếu không có gì đổi)
 */
export async function updateCustomerRequest({ userId, requestId, changes }) {
  if (!isUuid(requestId)) throw notFound();
  const owned = { id: requestId, userId };
  const current = await prisma.contactRequest.findFirst({
    where: owned,
    select: { id: true, code: true, status: true, ...Object.fromEntries(Object.keys(EDITABLE_FIELDS).map((f) => [f, true])) },
  });
  if (!current) throw notFound();
  if (current.status !== EDITABLE_STATUS) throw requestLocked();

  const changed = changedFieldLabels(current, changes);
  if (changed.length === 0) return { changed };
  // Dịch vụ cũ đã bị ẩn thì khách vẫn giữ được; chỉ kiểm tra khi đổi sang dịch vụ khác
  if (changes.need !== undefined && changes.need !== current.need) await assertServiceAvailable(changes.need);
  // Giữ nguyên deadline cũ thì được (dù đã qua); đặt ngày MỚI thì phải từ hôm nay trở đi
  if (changes.deadline && !sameValue(changes.deadline, current.deadline) && changes.deadline.getTime() < Date.now() - DAY_MS) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Vui lòng kiểm tra lại thông tin.', { deadline: 'Deadline phải từ hôm nay trở đi' });
  }

  const recipients = await staffRecipientIds(userId);
  await prisma.$transaction(async (tx) => {
    // Điều kiện status nằm ngay trong câu UPDATE: admin đổi trạng thái cùng lúc thì bản sửa không lọt qua
    const { count } = await tx.contactRequest.updateMany({ where: { ...owned, status: EDITABLE_STATUS }, data: changes });
    if (count === 0) throw requestLocked();
    await tx.requestEvent.create({ data: { requestId, kind: 'edited', note: changed.join(', '), authorId: userId } });
    if (recipients.length > 0) {
      await tx.notification.createMany({ data: editedRequestRows(recipients, { request: { ...current, fullName: changes.fullName ?? current.fullName }, changedLabels: changed }) });
    }
  });
  return { changed };
}
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
