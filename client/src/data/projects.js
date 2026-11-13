/* =============================================================================
 * DỰ ÁN THỰC TẾ hiển thị ở /du-an và /du-an/<slug>.
 * CHỈ thêm dự án THẬT mà khách hàng đã đồng ý cho công bố. Mục thiếu thông tin bắt buộc sẽ tự ẩn.
 *
 * Mẫu 1 dự án (chép vào mảng PROJECT_ENTRIES rồi sửa):
 * {
 *   slug: 'nhan-dien-cafe-abc',                 // bắt buộc: chữ thường, số, gạch nối → URL /du-an/nhan-dien-cafe-abc
 *   title: 'Bộ nhận diện cho Cafe ABC',         // bắt buộc
 *   client: 'Cafe ABC',                         // tên khách (bỏ trống nếu khách không muốn nêu tên)
 *   year: 2026,
 *   services: ['design', 'in-an'],              // slug dịch vụ: in-an, design, web, edit, profile-card, sales, marketing, content
 *   summary: 'Một câu tóm tắt dự án.',          // bắt buộc
 *   cover: { src: '/projects/cafe-abc/cover.jpg', alt: 'Biển hiệu Cafe ABC' }, // bắt buộc; ảnh đặt trong client/public/projects/...
 *   challenge: 'Khách cần gì, vấn đề là gì.',
 *   solution: 'Bali Home đã làm gì.',
 *   results: ['Kết quả đo được, ví dụ: ra mắt đúng hạn 3 tuần'],
 *   gallery: [{ src: '/projects/cafe-abc/1.jpg', alt: 'Menu' }],
 *   link: 'https://...',                        // sản phẩm đang chạy (website...), nếu có
 * }
 * ========================================================================== */
const PROJECT_ENTRIES = [];

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isText = (value) => typeof value === 'string' && value.trim().length > 0;
const isImage = (image) => isText(image?.src) && isText(image?.alt);

/** Bỏ mục thiếu thông tin bắt buộc / slug trùng; chuẩn hoá mục tuỳ chọn → giao diện không phải kiểm tra lại */
export function sanitizeProjects(entries) {
  const seen = new Set();
  return entries
    .filter((p) => SLUG_PATTERN.test(p?.slug ?? '') && isText(p.title) && isText(p.summary) && isImage(p.cover))
    .filter((p) => !seen.has(p.slug) && seen.add(p.slug))
    .map((p) => ({
      slug: p.slug,
      title: p.title.trim(),
      client: isText(p.client) ? p.client.trim() : '',
      year: Number.isInteger(p.year) ? p.year : null,
      services: Array.isArray(p.services) ? p.services.filter(isText) : [],
      summary: p.summary.trim(),
      cover: p.cover,
      challenge: isText(p.challenge) ? p.challenge.trim() : '',
      solution: isText(p.solution) ? p.solution.trim() : '',
      results: Array.isArray(p.results) ? p.results.filter(isText) : [],
      gallery: Array.isArray(p.gallery) ? p.gallery.filter(isImage) : [],
      link: /^https:\/\/\S+$/.test(p.link ?? '') ? p.link : '',
    }));
}

export const PROJECTS = sanitizeProjects(PROJECT_ENTRIES);

export const findProject = (slug) => PROJECTS.find((p) => p.slug === slug) ?? null;
