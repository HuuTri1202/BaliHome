import { useEffect, useSyncExternalStore } from 'react';
import { notificationsApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';

/* =============================================================================
 * Thông báo của tài khoản đang đăng nhập, dùng chung cho chuông (Topbar) và bong bóng chat:
 * một lần hỏi server cho cả hai. Hỏi định kỳ khi tab đang mở và ngay khi quay lại tab.
 * Phiên hết hạn (401) thì dừng hỏi; lỗi khác bỏ qua, lần hỏi kế tiếp sẽ thử lại.
 * ========================================================================== */
const POLL_INTERVAL_MS = 30_000;
const STOP_DELAY_MS = 1000; // chuyển trang: Header cũ gỡ rồi Header mới gắn lại ngay, không dừng/khởi động thừa
const EMPTY = { notifications: [], unreadCount: 0 };

let state = EMPTY;
let ownerId = null; // tài khoản của dữ liệu đang giữ: đổi tài khoản thì xoá ngay, không lộ thông báo người trước
let timer = null;
let stopTimer = null;
const listeners = new Set();

const emit = (next) => { state = next; listeners.forEach((notify) => notify()); };

async function refresh() {
  if (!timer || document.hidden) return;
  const requestedFor = ownerId;
  try {
    const data = await notificationsApi.list();
    if (requestedFor === ownerId && timer) emit(data);
  } catch (error) {
    // 401 trễ của tài khoản cũ (đã đăng xuất) không được dừng lượt hỏi của tài khoản mới
    if (error.status === 401 && requestedFor === ownerId) stopPolling();
  }
}

function startPolling() {
  clearTimeout(stopTimer);
  if (timer) return;
  timer = setInterval(refresh, POLL_INTERVAL_MS);
  document.addEventListener('visibilitychange', refresh);
  refresh();
}

function stopPolling() {
  clearInterval(timer);
  timer = null;
  document.removeEventListener('visibilitychange', refresh);
}

function subscribe(notify) {
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) stopTimer = setTimeout(stopPolling, STOP_DELAY_MS);
  };
}

const getSnapshot = () => state;

// Cập nhật giao diện trước; nếu gọi server lỗi, lần hỏi kế tiếp sẽ đồng bộ lại số thật
function markWhere(isTarget, request) {
  const now = new Date().toISOString();
  const marked = state.notifications.filter((n) => !n.readAt && isTarget(n)).length;
  if (marked === 0) return;
  emit({
    notifications: state.notifications.map((n) => (!n.readAt && isTarget(n) ? { ...n, readAt: now } : n)),
    unreadCount: Math.max(0, state.unreadCount - marked),
  });
  request().then(refresh, () => {});
}

const markRead = (id) => markWhere((n) => n.id === id, () => notificationsApi.markRead(id));
const markAllRead = () => markWhere(() => true, () => notificationsApi.markAllRead());
const markRequestRead = (requestId) => markWhere((n) => n.requestId === requestId, () => notificationsApi.markRequestRead(requestId));

export function useNotifications() {
  const { user } = useAuth();
  const snapshot = useSyncExternalStore(subscribe, getSnapshot);

  useEffect(() => {
    if (!user) return undefined;
    if (ownerId !== user.id) {
      ownerId = user.id;
      emit(EMPTY);
      stopPolling();
    }
    startPolling();
    return undefined;
  }, [user]);

  // Dữ liệu chưa thuộc tài khoản hiện tại (vừa đổi tài khoản, effect chưa chạy) thì không hiện
  const visible = user && ownerId === user.id ? snapshot : EMPTY;
  return { ...visible, markRead, markAllRead, markRequestRead };
}
