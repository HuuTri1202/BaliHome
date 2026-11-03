/**
 * Phong cách logo 3D.
 *  ui        : màu chữ / nút trên trang (đủ đậm để đọc)
 *  primary   : màu chính (nửa dưới khung + ký hiệu A/G)
 *  secondary : màu phụ (nửa trên khung + tam giác nhỏ)
 *  plate     : màu tấm nền bên trong logo
 *  metalness / roughness : chất liệu (1 = kim loại; roughness nhỏ = bóng)
 *  bg        : [c1, c2, c3] gradient nền trang
 */
export const THEMES = [
  {
    id: 'classic', name: 'Nguyên bản', short: 'Classic',
    ui: '#1E5BD8', primary: '#1E5BD8', secondary: '#E5232D', plate: '#F4F6FB', metalness: 0.15, roughness: 0.3,
    bg: ['#DCE8FF', '#FFFFFF', '#1E5BD8'],
    desc: 'Xanh dương và đỏ: hai màu nhận diện của Bali Home, thể hiện sự tin cậy và nhiệt huyết.',
  },
  {
    id: 'chrome', name: 'Bạc Chrome', short: 'Chrome',
    ui: '#475569', primary: '#C9D1DC', secondary: '#8A97A8', plate: '#FFFFFF', metalness: 1, roughness: 0.15,
    bg: ['#E6EAF0', '#FFFFFF', '#64748B'],
    desc: 'Phiên bản kim loại bóng, dùng cho biển hiệu, bảng tên và quà tặng doanh nghiệp.',
  },
  {
    id: 'gold', name: 'Vàng Kim', short: 'Gold',
    ui: '#A8650F', primary: '#E2B13C', secondary: '#B8741A', plate: '#FFF8E7', metalness: 1, roughness: 0.25,
    bg: ['#FFF1CF', '#FFFDF6', '#C98A1B'],
    desc: 'Phiên bản vàng kim sang trọng dành cho sự kiện, kỷ niệm và ấn phẩm cao cấp.',
  },
  {
    id: 'navy', name: 'Xanh Đêm', short: 'Navy',
    ui: '#0E2A7A', primary: '#0E2A7A', secondary: '#E5232D', plate: '#DCE6FA', metalness: 0.4, roughness: 0.3,
    bg: ['#C9D7F5', '#EEF3FF', '#0E2A7A'],
    desc: 'Tông xanh đậm trầm tĩnh, phù hợp hồ sơ năng lực và tài liệu chính thức.',
  },
  {
    id: 'ruby', name: 'Đỏ Ruby', short: 'Ruby',
    ui: '#C81E2B', primary: '#C81E2B', secondary: '#1E5BD8', plate: '#FFF1F1', metalness: 0.3, roughness: 0.25,
    bg: ['#FFDADD', '#FFF6F6', '#C81E2B'],
    desc: 'Đảo màu chủ đạo sang đỏ: nổi bật cho các chiến dịch khuyến mãi và truyền thông.',
  },
];
