import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { initializeGoogleIdentity, loadGoogleIdentity, setGoogleCredentialHandler } from '../../lib/googleIdentity.js';

const BUTTON_HEIGHT_PX = 44; // nút "large" của Google
const MIN_WIDTH_PX = 200;
const MAX_WIDTH_PX = 400; // giới hạn của Google
const RESIZE_THRESHOLD_PX = 8;

const fitWidth = (el) => Math.round(Math.min(MAX_WIDTH_PX, Math.max(MIN_WIDTH_PX, el.clientWidth)));

/**
 * Nút chính chủ của Google (Google bắt buộc dùng nút của họ hoặc theo đúng quy chuẩn thương hiệu).
 * Nút được vẽ lại khi đổi sáng/tối hoặc khi khung đổi bề rộng.
 * @param {{ clientId: string, text: 'signin_with'|'signup_with'|'continue_with', onCredential: (credential: string) => void }} props
 */
export default function GoogleSignInButton({ clientId, text, onCredential }) {
  const containerRef = useRef(null);
  const { isDark } = useTheme();
  const [status, setStatus] = useState('loading'); // loading | ready | unavailable

  useEffect(() => {
    setGoogleCredentialHandler(onCredential);
    return () => setGoogleCredentialHandler(null);
  }, [onCredential]);

  useEffect(() => {
    const container = containerRef.current;
    let isCurrent = true;
    let renderedWidth = 0;
    let observer = null;

    const render = (gsi) => {
      renderedWidth = fitWidth(container);
      container.replaceChildren();
      gsi.renderButton(container, {
        type: 'standard',
        theme: isDark ? 'filled_black' : 'outline',
        size: 'large',
        shape: 'pill',
        text,
        logo_alignment: 'center',
        locale: 'vi',
        width: renderedWidth,
      });
    };

    loadGoogleIdentity()
      .then((gsi) => {
        if (!isCurrent) return;
        initializeGoogleIdentity(gsi, clientId);
        render(gsi);
        setStatus('ready');
        observer = new ResizeObserver(() => {
          if (Math.abs(fitWidth(container) - renderedWidth) > RESIZE_THRESHOLD_PX) render(gsi);
        });
        observer.observe(container);
      })
      .catch(() => isCurrent && setStatus('unavailable'));

    return () => {
      isCurrent = false;
      observer?.disconnect();
    };
  }, [clientId, text, isDark]);

  if (status === 'unavailable') return null;
  return (
    <div className="relative" style={{ minHeight: BUTTON_HEIGHT_PX }}>
      {status === 'loading' && <div className="absolute inset-0 animate-pulse rounded-full bg-ground-3" aria-hidden="true" />}
      <div ref={containerRef} className="flex w-full justify-center" />
    </div>
  );
}
