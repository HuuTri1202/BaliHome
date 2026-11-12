import { prisma } from '../lib/prisma.js';

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
