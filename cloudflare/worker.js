/* =============================================================================
 * Bali Home trên Cloudflare Workers.
 * - Giao diện (client/dist) được Cloudflare phục vụ trực tiếp từ edge (cấu hình trong wrangler.jsonc).
 * - /api/* được chuyển tiếp sang API Express trên Render (API_ORIGIN).
 *   Trình duyệt chỉ thấy 1 domain → cookie đăng nhập httpOnly hoạt động như cũ.
 * - Render gói miễn phí ngủ sau 15 phút không có request, đánh thức mất ~30-60 giây:
 *   + Hẹn giờ (cron trong wrangler.jsonc) gọi /api/ping 10 phút/lần để server không ngủ.
 *   + Nếu vẫn gặp lúc server đang dậy: request ĐỌC (GET/HEAD) được chờ và thử lại thay vì báo lỗi ngay.
 *     Request GHI (POST...) không tự gửi lại, tránh tạo trùng (vd. gửi 2 yêu cầu tư vấn).
 * ========================================================================== */
const INTERNAL_HEADERS = ['x-bh-client-ip', 'x-bh-proxy-secret'];
const RETRYABLE_METHODS = new Set(['GET', 'HEAD']);
const WAKE_WAIT_MS = 55_000; // tổng thời gian chờ server dậy cho 1 request đọc
const WAKE_RETRY_DELAY_MS = 2_000;
const UPSTREAM_ERROR_STATUSES = new Set([502, 503, 504]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startingResponse = () =>
  Response.json(
    { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Máy chủ đang khởi động, vui lòng thử lại sau ít giây.' } },
    { status: 503, headers: { 'Retry-After': '10' } }
  );

/**
 * Lỗi do Render (server chưa dậy), không phải lỗi của API: API Bali Home luôn trả lỗi dạng JSON,
 * còn trang lỗi của Render là HTML / rỗng → chỉ thử lại loại này.
 */
const isRenderWakeError = (res) =>
  UPSTREAM_ERROR_STATUSES.has(res.status) && !(res.headers.get('content-type') ?? '').includes('application/json');

function buildUpstreamHeaders(request, env) {
  const headers = new Headers(request.headers);
  INTERNAL_HEADERS.forEach((h) => headers.delete(h)); // khách không được tự gửi các header này
  const clientIp = request.headers.get('cf-connecting-ip');
  if (env.PROXY_SECRET && clientIp) {
    headers.set('x-bh-client-ip', clientIp);
    headers.set('x-bh-proxy-secret', env.PROXY_SECRET);
  }
  return headers;
}

async function proxyToApi(request, env) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.API_ORIGIN);
  const headers = buildUpstreamHeaders(request, env);
  const canRetry = RETRYABLE_METHODS.has(request.method);
  const send = () =>
    fetch(target, { method: request.method, headers, body: canRetry ? undefined : request.body, redirect: 'manual' });

  if (!canRetry) {
    try {
      return await send();
    } catch {
      return startingResponse();
    }
  }

  const deadline = Date.now() + WAKE_WAIT_MS;
  for (;;) {
    try {
      const res = await send();
      if (!isRenderWakeError(res) || Date.now() >= deadline) return res;
    } catch {
      if (Date.now() >= deadline) return startingResponse();
    }
    await sleep(WAKE_RETRY_DELAY_MS);
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) return proxyToApi(request, env);
    return env.ASSETS.fetch(request);
  },

  // Cron (wrangler.jsonc → triggers.crons): giữ API trên Render luôn thức
  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(fetch(new URL('/api/ping', env.API_ORIGIN), { headers: { 'user-agent': 'balihome-keepalive' } }).catch(() => {}));
  },
};
