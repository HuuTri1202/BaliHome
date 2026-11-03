import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './ui/Button.jsx';

function FullScreenLoader() {
  return (
    <div className="grid min-h-dvh place-items-center text-brand-500" role="status" aria-label="Đang tải">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

/** Trang cần đăng nhập. Chưa đăng nhập → chuyển tới /dang-nhap, nhớ trang đang muốn vào. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'guest') return <Navigate to="/dang-nhap" replace state={{ from: location }} />;
  return <Outlet />;
}

/** Trang chỉ dành cho khách (đăng nhập/đăng ký). Đã đăng nhập → về trang tài khoản. */
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'authenticated') {
    return <Navigate to={location.state?.from?.pathname ?? '/tai-khoan'} replace />;
  }
  return <Outlet />;
}
