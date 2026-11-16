import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import FloatingContact from './components/FloatingContact.jsx';
import App from './App.jsx';
// Font phục vụ ngay trên web của mình (không gọi Google Fonts: bớt 1 lần kết nối chặn hiển thị, lưu cache 1 năm).
// Mỗi file chỉ khai báo font; trình duyệt chỉ tải bộ ký tự (tiếng Việt / Latin) mà trang thật sự dùng.
import '@fontsource/be-vietnam-pro/400.css';
import '@fontsource/be-vietnam-pro/500.css';
import '@fontsource/be-vietnam-pro/600.css';
import '@fontsource/be-vietnam-pro/700.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import '@fontsource/montserrat/latin-800.css'; // chữ thương hiệu BALIHOME: chỉ cần chữ Latin không dấu
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <AuthProvider>
          <App />
          <FloatingContact />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);
