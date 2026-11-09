/* =============================================================================
 * Thông tin liên hệ công khai của Bali Home: chỉ cần điền vào SITE_CONTACT bên dưới.
 * Mục để trống hoặc sai định dạng sẽ tự ẩn trên website, không hiện link chết hay số giả.
 * ========================================================================== */
const SITE_CONTACT = {
  hotline: '', // ví dụ: '0900 000 000'
  social: [
    { label: 'Zalo', href: '' }, // URL đầy đủ, ví dụ: 'https://zalo.me/0900000000'
    { label: 'Facebook', href: 'https://www.facebook.com/balihome2026' },
  ],
  portfolioPath: '', // đường dẫn trong web, ví dụ '/du-an'. Chỉ điền khi đã có trang dự án thật.
};

const PHONE_PATTERN = /^\+?[\d\s().-]{8,20}$/;
const INTERNAL_PATH_PATTERN = /^\/[^/]/;

const keepIfValid = (value, pattern) => (pattern.test(value.trim()) ? value.trim() : '');

/** Chỉ giữ các giá trị hợp lệ, để lỗi gõ trong cấu hình không thành link hỏng trên website */
export function sanitizeSiteContact({ hotline, social, portfolioPath }) {
  return {
    hotline: keepIfValid(hotline, PHONE_PATTERN),
    socialLinks: social.filter(({ href }) => /^https:\/\/\S+$/.test(href.trim())),
    portfolioPath: keepIfValid(portfolioPath, INTERNAL_PATH_PATTERN),
  };
}

const sanitized = sanitizeSiteContact(SITE_CONTACT);

export const CONTACT = { hotline: sanitized.hotline };
export const SOCIAL_LINKS = sanitized.socialLinks;
export const PORTFOLIO_PATH = sanitized.portfolioPath;

/** "0900 000 000" → "tel:+84900000000" (số đầu 0 được đổi sang mã quốc gia Việt Nam) */
export const toTelHref = (phone) => {
  const digits = phone.replace(/\(0\)/g, '').replace(/[^\d+]/g, '');
  return `tel:${digits.replace(/^00/, '+').replace(/^0/, '+84')}`;
};
