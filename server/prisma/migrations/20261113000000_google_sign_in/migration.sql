-- Đăng nhập bằng Google: tài khoản tạo từ Google chưa có mật khẩu (password_hash NULL)
ALTER TABLE "users" ALTER COLUMN "password_hash" DROP NOT NULL;

-- "sub" của Google: định danh cố định của tài khoản Google (email có thể đổi, sub thì không)
ALTER TABLE "users" ADD COLUMN "google_id" TEXT;
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
