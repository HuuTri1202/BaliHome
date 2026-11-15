import { useEffect, useState } from 'react';
import { authApi } from './api.js';
import { withRetry } from './retry.js';

const NONE = { google: null, facebook: null };
// Server miễn phí có thể đang ngủ (~30-60 giây mới dậy) → kiên nhẫn hỏi lại thay vì ẩn hẳn nút Google/Facebook
const PROVIDERS_RETRY = { retries: 4, baseDelayMs: 3000, timeoutMs: 65_000 };
let providersPromise = null;

/** Cách đăng nhập server đang bật. Hỏi lại khi server chưa dậy; hết cách mới coi như chưa bật (form email vẫn dùng được) */
function loadProviders() {
  providersPromise ??= withRetry((signal) => authApi.providers({ signal }), PROVIDERS_RETRY).catch(() => {
    providersPromise = null; // lần mở trang sau hỏi lại
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
