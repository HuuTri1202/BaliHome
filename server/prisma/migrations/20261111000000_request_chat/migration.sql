-- Tệp đính kèm có thể thuộc một tin nhắn trong khung chat của yêu cầu
ALTER TABLE "attachments" ADD COLUMN "event_id" UUID;

CREATE INDEX "attachments_event_id_idx" ON "attachments"("event_id");

ALTER TABLE "attachments" ADD CONSTRAINT "attachments_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "request_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;
