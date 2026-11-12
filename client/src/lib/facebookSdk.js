/* =============================================================================
 * Facebook JS SDK cho nút "Tiếp tục với Facebook". Tải 1 lần, chỉ khi trang cần nút.
 * FB.login phải được gọi NGAY trong sự kiện bấm (không await trước đó), nếu không trình duyệt chặn popup
 * → SDK được tải sẵn khi nút hiện ra, lúc bấm chỉ còn gọi FB.login.
 * ========================================================================== */
const SDK_URL = 'https://connect.facebook.net/vi_VN/sdk.js';
const GRAPH_API_VERSION = 'v23.0';
const LOGIN_SCOPE = 'public_profile,email';

let sdkPromise = null;

/** @returns {Promise<typeof window.FB>} */
export function loadFacebookSdk(appId) {
  if (window.FB) return Promise.resolve(window.FB);
  sdkPromise ??= new Promise((resolve, reject) => {
    window.fbAsyncInit = () => {
      window.FB.init({ appId, version: GRAPH_API_VERSION, cookie: false, xfbml: false });
      resolve(window.FB);
    };
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = () => {
      sdkPromise = null;
      script.remove();
      reject(new Error('Facebook SDK blocked'));
    };
    document.head.append(script);
  });
  return sdkPromise;
}

/**
 * Mở popup đăng nhập Facebook. Gọi đồng bộ trong onClick.
 * @param {(accessToken: string|null) => void} onDone null khi khách đóng popup / từ chối
 */
export function loginWithFacebook(onDone) {
  // FB.login yêu cầu callback là hàm thường (không phải async function)
  window.FB.login((response) => onDone(response?.authResponse?.accessToken ?? null), { scope: LOGIN_SCOPE, auth_type: 'rerequest' });
}
