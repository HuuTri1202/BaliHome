import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Spinner } from './ui/Button.jsx';

const SLOW_NOTICE_DELAY_MS = 4000;

/** Chờ kiểm tra phiên đăng nhập. Quá 4 giây (server miễn phí đang dậy) thì nói rõ cho khách biết. */
function FullScreenLoader() {
  const [isSlow, setIsSlow] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsSlow(true), SLOW_NOTICE_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="grid min-h-dvh place-items-center px-6 text-center" role="status" aria-live="polite">
      <div className="grid justify-items-center gap-4">
        <Spinner className="h-8 w-8 text-brand-500" />
        <p className={isSlow ? 'max-w-[36ch] text-ink-2' : 'sr-only'}>
          {isSlow ? 'Máy chủ đang khởi động, vui lòng chờ trong giây lát…' : 'Đang tải'}
        </p>
      </div>
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

/** Trang quản trị: phải đăng nhập + vai trò ADMIN (server vẫn kiểm tra quyền ở mọi API) */
export function AdminRoute() {
  const { status, isAdmin } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <FullScreenLoader />;
  if (status === 'guest') return <Navigate to="/dang-nhap" replace state={{ from: location }} />;
  if (!isAdmin) return <Navigate to="/tai-khoan" replace />;
  return <Outlet />;
}

/**
 * Trang chỉ dành cho khách (đăng nhập/đăng ký). Hiện ngay trong lúc còn đang kiểm tra phiên,
 * không bắt khách nhìn vòng xoay khi server đang dậy; hoá ra đã đăng nhập thì chuyển về trang tài khoản.
 */
export function GuestRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'authenticated') {
    return <Navigate to={location.state?.from?.pathname ?? '/tai-khoan'} replace />;
  }
  return <Outlet />;
}
