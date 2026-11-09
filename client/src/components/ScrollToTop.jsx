import { useLayoutEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Chuyển sang trang khác thì về đầu trang.
 * Bỏ qua khi bấm Back/Forward (POP) để trình duyệt khôi phục vị trí cũ,
 * và khi URL có #hash vì lúc đó cần cuộn tới section.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();

  useLayoutEffect(() => {
    if (navigationType === 'POP' || hash) return;
    // 'instant': html đang đặt scroll-behavior: smooth, không muốn thấy trang trôi khi chuyển trang
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
