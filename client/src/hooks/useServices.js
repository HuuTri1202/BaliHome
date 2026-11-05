import { useCallback, useEffect, useState } from 'react';
import { servicesApi } from '../lib/api.js';

/**
 * Danh sách dịch vụ (từ /api/services), dùng chung toàn app.
 * Cache ở cấp module: nhiều component cùng gọi → chỉ 1 request; chuyển trang không tải lại.
 */
let cache = null;   // mảng dịch vụ đã tải
let inflight = null; // promise đang chạy

function load() {
  if (cache) return Promise.resolve(cache);
  inflight ??= servicesApi
    .list()
    .then(({ services }) => (cache = services))
    .finally(() => { inflight = null; });
  return inflight;
}

export function useServices() {
  const [state, setState] = useState(() => (cache ? { status: 'ready', services: cache } : { status: 'loading', services: [] }));

  const fetchIt = useCallback(() => {
    if (!cache) setState({ status: 'loading', services: [] });
    load()
      .then((services) => setState({ status: 'ready', services }))
      .catch((error) => setState({ status: 'error', services: [], error }));
  }, []);

  useEffect(() => { if (!cache) fetchIt(); }, [fetchIt]);

  return { ...state, reload: fetchIt };
}

/** Xoá cache sau khi admin sửa dịch vụ → lần tải sau lấy dữ liệu mới */
export const invalidateServices = () => { cache = null; };

/** Lấy tên dịch vụ theo slug từ cache (dùng khi đã có danh sách) */
export const serviceName = (slug, services = cache ?? []) =>
  services.find((s) => s.slug === slug)?.name ?? (slug === 'other' ? 'Tư vấn khác' : slug);
