import { Route, Routes } from 'react-router-dom';
import { ProtectedRoute, GuestRoute, AdminRoute } from './components/RouteGuards.jsx';
import HomePage from './pages/HomePage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ServiceDetailPage from './pages/ServiceDetailPage.jsx';
import QuotePage from './pages/QuotePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import LegalPage from './pages/LegalPage.jsx';
import PortalHomePage from './pages/portal/PortalHomePage.jsx';
import MyRequestsPage from './pages/portal/MyRequestsPage.jsx';
import RequestDetailPage from './pages/portal/RequestDetailPage.jsx';
import EditRequestPage from './pages/portal/EditRequestPage.jsx';
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
  );
}
