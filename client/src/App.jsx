import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/RouteGuards.jsx';import HomePage from './pages/HomePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetailPage from './pages/ServiceDetailPage.jsx';
import QuotePage from './pages/QuotePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import PortalHomePage from './pages/portal/PortalHomePage.jsx';
import RequestDetailPage from './pages/portal/RequestDetailPage.jsx';
import ProfilePage from './pages/portal/ProfilePage.jsx';
import SecurityPage from './pages/portal/SecurityPage.jsx';
import AdminOverviewPage from './pages/admin/AdminOverviewPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminServicesPage from './pages/admin/AdminServicesPage.jsx';
import AdminRequestsPage from './pages/admin/AdminRequestsPage.jsx';
import AdminRequestDetailPage from './pages/admin/AdminRequestDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dich-vu" element={<ServicesPage />} />
      <Route path="/dich-vu/:slug" element={<ServiceDetailPage />} />
      <Route path="/bao-gia" element={<QuotePage />} />

      {/* Chỉ dành cho khách chưa đăng nhập */}
      <Route element={<GuestRoute />}>
        <Route path="/dang-nhap" element={<LoginPage />} />
        <Route path="/dang-ky" element={<RegisterPage />} />
      </Route>

      {/* Cổng khách hàng — bắt buộc đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/tai-khoan" element={<PortalHomePage />} />
        <Route path="/tai-khoan/yeu-cau/:id" element={<RequestDetailPage />} />
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
  );
}
