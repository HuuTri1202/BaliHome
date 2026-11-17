/* =============================================================================
 * Ô "Bạn cần gì?" ở Hero: đoán dịch vụ từ vài chữ khách gõ (không dấu cũng được).
 * Tĩnh, không gọi API. Slug phải khớp slug thật trong database (migration 20261105000000_services).
 * ========================================================================== */
const SERVICE_KEYWORDS = [
  { slug: 'in-an', words: ['in an', 'in', 'danh thiep', 'to roi', 'brochure', 'catalogue', 'banner', 'standee', 'backdrop', 'bao bi', 'nhan mac', 'sticker', 'print'] },
  { slug: 'design', words: ['design', 'thiet ke', 'logo', 'nhan dien', 'thuong hieu', 'poster', 'key visual', 'brand'] },
  { slug: 'web', words: ['web', 'website', 'trang web', 'landing', 'ung dung', 'app'] },
  { slug: 'edit', words: ['edit', 'video', 'dung phim', 'chinh sua', 'reels', 'tiktok'] },
  { slug: 'profile-card', words: ['profile card', 'profile', 'ho so nang luc', 'the', 'nfc'] },
  { slug: 'content', words: ['content', 'noi dung', 'bai viet', 'viet bai', 'seo', 'copywriting'] },
  { slug: 'sales', words: ['sales', 'ban hang', 'kinh doanh', 'chot don'] },
  { slug: 'marketing', words: ['marketing', 'quang cao', 'ads', 'chien dich', 'facebook', 'fanpage', 'mang xa hoi'] },
];

/** Chữ thường, bỏ dấu tiếng Việt (kể cả đ), gộp khoảng trắng */
export function normalizeQuery(text) {
  return String(text ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Trả slug dịch vụ khớp nhất, hoặc null nếu không đoán được.
 * Chỉ khớp nguyên cụm từ ("in" không khớp trong "tin"). Cụm đứng sớm nhất thắng (danh từ chính tiếng Việt
 * đứng trước: "website bán hàng" là Web); cùng vị trí thì cụm dài hơn thắng ("in an" thắng "in").
 * @param {string} query
 * @returns {string | null}
 */
export function matchServiceSlug(query) {
  const padded = ` ${normalizeQuery(query)} `;
  if (padded.trim() === '') return null;
  let best = null;
  for (const { slug, words } of SERVICE_KEYWORDS) {
    for (const word of words) {
      const index = padded.indexOf(` ${word} `);
      if (index === -1) continue;
      const isBetter = !best || index < best.index || (index === best.index && word.length > best.length);
      if (isBetter) best = { slug, index, length: word.length };
    }
  }
  return best?.slug ?? null;
}

/** Đường dẫn đích: trang dịch vụ khớp, hoặc danh sách tất cả dịch vụ */
export function serviceSearchPath(query) {
  const slug = matchServiceSlug(query);
  return slug ? `/dich-vu/${slug}` : '/dich-vu';
}
