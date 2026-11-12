import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';

/**
 * Khách chưa đăng nhập: "Đăng nhập" (chữ, nhẹ) + "Đăng ký" (màu thương hiệu, nổi hơn).
 * Đăng nhập: nhớ trang đang xem → đăng nhập xong quay về đúng chỗ.
 * Đăng ký: không nhớ → tài khoản mới vào trang chào mừng /tai-khoan.
 * @param {{ size?: 'sm'|'md', className?: string, fullWidth?: boolean }} props
 */
export default function AuthButtons({ size = 'sm', className = '', fullWidth = false }) {
  const location = useLocation();
  const state = { from: location };
  const widthClass = fullWidth ? 'flex-1' : '';
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button as={Link} to="/dang-nhap" state={state} variant="ghost" size={size} className={`text-ink ${widthClass}`}>
        Đăng nhập
      </Button>
      <Button as={Link} to="/dang-ky" variant="brand" size={size} className={widthClass}>
        Đăng ký
      </Button>
    </div>
  );
}
