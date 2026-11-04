-- CreateTable
CREATE TABLE "services" (
    "id" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "deliverables" TEXT[],
    "ideal_for" TEXT[],
    "price_from" INTEGER,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "services_slug_key" ON "services"("slug");

-- CreateIndex
CREATE INDEX "services_is_active_sort_order_idx" ON "services"("is_active", "sort_order");

-- =============================================================================
-- Dữ liệu ban đầu: 8 dịch vụ của Bali Home.
-- ⚠ Nội dung mô tả là bản nháp — Bali Home cần duyệt lại. Giá để NULL = "Báo giá theo yêu cầu".
-- Sửa sau này: cập nhật trực tiếp bảng "services" (Prisma Studio / trang quản trị).
-- =============================================================================
INSERT INTO "services" ("id", "slug", "name", "group", "tagline", "summary", "deliverables", "ideal_for", "sort_order", "updated_at") VALUES
(gen_random_uuid(), 'design', 'Design', 'creative',
 'Nhận diện thương hiệu và thiết kế đồ hoạ có chủ đích.',
 'Từ logo, bộ nhận diện đến ấn phẩm và hình ảnh cho mạng xã hội: mọi thiết kế đều xuất phát từ câu chuyện của thương hiệu, để khách hàng nhận ra bạn ở bất cứ đâu.',
 ARRAY['Logo và bộ nhận diện thương hiệu', 'Poster, ấn phẩm, hình đăng mạng xã hội', 'Key visual cho chiến dịch, sự kiện', 'Bàn giao file gốc (AI, PSD, PDF) và hướng dẫn sử dụng'],
 ARRAY['Thương hiệu mới cần một bộ mặt chuyên nghiệp', 'Hình ảnh hiện tại thiếu đồng bộ giữa các kênh'],
 10, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'in-an', 'In ấn', 'creative',
 'Ấn phẩm in sắc nét, đúng màu, giao tận nơi.',
 'Bali Home nhận in từ số lượng nhỏ đến lớn, kiểm tra file và in thử trước khi in hàng loạt, để màu in khớp với màu thiết kế.',
 ARRAY['Danh thiếp, tờ rơi, brochure, catalogue', 'Standee, banner, backdrop cho sự kiện', 'Bao bì, nhãn mác, sticker', 'Kiểm tra file và in thử trước khi in số lượng lớn'],
 ARRAY['Khai trương, sự kiện, ra mắt sản phẩm', 'Cần bộ ấn phẩm đồng bộ với nhận diện thương hiệu'],
 20, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'edit', 'Edit', 'creative',
 'Dựng video và chỉnh ảnh cho mạng xã hội, quảng cáo.',
 'Biến những đoạn quay và bức ảnh thô thành nội dung gọn, đúng nhịp từng nền tảng, đủ sức giữ chân người xem trong vài giây đầu tiên.',
 ARRAY['Dựng video ngắn cho TikTok, Reels, Shorts', 'Video giới thiệu doanh nghiệp, video sự kiện', 'Chỉnh màu, retouch ảnh sản phẩm', 'Phụ đề, nhạc nền, chuyển động đồ hoạ cơ bản'],
 ARRAY['Có sẵn tư liệu nhưng chưa có người dựng', 'Cần ra nội dung video đều đặn mỗi tuần'],
 30, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'profile-card', 'Profile card', 'creative',
 'Hồ sơ năng lực và danh thiếp thông minh cho doanh nghiệp.',
 'Một bộ hồ sơ giới thiệu doanh nghiệp rõ ràng, đẹp và dễ chia sẻ: bản in để gặp mặt, bản PDF để gửi đi, và danh thiếp điện tử chỉ cần quét mã QR.',
 ARRAY['Hồ sơ năng lực (company profile) bản in và PDF', 'Danh thiếp điện tử có mã QR', 'Trang hồ sơ trực tuyến của cá nhân hoặc doanh nghiệp', 'Cập nhật nội dung khi có thay đổi'],
 ARRAY['Chuẩn bị gặp đối tác, tham gia đấu thầu', 'Đội ngũ kinh doanh cần danh thiếp gọn, dễ lưu'],
 40, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'web', 'Web', 'digital',
 'Website chuẩn điện thoại, nhanh và dễ quản lý.',
 'Thiết kế và lập trình website giới thiệu, landing page hay trang có tài khoản thành viên: hiển thị tốt trên điện thoại, có chế độ sáng và tối, bàn giao kèm hướng dẫn quản trị.',
 ARRAY['Landing page, website giới thiệu doanh nghiệp', 'Hiển thị chuẩn trên điện thoại, có chế độ sáng và tối', 'Form liên hệ, tài khoản thành viên', 'Hỗ trợ tên miền, hosting và hướng dẫn quản trị'],
 ARRAY['Chưa có website hoặc website cũ chậm, khó sửa', 'Cần một trang riêng cho chiến dịch quảng cáo'],
 50, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'content', 'Content', 'digital',
 'Nội dung đúng giọng thương hiệu, đều đặn mỗi tuần.',
 'Lên lịch và viết nội dung cho mạng xã hội, website và ấn phẩm: cùng một giọng nói, cùng một thông điệp, để khách hàng nhớ bạn là ai.',
 ARRAY['Lịch nội dung và bài đăng mạng xã hội', 'Bài viết cho website, bài chuẩn SEO', 'Kịch bản video ngắn', 'Viết lời cho ấn phẩm, profile, landing page'],
 ARRAY['Fanpage đăng không đều, thiếu ý tưởng', 'Muốn website có thêm khách tìm đến từ Google'],
 60, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'marketing', 'Marketing', 'growth',
 'Lập kế hoạch và chạy chiến dịch có đo lường.',
 'Xác định khách hàng mục tiêu, chọn kênh phù hợp với ngân sách, chạy quảng cáo và báo cáo kết quả định kỳ, để mỗi đồng chi ra đều biết đi về đâu.',
 ARRAY['Kế hoạch marketing theo tháng hoặc quý', 'Chạy quảng cáo Facebook, Google, TikTok', 'Quản lý fanpage và cộng đồng', 'Báo cáo kết quả định kỳ'],
 ARRAY['Có sản phẩm tốt nhưng ít người biết đến', 'Đã chạy quảng cáo nhưng chưa đo được hiệu quả'],
 70, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'sales', 'Sales', 'growth',
 'Hỗ trợ bán hàng: kịch bản, tài liệu và kênh bán.',
 'Giúp đội ngũ bán hàng chốt đơn tốt hơn với kịch bản tư vấn, tài liệu bán hàng và kênh bán được thiết lập bài bản, kèm quy trình theo dõi khách hàng tiềm năng.',
 ARRAY['Kịch bản tư vấn và chăm sóc khách hàng', 'Tài liệu bán hàng, bảng giá, mẫu báo giá', 'Thiết lập kênh bán: fanpage, Zalo OA, sàn thương mại điện tử', 'Quy trình theo dõi khách hàng tiềm năng'],
 ARRAY['Có nhiều khách hỏi nhưng ít khách chốt', 'Mở rộng sang kênh bán hàng trực tuyến'],
 80, CURRENT_TIMESTAMP);

