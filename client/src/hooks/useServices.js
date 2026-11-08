import { useEffect, useSyncExternalStore } from 'react';
import { ApiError, servicesApi } from '../lib/api.js';
import { withRetry } from '../lib/retry.js';
import { FALLBACK_SERVICES } from '../data/fallbackServices.js';

/* =============================================================================
 * Danh sách dịch vụ dùng chung toàn app (1 kho dữ liệu, 1 request cho mọi component).
 * Ba trạng thái, KHÔNG có trạng thái "lỗi" nào lộ ra giao diện khách:
 *   loading  → hiện skeleton, tối đa SKELETON_MAX_MS
 *   fallback → hiện dịch vụ cốt lõi tĩnh (API chậm hoặc đã thử hết số lần)
 *   ready    → dữ liệu thật từ API
 * API trên Render có thể mất khoảng 50 giây để thức dậy, nên trong lúc retry chạy nền
 * khách đã thấy nội dung; dữ liệu thật về là tự thay thế.
 * ========================================================================== */
const SKELETON_MAX_MS = 3000;
const INITIAL_STATE = { status: 'loading', services: [] };
const FALLBACK_STATE = { status: 'fallback', services: FALLBACK_SERVICES };

let state = INITIAL_STATE;
let inflight = null;
let generation = 0; // tăng khi xoá cache → bỏ qua kết quả của lượt tải cũ
const listeners = new Set();

function setState(next) {
  state = next;
  listeners.forEach((notify) => notify());
}

const showFallback = () => {
  if (state.status === 'loading') setState(FALLBACK_STATE);
};

async function fetchServices(signal) {
  const data = await servicesApi.list({ signal });
  // Không tin dữ liệu từ bên ngoài: proxy trả sai định dạng cũng coi là lỗi tạm thời
  if (!Array.isArray(data?.services)) throw new ApiError(502, 'BAD_RESPONSE', 'Dữ liệu dịch vụ không hợp lệ.');
  return data.services;
}

function ensureLoaded() {
  if (state.status === 'ready' || inflight) return;
  const current = generation;
  const isCurrent = () => current === generation;
  const skeletonTimer = setTimeout(() => { if (isCurrent()) showFallback(); }, SKELETON_MAX_MS);

  inflight = withRetry(fetchServices)
    .then((services) => { if (isCurrent()) setState({ status: 'ready', services }); })
    .catch(() => { if (isCurrent()) showFallback(); }) // lần mở trang kế tiếp sẽ tự thử lại từ đầu
    .finally(() => {
      clearTimeout(skeletonTimer);
      if (isCurrent()) inflight = null;
    });
}

function subscribe(notify) {
  listeners.add(notify);
  return () => listeners.delete(notify);
}

const getSnapshot = () => state;

/** @returns {{ status: 'loading'|'fallback'|'ready', services: Array<object> }} */
export function useServices() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);
  useEffect(ensureLoaded, []);
  return snapshot;
}

/** Xoá cache sau khi admin sửa dịch vụ → lần tải sau lấy dữ liệu mới */
export function invalidateServices() {
  generation += 1;
  inflight = null;
  setState(INITIAL_STATE);
  if (listeners.size) ensureLoaded();
}

/** Lấy tên dịch vụ theo slug (dùng khi đã có danh sách) */
export const serviceName = (slug, services = state.services) =>
  services.find((s) => s.slug === slug)?.name ?? (slug === 'other' ? 'Tư vấn khác' : slug);
