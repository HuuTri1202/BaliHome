import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';
import { isOwnUpload } from '../lib/cloudinary.js';
import { isUuid } from '../validators/contact.schema.js';
import { customerMessageNotifications, requestUpdateNotification, staffRecipientIds } from './notifications.service.js';

/* =============================================================================
 * Khung chat của một yêu cầu = dòng thời gian của nó.
 *   note    : tin nhắn của Bali Home (gồm cả ghi chú admin gửi trước đây)
 *   message : tin nhắn của khách
 *   created | status | edited : mốc hệ thống, hiện xen giữa các tin nhắn
 * ========================================================================== */
export const STAFF_MESSAGE = 'note';
export const CUSTOMER_MESSAGE = 'message';
const THREAD_LIMIT = 500;

/** Trường của một mục trong khung chat; tác giả chỉ lộ họ tên */
export const THREAD_EVENT_SELECT = {
  id: true, kind: true, fromStatus: true, toStatus: true, note: true, createdAt: true,
  author: { select: { fullName: true } },
  attachments: { select: { id: true, url: true, fileName: true, bytes: true, format: true }, orderBy: { createdAt: 'asc' } },
};

/** Quan hệ events cho các truy vấn yêu cầu: lấy THREAD_LIMIT mục MỚI NHẤT (đảo lại bằng inChronologicalOrder) */
export const LATEST_THREAD_EVENTS = { select: THREAD_EVENT_SELECT, orderBy: { createdAt: 'desc' }, take: THREAD_LIMIT };

/** Đưa events về thứ tự cũ → mới cho giao diện */
export const inChronologicalOrder = (request) => ({ ...request, events: [...request.events].reverse() });

const THREAD_OWNER_SELECT = { id: true, code: true, userId: true, fullName: true };
const requestNotFound = () => new AppError(404, 'NOT_FOUND', 'Không tìm thấy yêu cầu.');

/**
 * Khung chat của KHÁCH: chỉ yêu cầu của chính họ. Yêu cầu của người khác → 404 (không lộ là có tồn tại).
 * @returns {Promise<{ id: string, code: string, userId: string|null }>}
 */
export async function findThreadForCustomer(userId, requestId) {
  const request = isUuid(String(requestId))
    ? await prisma.contactRequest.findFirst({ where: { id: String(requestId), userId }, select: THREAD_OWNER_SELECT })
    : null;
  if (!request) throw requestNotFound();
  return request;
}

/** Khung chat của NHÂN VIÊN (route đã qua requireAdminFromDb): mọi yêu cầu */
export async function findThreadForStaff(requestId) {
  const request = isUuid(String(requestId))
    ? await prisma.contactRequest.findUnique({ where: { id: String(requestId) }, select: THREAD_OWNER_SELECT })
    : null;
  if (!request) throw requestNotFound();
  return request;
}

export async function listThread(requestId) {
  const latest = await prisma.requestEvent.findMany({ where: { requestId }, ...LATEST_THREAD_EVENTS });
  return latest.reverse();
}

/** Thông báo đi kèm 1 tin nhắn: tin của Bali Home → báo khách; tin của khách → báo mọi nhân viên */
async function messageNotifications({ request, authorId, kind, body }) {
  if (kind === STAFF_MESSAGE) return requestUpdateNotification({ request, newStatus: null, note: body ?? 'Đã gửi tệp đính kèm' });
  return customerMessageNotifications(await staffRecipientIds(authorId), { request, body });
}

/**
 * Ghi một tin nhắn (kèm tệp nếu có) vào khung chat, cùng giao dịch với thông báo cho bên kia.
 * @param {{ request: { id: string, code: string, userId: string|null, fullName?: string }, authorId: string, kind: string, body?: string, attachments: object[] }} input
 */
export async function postMessage({ request, authorId, kind, body, attachments }) {
  if (attachments.some((file) => !isOwnUpload(file))) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Tệp đính kèm không hợp lệ.', { attachments: 'Tệp đính kèm không hợp lệ' });
  }
  const files = attachments.map(({ url, publicId, fileName, bytes, format }) => ({ requestId: request.id, url, publicId, fileName, bytes, format: format ?? null }));
  const notifications = await messageNotifications({ request, authorId, kind, body });
  const [message] = await prisma.$transaction([
    prisma.requestEvent.create({
      data: { requestId: request.id, kind, note: body ?? null, authorId, attachments: { create: files } },
      select: THREAD_EVENT_SELECT,
    }),
    prisma.contactRequest.update({ where: { id: request.id }, data: { updatedAt: new Date() } }),
    ...notifications,
  ]);
  return message;
}

/**
 * id các yêu cầu mà tin nhắn cuối cùng là của khách (Bali Home chưa trả lời).
 * @returns {Promise<string[]>}
 */
export async function requestIdsAwaitingReply() {
  const rows = await prisma.$queryRaw`
    SELECT DISTINCT ON (request_id) request_id::text AS id, kind
    FROM request_events
    WHERE kind IN (${STAFF_MESSAGE}, ${CUSTOMER_MESSAGE})
    ORDER BY request_id, created_at DESC`;
  return rows.filter((row) => row.kind === CUSTOMER_MESSAGE).map((row) => row.id);
}
