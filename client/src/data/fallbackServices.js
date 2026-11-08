/* =============================================================================
 * Dịch vụ cốt lõi dự phòng: hiển thị khi API chậm hoặc không phản hồi,
 * để trang không bao giờ trống hay báo lỗi hệ thống trước mặt khách.
 * Cùng cấu trúc với GET /api/services; slug phải khớp slug thật trong database.
 * Nội dung chép từ database (08/11/2026). priceFrom = null → "Báo giá theo yêu cầu", không ghi giá dự phòng.
 * ========================================================================== */
const coreService = (service) => ({ idealFor: [], process: [], faqs: [], priceFrom: null, ...service });

export const FALLBACK_SERVICES = [
  coreService({
    slug: 'in-an',
    name: 'In ấn',
    group: 'creative',
    tagline: 'Ấn phẩm in sắc nét, đúng màu, giao tận nơi.',
    summary: 'Bali Home nhận in từ số lượng nhỏ đến lớn, kiểm tra file và in thử trước khi in hàng loạt, để màu in khớp với màu thiết kế.',
    deliverables: [
      'Danh thiếp, tờ rơi, brochure, catalogue',
      'Standee, banner, backdrop cho sự kiện',
      'Bao bì, nhãn mác, sticker',
      'Kiểm tra file và in thử trước khi in số lượng lớn',
    ],
    idealFor: ['Khai trương, sự kiện, ra mắt sản phẩm', 'Cần bộ ấn phẩm đồng bộ với nhận diện thương hiệu'],
  }),
  coreService({
    slug: 'design',
    name: 'Design',
    group: 'creative',
    tagline: 'Nhận diện thương hiệu và thiết kế đồ hoạ có chủ đích.',
    summary: 'Từ logo, bộ nhận diện đến ấn phẩm và hình ảnh cho mạng xã hội: mọi thiết kế đều xuất phát từ câu chuyện của thương hiệu, để khách hàng nhận ra bạn ở bất cứ đâu.',
    deliverables: [
      'Logo và bộ nhận diện thương hiệu',
      'Poster, ấn phẩm, hình đăng mạng xã hội',
      'Key visual cho chiến dịch, sự kiện',
      'Bàn giao file gốc (AI, PSD, PDF) và hướng dẫn sử dụng',
    ],
    idealFor: ['Thương hiệu mới cần một bộ mặt chuyên nghiệp', 'Hình ảnh hiện tại thiếu đồng bộ giữa các kênh'],
  }),
  coreService({
    slug: 'web',
    name: 'Web',
    group: 'digital',
    tagline: 'Website chuẩn điện thoại, nhanh và dễ quản lý.',
    summary: 'Thiết kế và lập trình website giới thiệu, landing page hay trang có tài khoản thành viên: hiển thị tốt trên điện thoại, có chế độ sáng và tối, bàn giao kèm hướng dẫn quản trị.',
    deliverables: [
      'Landing page, website giới thiệu doanh nghiệp',
      'Hiển thị chuẩn trên điện thoại, có chế độ sáng và tối',
      'Form liên hệ, tài khoản thành viên',
      'Hỗ trợ tên miền, hosting và hướng dẫn quản trị',
    ],
    idealFor: ['Chưa có website hoặc website cũ chậm, khó sửa', 'Cần một trang riêng cho chiến dịch quảng cáo'],
  }),
  coreService({
    slug: 'marketing',
    name: 'Marketing',
    group: 'growth',
    tagline: 'Lập kế hoạch và chạy chiến dịch có đo lường.',
    summary: 'Xác định khách hàng mục tiêu, chọn kênh phù hợp với ngân sách, chạy quảng cáo và báo cáo kết quả định kỳ, để mỗi đồng chi ra đều biết đi về đâu.',
    deliverables: [
      'Kế hoạch marketing theo tháng hoặc quý',
      'Chạy quảng cáo Facebook, Google, TikTok',
      'Quản lý fanpage và cộng đồng',
      'Báo cáo kết quả định kỳ',
    ],
    idealFor: ['Có sản phẩm tốt nhưng ít người biết đến', 'Đã chạy quảng cáo nhưng chưa đo được hiệu quả'],
  }),
];
