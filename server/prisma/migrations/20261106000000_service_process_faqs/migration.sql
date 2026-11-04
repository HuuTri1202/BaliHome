-- AlterTable
ALTER TABLE "services" ADD COLUMN     "faqs" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "process" JSONB NOT NULL DEFAULT '[]';

-- =============================================================================
-- Nội dung riêng từng dịch vụ: quy trình 3 bước + câu hỏi thường gặp.
-- ⚠ Bản nháp — Bali Home cần duyệt lại. Sửa sau này: cập nhật cột process / faqs.
-- =============================================================================
UPDATE "services" SET
 "process" = '[{"title":"Tìm hiểu thương hiệu","text":"Lắng nghe câu chuyện, khách hàng mục tiêu và đối thủ của bạn."},{"title":"Phác thảo 2–3 hướng","text":"Bạn chọn một hướng để Bali Home phát triển tiếp."},{"title":"Hoàn thiện và bàn giao","text":"Chỉnh sửa theo góp ý, bàn giao file gốc kèm hướng dẫn sử dụng."}]',
 "faqs" = '[{"q":"Tôi được chỉnh sửa mấy lần?","a":"Số vòng chỉnh sửa được ghi rõ trong báo giá trước khi bắt đầu."},{"q":"Tôi có nhận file gốc không?","a":"Có. Bali Home bàn giao file AI, PSD, PDF và PNG để bạn dùng lâu dài."}]'
WHERE "slug" = 'design';

UPDATE "services" SET
 "process" = '[{"title":"Nhận file, tư vấn chất liệu","text":"Kiểm tra file, tư vấn loại giấy, kích thước và cách gia công."},{"title":"In thử","text":"Bạn duyệt mẫu in thử để màu sắc và chữ đúng ý."},{"title":"In hàng loạt, giao tận nơi","text":"In đủ số lượng, đóng gói cẩn thận và giao đến bạn."}]',
 "faqs" = '[{"q":"Chưa có file thiết kế thì sao?","a":"Bali Home có dịch vụ Design để làm file trước khi in."},{"q":"Có nhận in số lượng ít không?","a":"Có. Giá phụ thuộc số lượng và chất liệu, được báo rõ trước khi in."}]'
WHERE "slug" = 'in-an';

UPDATE "services" SET
 "process" = '[{"title":"Nhận tư liệu","text":"Bạn gửi video, ảnh thô và mô tả mong muốn."},{"title":"Dựng bản nháp","text":"Dựng theo nhịp của từng nền tảng, gửi bạn xem trước."},{"title":"Hoàn thiện và xuất bản","text":"Thêm phụ đề, âm thanh, xuất đúng tỉ lệ để đăng ngay."}]',
 "faqs" = '[{"q":"Video được xuất theo tỉ lệ nào?","a":"Đúng tỉ lệ từng nền tảng: 9:16 cho TikTok, Reels; 1:1 và 16:9 khi cần."},{"q":"Mất bao lâu để có video?","a":"Tuỳ độ dài và số lượng; thời gian được ghi rõ trong báo giá."}]'
WHERE "slug" = 'edit';

UPDATE "services" SET
 "process" = '[{"title":"Thu thập thông tin","text":"Năng lực, dự án tiêu biểu, đội ngũ và thông tin liên hệ."},{"title":"Thiết kế và biên tập","text":"Sắp xếp nội dung rõ ràng, đúng nhận diện thương hiệu."},{"title":"Bàn giao bản in, PDF và mã QR","text":"Kèm danh thiếp điện tử để chia sẻ ngay với đối tác."}]',
 "faqs" = '[{"q":"Danh thiếp điện tử dùng thế nào?","a":"Người nhận quét mã QR là xem và lưu được thông tin của bạn."},{"q":"Đổi thông tin có phải làm lại không?","a":"Không. Bali Home cập nhật nội dung khi bạn có thay đổi."}]'
WHERE "slug" = 'profile-card';

UPDATE "services" SET
 "process" = '[{"title":"Lên cấu trúc trang","text":"Xác định mục tiêu, các trang và nội dung cần có."},{"title":"Thiết kế rồi lập trình","text":"Bạn duyệt giao diện trước; sau đó lập trình và kiểm tra trên điện thoại."},{"title":"Bàn giao và hướng dẫn","text":"Đưa website lên tên miền, hướng dẫn bạn tự quản trị."}]',
 "faqs" = '[{"q":"Website có chạy tốt trên điện thoại không?","a":"Có. Mọi trang được thiết kế và kiểm tra trên điện thoại trước khi bàn giao."},{"q":"Tôi có tự sửa nội dung được không?","a":"Có. Bali Home hướng dẫn cách cập nhật nội dung khi bàn giao."}]'
WHERE "slug" = 'web';

UPDATE "services" SET
 "process" = '[{"title":"Định giọng thương hiệu","text":"Thống nhất giọng văn, chủ đề và khách hàng mục tiêu."},{"title":"Lên lịch nội dung","text":"Kế hoạch bài đăng theo tuần hoặc tháng để bạn duyệt."},{"title":"Viết và đăng đều đặn","text":"Viết, chỉnh theo góp ý và đăng đúng lịch."}]',
 "faqs" = '[{"q":"Tôi có được duyệt bài trước khi đăng không?","a":"Có. Mọi bài viết đều được gửi bạn duyệt trước."},{"q":"Có viết bài chuẩn SEO không?","a":"Có, cho website và blog để khách hàng tìm thấy bạn trên Google."}]'
WHERE "slug" = 'content';

UPDATE "services" SET
 "process" = '[{"title":"Phân tích và lập kế hoạch","text":"Xác định khách hàng, kênh và ngân sách phù hợp."},{"title":"Triển khai chiến dịch","text":"Chạy quảng cáo, quản lý fanpage và tối ưu liên tục."},{"title":"Đo lường và báo cáo","text":"Báo cáo kết quả định kỳ kèm đề xuất bước tiếp theo."}]',
 "faqs" = '[{"q":"Ngân sách quảng cáo tối thiểu là bao nhiêu?","a":"Tuỳ mục tiêu và kênh; Bali Home tư vấn mức phù hợp khi báo giá."},{"q":"Tôi xem kết quả ở đâu?","a":"Qua báo cáo định kỳ, số liệu lấy từ chính các nền tảng quảng cáo."}]'
WHERE "slug" = 'marketing';

UPDATE "services" SET
 "process" = '[{"title":"Đánh giá cách bán hiện tại","text":"Xem cách đội ngũ đang tư vấn và chốt đơn."},{"title":"Xây kịch bản và tài liệu","text":"Kịch bản tư vấn, bảng giá, mẫu báo giá."},{"title":"Thiết lập kênh và theo dõi","text":"Fanpage, Zalo OA, sàn thương mại điện tử và quy trình chăm sóc khách."}]',
 "faqs" = '[{"q":"Có hướng dẫn đội bán hàng không?","a":"Có. Bali Home hướng dẫn đội ngũ dùng kịch bản và tài liệu đã xây dựng."},{"q":"Làm cho những kênh bán nào?","a":"Fanpage, Zalo OA, các sàn thương mại điện tử và bán hàng trực tiếp."}]'
WHERE "slug" = 'sales';

