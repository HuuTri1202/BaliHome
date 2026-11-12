-- Mỗi cách đăng nhập bên ngoài (Google, Facebook, ...) là 1 dòng → 1 tài khoản nối được nhiều nhà cung cấp
CREATE TABLE "auth_identities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_user_id" TEXT NOT NULL,
    "email" TEXT, -- email do nhà cung cấp xác nhận; NULL = nhà cung cấp không trả email (khách tự nhập)
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_identities_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_identities_provider_provider_user_id_key" ON "auth_identities"("provider", "provider_user_id");
CREATE UNIQUE INDEX "auth_identities_user_id_provider_key" ON "auth_identities"("user_id", "provider");

ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Chuyển liên kết Google sẵn có (cột users.google_id) sang bảng mới, rồi bỏ cột cũ
INSERT INTO "auth_identities" ("id", "user_id", "provider", "provider_user_id", "email", "created_at")
SELECT gen_random_uuid(), "id", 'google', "google_id", "email", CURRENT_TIMESTAMP
FROM "users" WHERE "google_id" IS NOT NULL;

DROP INDEX "users_google_id_key";
ALTER TABLE "users" DROP COLUMN "google_id";
