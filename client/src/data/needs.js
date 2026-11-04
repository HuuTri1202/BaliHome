// Dữ liệu hiển thị dùng chung cho dịch vụ & yêu cầu tư vấn. Danh sách dịch vụ thật nằm trong DB (/api/services).

/** Lựa chọn "Khác" trong form — ⚠ khớp OTHER_NEED ở server/src/validators/contact.schema.js */
export const OTHER_NEED = { slug: 'other', name: 'Tư vấn khác' };

/** Nhóm dịch vụ: thứ tự + tên + 1 câu mô tả */
export const GROUPS = [
  { id: 'creative', name: 'Thiết kế & sản xuất', intro: 'Hình ảnh, ấn phẩm và video mang dấu ấn của thương hiệu.' },
  { id: 'digital', name: 'Web & nội dung', intro: 'Nơi khách hàng tìm thấy bạn trên mạng, và điều họ đọc được ở đó.' },
  { id: 'growth', name: 'Bán hàng & tăng trưởng', intro: 'Đưa sản phẩm đến đúng người và giúp đội ngũ chốt đơn.' },
];

export const groupServices = (services) =>
  GROUPS.map((g) => ({ ...g, services: services.filter((s) => s.group === g.id) })).filter((g) => g.services.length);

export const formatPrice = (vnd) =>
  vnd ? `Từ ${new Intl.NumberFormat('vi-VN').format(vnd)}đ` : 'Báo giá theo yêu cầu';

export const STATUS_LABEL = {
  NEW: 'Đã nhận',
  CONTACTED: 'Đã liên hệ',
  DONE: 'Hoàn tất',
};
