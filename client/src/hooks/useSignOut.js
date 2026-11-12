import { useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const PRIVATE_PREFIXES = ['/tai-khoan', '/quan-tri'];

/**
 * Đăng xuất dùng chung (Header, menu điện thoại, cổng khách hàng).
 * Đang ở trang cần đăng nhập → về trang chủ; trang công khai → ở lại, Header tự đổi sang trạng thái khách.
 */
export function useSignOut() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    // Rời trang riêng tư TRƯỚC khi xoá phiên: nếu xoá trước, bộ chặn route sẽ đẩy sang /dang-nhap
    if (PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) navigate('/', { replace: true });
    setIsSigningOut(true);
    try {
      await logout();
    } finally {
      setIsSigningOut(false);
    }
  }, [logout, navigate, pathname]);

  return { signOut, isSigningOut };
}
