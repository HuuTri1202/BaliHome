import { cancelCustomerRequest } from '../services/customerRequests.service.js';

// POST /api/contact/mine/:id/cancel { reason? } — khách tự huỷ yêu cầu chưa hoàn thành
export async function cancelMyRequest(req, res) {
  await cancelCustomerRequest({ userId: req.auth.userId, requestId: String(req.params.id), reason: req.body.reason });
  res.json({ ok: true });
}
