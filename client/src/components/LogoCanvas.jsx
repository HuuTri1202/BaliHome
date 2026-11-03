import { useEffect, useRef } from 'react';
import { Logo3D } from '../three/Logo3D.js';

/**
 * Cầu nối React ↔ Three.js.
 * Khởi tạo Logo3D một lần khi mount; prop `theme` đổi → gọi setTheme (nhảy + đổi màu).
 */
export default function LogoCanvas({ theme, interactive = true, className = 'absolute inset-0' }) {
  const boxRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    let logo;
    try {
      logo = new Logo3D(boxRef.current, { theme, interactive });
      logoRef.current = logo;
    } catch (err) {
      console.warn('[LogoCanvas] Trình duyệt không hỗ trợ WebGL:', err);
    }
    return () => logo?.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  useEffect(() => {
    logoRef.current?.setTheme(theme);
  }, [theme]);

  return <div ref={boxRef} className={className} aria-hidden="true" />;
}
