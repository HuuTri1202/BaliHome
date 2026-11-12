/* =============================================================================
 * Google Identity Services (nút "Tiếp tục với Google").
 * Google bật hay chưa: xem lib/authProviders.js. Script của Google chỉ tải khi trang cần nút, và chỉ 1 lần.
 * ========================================================================== */
const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptPromise = null;

/** Tải script Google 1 lần; bị chặn (adblock, mất mạng) → reject để nút tự ẩn */
export function loadGoogleIdentity() {
  if (window.google?.accounts?.id) return Promise.resolve(window.google.accounts.id);
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.onload = () => (window.google?.accounts?.id ? resolve(window.google.accounts.id) : reject(new Error('GSI unavailable')));
    script.onerror = () => {
      scriptPromise = null;
      script.remove();
      reject(new Error('GSI blocked'));
    };
    document.head.append(script);
  });
  return scriptPromise;
}

/* Google chỉ cho initialize 1 lần mỗi trang → callback đi qua biến này để nút nào đang hiện nhận kết quả */
let initializedFor = null;
let activeHandler = null;

/** @param {(credential: string) => void} handler */
export function setGoogleCredentialHandler(handler) {
  activeHandler = handler;
}

export function initializeGoogleIdentity(gsi, clientId) {
  if (initializedFor === clientId) return;
  gsi.initialize({
    client_id: clientId,
    callback: ({ credential }) => activeHandler?.(credential),
    ux_mode: 'popup',
    auto_select: false,
    cancel_on_tap_outside: true,
    itp_support: true,
  });
  initializedFor = clientId;
}
