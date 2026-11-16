import { EDITABLE_FIELDS, cancelCustomerRequest, updateCustomerRequest } from '../services/customerRequests.service.js';

// PATCH /api/contact/mine/:id { fullName?, phone?, email?, company?, industry?, need?, budget?, desiredPrice?, deadline?, message? }
// Khách sửa yêu cầu còn "Mới tiếp nhận". Trường không gửi = giữ nguyên; gửi rỗng = xoá (chuẩn hoá ở contactEditSchema)
export async function updateMyRequest(req, res) {
  const changes = Object.fromEntries(Object.keys(EDITABLE_FIELDS).filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
  const { changed } = await updateCustomerRequest({ userId: req.auth.userId, requestId: String(req.params.id), changes });
  res.json({ ok: true, changed });
}

// POST /api/contact/mine/:id/cancel { reason? } — khách tự huỷ yêu cầu chưa hoàn thành
export async function cancelMyRequest(req, res) {
  await cancelCustomerRequest({ userId: req.auth.userId, requestId: String(req.params.id), reason: req.body.reason });
  res.json({ ok: true });
}
