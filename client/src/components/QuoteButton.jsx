import { Link } from 'react-router-dom';
import { Button } from './ui/Button.jsx';
import { CONTACT_FORM_HREF, scrollToContactForm } from '../lib/contactForm.js';

/**
 * Nút chuyển đổi chính: đưa khách tới form tư vấn.
 * Chỉ đặt ở Hero và trong menu điện thoại (form liên hệ có nút gửi cùng tên), tránh lặp lại khắp trang.
 */
export default function QuoteButton({ variant = 'primary', size = 'lg', bubble = true, className = '', label = 'Nhận báo giá ngay' }) {
  return (
    <Button as={Link} to={CONTACT_FORM_HREF} onClick={scrollToContactForm} size={size} variant={variant} bubble={bubble} className={className}>
      {label}
    </Button>
  );
}
