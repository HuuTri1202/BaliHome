-- Mã yêu cầu dễ đọc qua điện thoại (BLH-2026-8921). Yêu cầu cũ được đánh số theo thứ tự trong từng năm.
ALTER TABLE "contact_requests" ADD COLUMN "code" TEXT;

UPDATE "contact_requests" AS r
SET "code" = numbered."code"
FROM (
  SELECT
    "id",
    'BLH-' || to_char("created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY') || '-' ||
      (999 + row_number() OVER (
        PARTITION BY to_char("created_at" AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY')
        ORDER BY "created_at", "id"
      ))::TEXT AS "code"
  FROM "contact_requests"
) AS numbered
WHERE r."id" = numbered."id";

ALTER TABLE "contact_requests" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "contact_requests_code_key" ON "contact_requests"("code");

-- Thông báo từ Bali Home tới khách
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "request_id" UUID,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "contact_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
