import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_INTERVAL_MS = 8000;
const STOP_POLLING_STATUSES = [401, 403, 404];

/** Gộp 2 danh sách theo id (bản mới thắng), sắp theo thời gian; tránh mất tin khi kết quả hỏi định kỳ về muộn */
function mergeById(current, incoming) {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

/**
 * Khung chat của một yêu cầu: hỏi server định kỳ khi tab đang mở, gửi tin hiện ngay (optimistic),
 * gửi lỗi thì giữ lại để thử lại.
 * @param {{ initialMessages: object[], fetchMessages: () => Promise<{ messages: object[] }>, sendMessage: (payload: object) => Promise<{ message: object }> }} options
 */
export function useRequestThread({ initialMessages, fetchMessages, sendMessage }) {
  const [messages, setMessages] = useState(initialMessages);
  const [pending, setPending] = useState([]); // { tempId, note, attachments, createdAt, status: 'sending'|'failed', error? }
  const api = useRef({ fetchMessages, sendMessage });
  api.current = { fetchMessages, sendMessage };
  const pendingRef = useRef(pending);
  pendingRef.current = pending;

  // Trang cha tải lại dữ liệu (vd. admin đổi trạng thái) → nhận thêm các mục mới
  useEffect(() => { setMessages((current) => mergeById(current, initialMessages)); }, [initialMessages]);

  useEffect(() => {
    let isActive = true;
    const refresh = async () => {
      if (!isActive || document.hidden) return;
      try {
        const { messages: latest } = await api.current.fetchMessages();
        if (isActive) setMessages((current) => mergeById(current, latest));
      } catch (error) {
        if (STOP_POLLING_STATUSES.includes(error.status)) isActive = false; // hết phiên / mất quyền: dừng hỏi
      }
    };
    const timer = setInterval(refresh, POLL_INTERVAL_MS);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      isActive = false;
      clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  const deliver = useCallback(async (item) => {
    try {
      const { message } = await api.current.sendMessage({ body: item.note || undefined, attachments: item.attachments });
      setPending((list) => list.filter((p) => p.tempId !== item.tempId));
      setMessages((current) => mergeById(current, [message]));
    } catch (error) {
      setPending((list) => list.map((p) => (p.tempId === item.tempId ? { ...p, status: 'failed', error: error.message } : p)));
    }
  }, []);

  const send = useCallback((body, attachments) => {
    const item = { tempId: crypto.randomUUID(), note: body, attachments, createdAt: new Date().toISOString(), status: 'sending' };
    setPending((list) => [...list, item]);
    deliver(item);
  }, [deliver]);

  // Gọi API ngoài hàm cập nhật state: React có thể chạy hàm cập nhật 2 lần (StrictMode) → gửi trùng
  const retry = useCallback((tempId) => {
    const item = pendingRef.current.find((p) => p.tempId === tempId);
    if (!item || item.status === 'sending') return;
    setPending((list) => list.map((p) => (p.tempId === tempId ? { ...p, status: 'sending', error: undefined } : p)));
    deliver(item);
  }, [deliver]);

  const discard = useCallback((tempId) => setPending((list) => list.filter((p) => p.tempId !== tempId)), []);

  return { messages, pending, send, retry, discard };
}
