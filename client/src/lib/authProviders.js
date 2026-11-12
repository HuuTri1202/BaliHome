import { useEffect, useState } from 'react';
import { authApi } from './api.js';

const NONE = { google: null, facebook: null };
let providersPromise = null;

/** Cách đăng nhập server đang bật; lỗi mạng → coi như chưa bật (form email vẫn dùng được), lần sau hỏi lại */
function loadProviders() {
  providersPromise ??= authApi.providers().catch(() => {
    providersPromise = null;
    return NONE;
  });
  return providersPromise;
}

/**
 * { google: { clientId } | null, facebook: { appId } | null }; undefined khi đang hỏi server.
 * Nhà cung cấp chưa cấu hình trên server → null → nút tương ứng tự ẩn.
 */
export function useAuthProviders() {
  const [providers, setProviders] = useState(undefined);
  useEffect(() => {
    let isCurrent = true;
    loadProviders().then((result) => isCurrent && setProviders({ ...NONE, ...result }));
    return () => { isCurrent = false; };
  }, []);
  return providers;
}
