-- Tìm nhanh tin nhắn cuối của mỗi yêu cầu (bộ lọc "Khách chờ trả lời" ở trang quản trị)
CREATE INDEX "request_events_kind_request_id_created_at_idx" ON "request_events"("kind", "request_id", "created_at");
