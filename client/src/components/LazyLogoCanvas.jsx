import { lazy, Suspense, useEffect, useRef, useState } from 'react';

// Three.js khá nặng (~150 KB nén) → tách thành chunk riêng
const LogoCanvas = lazy(() => import('./LogoCanvas.jsx'));
const IDLE_TIMEOUT_MS = 2500;

/**
 * Logo 3D chỉ tải khi:
 *  1. khung của nó thật sự hiện trên màn hình (khung đang ẩn, vd. nửa trái trang đăng nhập trên điện thoại → không tải), và
 *  2. trình duyệt rảnh (sau khi chữ + ảnh chính đã hiện) → không làm chậm lần hiển thị đầu tiên.
 * Trước đó giữ một khung trống cùng kích thước để bố cục không nhảy.
 */
export default function LazyLogoCanvas(props) {
  const placeholderRef = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = placeholderRef.current;
    if (!el || shouldLoad) return undefined;
    let idleHandle = null;
    const scheduleLoad = () => {
      if ('requestIdleCallback' in window) idleHandle = window.requestIdleCallback(() => setShouldLoad(true), { timeout: IDLE_TIMEOUT_MS });
      else idleHandle = setTimeout(() => setShouldLoad(true), IDLE_TIMEOUT_MS / 2);
    };
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      scheduleLoad();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      if (idleHandle !== null) ('cancelIdleCallback' in window ? window.cancelIdleCallback(idleHandle) : clearTimeout(idleHandle));
    };
  }, [shouldLoad]);

  const placeholder = <div ref={placeholderRef} className={props.className} aria-hidden="true" />;
  if (!shouldLoad) return placeholder;
  return (
    <Suspense fallback={placeholder}>
      <LogoCanvas {...props} />
    </Suspense>
  );
}
