import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/RouteGuards.jsx';
import HomePage from './pages/HomePage.jsx';

/* =============================================================================
 * Tách code theo trang: trang chủ nằm trong file chính (trang khách vào nhiều nhất);
 * các trang khác chỉ tải khi mở tới → lần đầu vào web tải ít JavaScript hơn.
 * Trang hay được vào tiếp theo được tải ngầm lúc trình duyệt rảnh → bấm sang vẫn mở ngay.
 * ========================================================================== */
const pages = {
  services: () => import('./pages/ServicesPage.jsx'),
  serviceDetail: () => import('./pages/ServiceDetailPage.jsx'),
  quote: () => import('./pages/QuotePage.jsx'),
  projects: () => import('./pages/ProjectsPage.jsx'),
  projectDetail: () => import('./pages/ProjectDetailPage.jsx'),
  auth: () => import('./pages/AuthPage.jsx'),
  legal: () => import('./pages/LegalPage.jsx'),
  portalHome: () => import('./pages/portal/PortalHomePage.jsx'),
  myRequests: () => import('./pages/portal/MyRequestsPage.jsx'),
  requestDetail: () => import('./pages/portal/RequestDetailPage.jsx'),
  editRequest: () => import('./pages/portal/EditRequestPage.jsx'),
  profile: () => import('./pages/portal/ProfilePage.jsx'),
  security: () => import('./pages/portal/SecurityPage.jsx'),
  adminOverview: () => import('./pages/admin/AdminOverviewPage.jsx'),
  adminUsers: () => import('./pages/admin/AdminUsersPage.jsx'),
  adminServices: () => import('./pages/admin/AdminServicesPage.jsx'),
  adminRequests: () => import('./pages/admin/AdminRequestsPage.jsx'),
  adminRequestDetail: () => import('./pages/admin/AdminRequestDetailPage.jsx'),
  notFound: () => import('./pages/NotFoundPage.jsx'),
};
const PREFETCH_WHEN_IDLE = ['services', 'auth', 'quote', 'projects'];
const IDLE_TIMEOUT_MS = 4000;

const ServicesPage = lazy(pages.services);
const ServiceDetailPage = lazy(pages.serviceDetail);
const QuotePage = lazy(pages.quote);
const ProjectsPage = lazy(pages.projects);
const ProjectDetailPage = lazy(pages.projectDetail);
const AuthPage = lazy(pages.auth);
const LegalPage = lazy(pages.legal);
const PortalHomePage = lazy(pages.portalHome);
const MyRequestsPage = lazy(pages.myRequests);
const RequestDetailPage = lazy(pages.requestDetail);
const EditRequestPage = lazy(pages.editRequest);
const ProfilePage = lazy(pages.profile);
const SecurityPage = lazy(pages.security);
const AdminOverviewPage = lazy(pages.adminOverview);
const AdminUsersPage = lazy(pages.adminUsers);
const AdminServicesPage = lazy(pages.adminServices);
const AdminRequestsPage = lazy(pages.adminRequests);
const AdminRequestDetailPage = lazy(pages.adminRequestDetail);
const NotFoundPage = lazy(pages.notFound);

/** Tải ngầm các trang hay vào tiếp, sau khi trang hiện tại đã xong và trình duyệt rảnh */
function usePrefetchCommonPages() {
  useEffect(() => {
    const prefetch = () => PREFETCH_WHEN_IDLE.forEach((name) => pages[name]().catch(() => {}));
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(prefetch, { timeout: IDLE_TIMEOUT_MS });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(prefetch, IDLE_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);
}

/** Chờ tải code của trang (thường rất nhanh): giữ nền trang, không nháy trắng */
const PageFallback = () => <div className="min-h-dvh bg-ground" aria-busy="true" />;

export default function App() {
  usePrefetchCommonPages();
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dich-vu" element={<ServicesPage />} />
        <Route path="/dich-vu/:slug" element={<ServiceDetailPage />} />
        <Route path="/du-an" element={<ProjectsPage />} />
        <Route path="/du-an/:slug" element={<ProjectDetailPage />} />
        <Route path="/bao-gia" element={<QuotePage />} />
        <Route path="/chinh-sach-bao-mat" element={<LegalPage page="privacy" />} />
        <Route path="/dieu-khoan-su-dung" element={<LegalPage page="terms" />} />
        <Route path="/xoa-du-lieu" element={<LegalPage page="dataDeletion" />} />

        {/* Chỉ dành cho khách chưa đăng nhập */}
        <Route element={<GuestRoute />}>
          <Route path="/dang-nhap" element={<AuthPage mode="login" />} />
          <Route path="/dang-ky" element={<AuthPage mode="register" />} />
        </Route>

        {/* Cổng khách hàng — bắt buộc đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/tai-khoan" element={<PortalHomePage />} />
          <Route path="/tai-khoan/yeu-cau" element={<MyRequestsPage />} />
          <Route path="/tai-khoan/yeu-cau/:id" element={<RequestDetailPage />} />
          <Route path="/tai-khoan/yeu-cau/:id/chinh-sua" element={<EditRequestPage />} />
          <Route path="/tai-khoan/ho-so" element={<ProfilePage />} />
          <Route path="/tai-khoan/bao-mat" element={<SecurityPage />} />
        </Route>

        {/* Quản trị — bắt buộc vai trò ADMIN */}
        <Route element={<AdminRoute />}>
          <Route path="/quan-tri" element={<AdminOverviewPage />} />
          <Route path="/quan-tri/yeu-cau" element={<AdminRequestsPage />} />
          <Route path="/quan-tri/yeu-cau/:id" element={<AdminRequestDetailPage />} />
          <Route path="/quan-tri/khach-hang" element={<AdminUsersPage />} />
          <Route path="/quan-tri/dich-vu" element={<AdminServicesPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
