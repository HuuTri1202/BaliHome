/**
 * Lớp gọi API dùng chung.
 * - Cookie httpOnly được trình duyệt tự gửi kèm (cùng origin qua Vite proxy).
 * - Gặp 401 → tự gọi /auth/refresh một lần rồi thử lại request gốc.
 *   Nhiều request cùng 401 một lúc chỉ tạo đúng 1 lần refresh (dùng chung promise).
 */
export class ApiError extends Error {
  constructor(status, code, message, fields) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields ?? {};
  }
}

const NETWORK_MSG = 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.';

async function rawRequest(path, { method = 'GET', body, signal } = {}) {
  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'include',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'NETWORK', NETWORK_MSG);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Proxy trả 5xx không có JSON → backend chưa chạy
    if (!data?.error) throw new ApiError(res.status, 'NETWORK', NETWORK_MSG);
    throw new ApiError(res.status, data.error.code, data.error.message, data.error.fields);
  }
  return data;
}

let refreshPromise = null;
const NO_RETRY = ['/auth/login', '/auth/register', '/auth/google', '/auth/facebook', '/auth/complete-signup', '/auth/refresh', '/auth/logout'];

export async function request(path, options) {
  try {
    return await rawRequest(path, options);
  } catch (err) {
    if (!(err instanceof ApiError) || err.status !== 401 || NO_RETRY.includes(path)) throw err;
    refreshPromise ??= rawRequest('/auth/refresh', { method: 'POST' }).finally(() => {
      refreshPromise = null;
    });
    await refreshPromise; // refresh thất bại → ném lỗi → coi như chưa đăng nhập
    return rawRequest(path, options);
  }
}

export const servicesApi = {
  list: ({ signal } = {}) => request('/services', { signal }),
  get: (slug) => request(`/services/${encodeURIComponent(slug)}`),
};

export const contactApi = {
  send: (payload) => request('/contact', { method: 'POST', body: payload }),
  mine: () => request('/contact/mine'),
  mineOne: (id) => request(`/contact/mine/${encodeURIComponent(id)}`),
  updateMine: (id, payload) => request(`/contact/mine/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  messages: (id) => request(`/contact/mine/${encodeURIComponent(id)}/messages`),
  sendMessage: (id, payload) => request(`/contact/mine/${encodeURIComponent(id)}/messages`, { method: 'POST', body: payload }),
};

export const notificationsApi = {
  list: () => request('/notifications'),
  markRead: (id) => request(`/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' }),
  markAllRead: () => request('/notifications/read-all', { method: 'POST' }),
  markRequestRead: (requestId) => request(`/notifications/requests/${encodeURIComponent(requestId)}/read`, { method: 'POST' }),
};

export const uploadsApi = {
  config: () => request('/uploads/config'),
  sign: () => request('/uploads/signature', { method: 'POST' }),
};

export const adminApi = {
  stats: () => request('/admin/stats'),
  list: ({ status = '', q = '', page = 1, awaiting = false } = {}) => {
    const qs = new URLSearchParams({ ...(status && { status }), ...(q && { q }), ...(awaiting && { awaiting: '1' }), page: String(page) });
    return request(`/admin/requests?${qs}`);
  },
  get: (id) => request(`/admin/requests/${encodeURIComponent(id)}`),
  messages: (id) => request(`/admin/requests/${encodeURIComponent(id)}/messages`),
  sendMessage: (id, payload) => request(`/admin/requests/${encodeURIComponent(id)}/messages`, { method: 'POST', body: payload }),
  update: (id, payload) => request(`/admin/requests/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload }),
  overview: () => request('/admin/overview'),
  series: (days) => request(`/admin/series?days=${days}`),
  users: ({ q = '', role = '', page = 1 } = {}) => {
    const qs = new URLSearchParams({ ...(q && { q }), ...(role && { role }), page: String(page) });
    return request(`/admin/users?${qs}`);
  },
  setRole: (id, role) => request(`/admin/users/${encodeURIComponent(id)}/role`, { method: 'PATCH', body: { role } }),
  services: () => request('/admin/services'),
  updateService: (slug, payload) => request(`/admin/services/${encodeURIComponent(slug)}`, { method: 'PATCH', body: payload }),
};

export const authApi = {
  me: () => request('/auth/me'),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  providers: () => request('/auth/providers'),
  /** provider: 'google' ({ credential }) | 'facebook' ({ accessToken }) → { user } hoặc { needsEmail, pendingToken, name } */
  signInWith: (provider, payload) => request(`/auth/${provider}`, { method: 'POST', body: payload }),
  completeSignup: (payload) => request('/auth/complete-signup', { method: 'POST', body: payload }),
  identities: () => request('/auth/identities'),
  logout: () => request('/auth/logout', { method: 'POST' }),
  updateMe: (payload) => request('/auth/me', { method: 'PATCH', body: payload }),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: payload }),
};
