import { prisma } from '../lib/prisma.js';

/**
 * Loại thông báo. Khách: 'status' | 'message'. Nhân viên (mở trang quản trị): 'staff_request' | 'staff_message'.
 * ⚠ Giữ khớp STAFF_KINDS ở client/src/components/nav/NotificationBell.jsx
 */
export const STAFF_NOTIFICATION = { newRequest: 'staff_request', message: 'staff_message', cancelled: 'staff_cancel', edited: 'staff_edit' };

const MAX_PREVIEW_LENGTH = 160;
const preview = (text) => (text.length > MAX_PREVIEW_LENGTH ? `${text.slice(0, MAX_PREVIEW_LENGTH - 1)}…` : text);

/** id tài khoản nhân viên nhận thông báo (bỏ người gây ra sự kiện, vd. admin tự gửi yêu cầu thử) */
export async function staffRecipientIds(excludeUserId = null) {
  const staff = await prisma.user.findMany({ where: { role: 'ADMIN', ...(excludeUserId && { NOT: { id: excludeUserId } }) }, select: { id: true } });
  return staff.map(({ id }) => id);
}

/** Các dòng thông báo giống nhau cho mọi nhân viên (dùng được cả trong transaction tương tác: tx.notification.createMany) */
export const staffNotificationRows = (recipientIds, { requestId, kind, title, body = null }) =>
  recipientIds.map((userId) => ({ userId, requestId, kind, title, body }));

/**
 * Thao tác tạo cùng 1 thông báo cho mọi nhân viên, để chạy chung transaction với sự kiện gốc.
 * @returns {import('@prisma/client').Prisma.PrismaPromise<unknown>[]}
 */
export function staffNotifications(recipientIds, notification) {
  if (recipientIds.length === 0) return [];
  return [prisma.notification.createMany({ data: staffNotificationRows(recipientIds, notification) })];
}

/** Khách sửa yêu cầu → dòng thông báo cho nhân viên, nêu các mục đã sửa */
export const editedRequestRows = (recipientIds, { request, changedLabels }) =>
  staffNotificationRows(recipientIds, {
    requestId: request.id,
    kind: STAFF_NOTIFICATION.edited,
    title: `${request.code}: ${request.fullName ?? 'khách'} đã sửa yêu cầu`,
    body: `Đã sửa: ${changedLabels.join(', ')}`,
  });

/** Khách tự huỷ yêu cầu → dòng thông báo cho nhân viên (kèm lý do nếu có) */
export const cancelledRequestRows = (recipientIds, { request, reason }) =>
  staffNotificationRows(recipientIds, {
    requestId: request.id,
    kind: STAFF_NOTIFICATION.cancelled,
    title: `${request.code}: ${request.fullName ?? 'khách'} đã huỷ yêu cầu`,
    body: reason ? `Lý do: ${preview(reason)}` : 'Khách không ghi lý do',
  });

/** Khách nhắn tin trong 1 yêu cầu → báo nhân viên (nội dung rút gọn để xem nhanh trong chuông) */
export function customerMessageNotifications(recipientIds, { request, body }) {
  return staffNotifications(recipientIds, {
    requestId: request.id,
    kind: STAFF_NOTIFICATION.message,
    title: `${request.code}: ${request.fullName ?? 'khách'} nhắn tin mới`,
    body: body ? preview(body) : 'Đã gửi tệp đính kèm',
  });
}

/** Khách gửi yêu cầu tư vấn mới → báo nhân viên */
export function newRequestNotifications(recipientIds, { request, serviceLabel }) {
  return staffNotifications(recipientIds, {
    requestId: request.id,
    kind: STAFF_NOTIFICATION.newRequest,
    title: `Yêu cầu mới ${request.code}`,
    body: `${request.fullName} · ${serviceLabel}`,
  });
}

// ⚠ Giữ khớp nhãn STATUS ở client/src/data/requests.js
const STATUS_LABELS = {
  NEW: 'Mới tiếp nhận',
  CONTACTED: 'Đã liên hệ',
  IN_PROGRESS: 'Đang xử lý',
  DONE: 'Hoàn thành',
  CANCELLED: 'Đã huỷ',
};

/**
 * Thao tác tạo thông báo khi admin cập nhật một yêu cầu, để chạy chung transaction với cập nhật đó.
 * Yêu cầu của khách vãng lai (không có tài khoản) thì không có ai để báo → trả về mảng rỗng.
 * @returns {import('@prisma/client').Prisma.PrismaPromise<unknown>[]}
 */
export function requestUpdateNotification({ request, newStatus, note }) {
  if (!request.userId) return [];
  const title = newStatus
    ? `${request.code}: chuyển sang “${STATUS_LABELS[newStatus]}”`
    : `${request.code}: có tin nhắn mới từ Bali Home`;
  return [
    prisma.notification.create({
      data: { userId: request.userId, requestId: request.id, kind: note ? 'message' : 'status', title, body: note ?? null },
    }),
  ];
}
