-- Phân loại thông báo: 'message' = tin nhắn mới từ Bali Home, 'status' = đổi trạng thái yêu cầu
ALTER TABLE "notifications" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'status';

-- Thông báo cũ có nội dung là tin nhắn / ghi chú của Bali Home
UPDATE "notifications" SET "kind" = 'message' WHERE "body" IS NOT NULL;
