import { Link } from 'react-router-dom';
import { Button } from './ui/Button.jsx';

/** Nút chuyển đổi chính, lặp lại ở các điểm mấu chốt khi cuộn trang. Luôn cỡ lớn, tương phản cao. */
export default function QuoteButton({ variant = 'primary', className = '' }) {
  return (
    <Button as={Link} to="/bao-gia" size="lg" variant={variant} bubble className={className}>
      Nhận báo giá ngay
    </Button>
  );
}
