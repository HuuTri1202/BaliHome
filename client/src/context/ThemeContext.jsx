import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';

/**
 * Chế độ giao diện.
 *  preference: 'light' | 'dark' | 'system'  (người dùng chọn, lưu localStorage)
 *  resolved  : 'light' | 'dark'             (thực tế đang hiển thị)
 * Lần đầu vào trang: 'system' → theo cài đặt của máy/điện thoại.
 */
const STORAGE_KEY = 'bh-theme'; // ⚠ trùng với public/theme-init.js
const META_COLOR = { light: '#1E5BD8', dark: '#050a18' };

const ThemeContext = createContext(null);
const darkQuery = () => window.matchMedia('(prefers-color-scheme: dark)');

function readPreference() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : 'system';
  } catch {
    return 'system';
  }
}

function applyToDocument(resolved) {
  const root = document.documentElement;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', META_COLOR[resolved]);
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(readPreference);
  const [systemDark, setSystemDark] = useState(() => darkQuery().matches);

  // Đang ở chế độ "Theo hệ thống" mà người dùng đổi cài đặt máy → đổi theo ngay
  useEffect(() => {
    const mq = darkQuery();
    const onChange = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const resolved = preference === 'system' ? (systemDark ? 'dark' : 'light') : preference;

  useLayoutEffect(() => applyToDocument(resolved), [resolved]);

  const setPreference = useCallback((next) => {
    try {
      if (next === 'system') localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch { /* không lưu được → vẫn đổi trong phiên hiện tại */ }

    const update = () => flushSync(() => setPreferenceState(next));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Trình duyệt hỗ trợ View Transitions → hoà màu mượt toàn trang
    if (document.startViewTransition && !reduce) document.startViewTransition(update);
    else update();
  }, []);

  const toggle = useCallback(() => setPreference(resolved === 'dark' ? 'light' : 'dark'), [resolved, setPreference]);

  const value = useMemo(
    () => ({ preference, resolved, isDark: resolved === 'dark', setPreference, toggle }),
    [preference, resolved, setPreference, toggle]
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme phải dùng bên trong <ThemeProvider>');
  return ctx;
}
