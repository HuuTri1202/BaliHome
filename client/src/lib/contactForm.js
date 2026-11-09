/** id của khung form tư vấn; mỗi trang có form đều gắn đúng id này (xem ContactSection) */
export const CONTACT_FORM_ID = 'contact-form';
export const CONTACT_FORM_HREF = `/#${CONTACT_FORM_ID}`;

/** Cuộn mượt tới phần tử, hoặc nhảy thẳng nếu người dùng bật giảm chuyển động */
export function smoothScrollIntoView(element) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

/**
 * onClick của nút CTA (đặt trên <Link to={CONTACT_FORM_HREF}>).
 * Trang hiện tại có form → cuộn tới form, không đổi trang.
 * Không có → để Link đưa về trang chủ, ScrollToTop sẽ cuộn tới form.
 */
export function scrollToContactForm(event) {
  const isOpeningNewTab = event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0;
  if (isOpeningNewTab) return;
  const form = document.getElementById(CONTACT_FORM_ID);
  if (!form) return;
  event.preventDefault();
  smoothScrollIntoView(form);
}
