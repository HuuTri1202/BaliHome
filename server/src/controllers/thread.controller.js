import {
  CUSTOMER_MESSAGE,
  STAFF_MESSAGE,
  findThreadForCustomer,
  findThreadForStaff,
  listThread,
  postMessage,
} from '../services/requestThread.service.js';

/* =============================================================================
 * Khung chat theo từng yêu cầu (mã BLH-…). Controller chỉ đọc request → gọi service → trả JSON.
 * Phân quyền nằm ở service (findThreadFor*): khách chỉ thấy yêu cầu của mình; nhân viên đi qua router quản trị.
 * Dữ liệu vào đã qua validate(messageSchema); lỗi ném AppError → middleware lỗi tập trung trả JSON thống nhất.
 * ========================================================================== */

// GET /api/contact/mine/:id/messages
export async function customerThread(req, res) {
  const request = await findThreadForCustomer(req.auth.userId, req.params.id);
  res.json({ messages: await listThread(request.id) });
}

// POST /api/contact/mine/:id/messages { body?, attachments? } — khách nhắn cho Bali Home
export async function customerSendMessage(req, res) {
  const request = await findThreadForCustomer(req.auth.userId, req.params.id);
  const message = await postMessage({ request, authorId: req.auth.userId, kind: CUSTOMER_MESSAGE, ...req.body });
  res.status(201).json({ message });
}

// GET /api/admin/requests/:id/messages
export async function staffThread(req, res) {
  const request = await findThreadForStaff(req.params.id);
  res.json({ messages: await listThread(request.id) });
}

// POST /api/admin/requests/:id/messages { body?, attachments? } — Bali Home nhắn cho khách (kèm thông báo)
export async function staffSendMessage(req, res) {
  const request = await findThreadForStaff(req.params.id);
  const message = await postMessage({ request, authorId: req.auth.userId, kind: STAFF_MESSAGE, ...req.body });
  res.status(201).json({ message });
}
