import { useCallback, useEffect, useState } from 'react';
import { notificationsApi } from '../lib/api.js';

const POLL_INTERVAL_MS = 30_000;
const EMPTY = { notifications: [], unreadCount: 0 };

/**
 * Thông báo của tài khoản đang đăng nhập. Hỏi server định kỳ khi tab đang mở, và ngay khi quay lại tab.
 * Phiên đăng nhập hết hạn (401) thì dừng hỏi. Lỗi khác bỏ qua: lần hỏi kế tiếp sẽ thử lại.
 */
export function useNotifications() {
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    let isActive = true;
    const stop = () => { isActive = false; };

    const refresh = async () => {
      if (!isActive || document.hidden) return;
      try {
        const data = await notificationsApi.list();
        if (isActive) setState(data);
      } catch (error) {
        if (error.status === 401) stop();
      }
    };

    refresh();
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      stop();
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  // Cập nhật giao diện trước; nếu gọi server lỗi, lần hỏi kế tiếp sẽ đồng bộ lại số thật
  const markRead = useCallback((id) => {
    setState((current) => {
      const target = current.notifications.find((n) => n.id === id);
      if (!target || target.readAt) return current;
      return {
        notifications: current.notifications.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
        unreadCount: Math.max(0, current.unreadCount - 1),
      };
    });
    notificationsApi.markRead(id).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setState((current) => ({ notifications: current.notifications.map((n) => ({ ...n, readAt: n.readAt ?? now })), unreadCount: 0 }));
    notificationsApi.markAllRead().catch(() => {});
  }, []);

  return { ...state, markRead, markAllRead };
}
