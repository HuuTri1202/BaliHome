import { Link } from 'react-router-dom';
import { Button } from './ui/Button.jsx';
import { CONTACT_FORM_HREF, scrollToContactForm } from '../lib/contactForm.js';

/** Nút chuyển đổi chính: đưa khách tới form tư vấn. Lặp lại ở các điểm mấu chốt khi cuộn trang. */
export default function QuoteButton({ variant = 'primary', size = 'lg', bubble = true, className = '' }) {
  return (
    <Button as={Link} to={CONTACT_FORM_HREF} onClick={scrollToContactForm} size={size} variant={variant} bubble={bubble} className={className}>
      Nhận báo giá ngay
    </Button>
  );
}
