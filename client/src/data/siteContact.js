/* =============================================================================
 * Thông tin công ty + liên hệ công khai của Bali Home: chỉ cần sửa SITE_CONTACT bên dưới.
 * Dùng ở chân trang, bản đồ, nút liên hệ nổi, trang pháp lý. Mục để trống hoặc sai định dạng sẽ tự ẩn
 * trên website, không hiện link chết hay số giả.
 * ⚠ Dữ liệu SEO (JSON-LD) trong client/index.html là bản chép tay: đổi ở đây thì sửa cả ở đó.
 * ========================================================================== */
const SITE_CONTACT = {
  companyName: 'CÔNG TY TNHH THƯƠNG MẠI DỊCH VỤ BALI HOME',
  address: '73 Đường 12, Khu phố 5, Phường Hiệp Bình, Thành phố Hồ Chí Minh',
  hotline: '0317 345 941',
  email: 'nhanhoadondt@gmail.com',
  social: [
    { label: 'Zalo', href: 'https://zalo.me/0941651202' }, // Zalo giữ số 0941 651 202 (khác hotline)
    { label: 'Facebook', href: 'https://www.facebook.com/balihome2026' },
  ],
  portfolioPath: '/du-an', // trang Dự án (dữ liệu: data/projects.js); để '' sẽ ẩn link ở chân trang
};

/** Icon kênh liên hệ (client/public/icons). Đổi ảnh thì tăng ?v= để trình duyệt khách không dùng ảnh cũ đã lưu. */
export const CONTACT_ICONS = {
  facebook: '/icons/facebook.png',
  zalo: '/icons/zalo.png?v=2', // v2: bỏ nền trắng bên ngoài icon
  phone: '/icons/phone.png',
};

const PHONE_PATTERN = /^\+?[\d\s().-]{8,20}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const INTERNAL_PATH_PATTERN = /^\/[^/]/;
const MIN_TEXT_LENGTH = 5;

const keepIfValid = (value = '', pattern) => (pattern.test(value.trim()) ? value.trim() : '');
const keepText = (value = '') => (value.trim().length >= MIN_TEXT_LENGTH ? value.trim().replace(/\s+/g, ' ') : '');

/** Chỉ giữ các giá trị hợp lệ, để lỗi gõ trong cấu hình không thành link hỏng trên website */
export function sanitizeSiteContact({ companyName = '', address = '', hotline = '', email = '', social = [], portfolioPath = '' }) {
  return {
    companyName: keepText(companyName),
    address: keepText(address),
    hotline: keepIfValid(hotline, PHONE_PATTERN),
    email: keepIfValid(email, EMAIL_PATTERN).toLowerCase(),
    socialLinks: social.filter(({ href }) => /^https:\/\/\S+$/.test(href.trim())),
    portfolioPath: keepIfValid(portfolioPath, INTERNAL_PATH_PATTERN),
  };
}

const sanitized = sanitizeSiteContact(SITE_CONTACT);

export const COMPANY = { name: sanitized.companyName, address: sanitized.address };
export const CONTACT = { hotline: sanitized.hotline, email: sanitized.email };
export const SOCIAL_LINKS = sanitized.socialLinks;
export const PORTFOLIO_PATH = sanitized.portfolioPath;

/** "0900 000 000" → "tel:+84900000000" (số đầu 0 được đổi sang mã quốc gia Việt Nam) */
export const toTelHref = (phone) => {
  const digits = phone.replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  return `tel:${digits.replace(/^00/, '+').replace(/^0/, '+84')}`;
};

/** Google Maps cho 1 địa chỉ: khung nhúng (không cần API key) và link chỉ đường mở app/web Google Maps */
export const mapEmbedUrl = (address) => `https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=vi&z=16&output=embed`;
export const mapDirectionsUrl = (address) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
