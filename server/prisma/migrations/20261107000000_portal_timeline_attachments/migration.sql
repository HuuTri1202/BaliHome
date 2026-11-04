-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ContactStatus" ADD VALUE 'IN_PROGRESS';
ALTER TYPE "ContactStatus" ADD VALUE 'CANCELLED';

-- AlterTable
ALTER TABLE "contact_requests" ADD COLUMN     "budget" TEXT,
ADD COLUMN     "company" TEXT,
ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "request_events" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "kind" TEXT NOT NULL,
    "from_status" "ContactStatus",
    "to_status" "ContactStatus",
    "note" TEXT,
    "author_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "request_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attachments" (
    "id" UUID NOT NULL,
    "request_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "format" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "request_events_request_id_created_at_idx" ON "request_events"("request_id", "created_at");

-- CreateIndex
CREATE INDEX "attachments_request_id_idx" ON "attachments"("request_id");

-- CreateIndex
CREATE INDEX "contact_requests_user_id_created_at_idx" ON "contact_requests"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "request_events" ADD CONSTRAINT "request_events_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "contact_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "request_events" ADD CONSTRAINT "request_events_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attachments" ADD CONSTRAINT "attachments_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "contact_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Dữ liệu cũ: mỗi yêu cầu đã có → 1 sự kiện "created" để timeline không trống
-- (chỉ dùng các giá trị enum cũ NEW/CONTACTED/DONE nên an toàn trong cùng giao dịch)
INSERT INTO "request_events" ("id", "request_id", "kind", "to_status", "created_at")
SELECT gen_random_uuid(), "id", 'created', 'NEW', "created_at" FROM "contact_requests";

