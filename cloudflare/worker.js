/* =============================================================================
 * Bali Home trên Cloudflare Workers.
 * - Giao diện (client/dist) được Cloudflare phục vụ trực tiếp từ edge (cấu hình trong wrangler.jsonc).
 * - /api/* được chuyển tiếp sang API Express trên Render (API_ORIGIN).
 *   Trình duyệt chỉ thấy 1 domain → cookie đăng nhập httpOnly hoạt động như cũ.
 * ========================================================================== */
const INTERNAL_HEADERS = ['x-bh-client-ip', 'x-bh-proxy-secret'];

async function proxyToApi(request, env) {
  const url = new URL(request.url);
  const target = new URL(url.pathname + url.search, env.API_ORIGIN);

  const headers = new Headers(request.headers);
  INTERNAL_HEADERS.forEach((h) => headers.delete(h)); // khách không được tự gửi các header này
  const clientIp = request.headers.get('cf-connecting-ip');
  if (env.PROXY_SECRET && clientIp) {
    headers.set('x-bh-client-ip', clientIp);
    headers.set('x-bh-proxy-secret', env.PROXY_SECRET);
  }

  try {
    return await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : request.body,
      redirect: 'manual',
    });
  } catch {
    return Response.json(
      { error: { code: 'UPSTREAM_UNAVAILABLE', message: 'Máy chủ đang khởi động, vui lòng thử lại sau ít giây.' } },
      { status: 502 }
    );
  }
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api' || pathname.startsWith('/api/')) return proxyToApi(request, env);
    return env.ASSETS.fetch(request);
  },
};
