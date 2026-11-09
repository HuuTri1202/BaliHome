import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon } from '../ui/icons.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { fmtDateTime } from '../../data/requests.js';

const MAX_BADGE_COUNT = 99;
const ROW_CLASS = 'block px-4 py-3 transition-colors hover:bg-ground-3';

function NotificationContent({ notification: { title, body, readAt, createdAt } }) {
  return (
    <span className="flex gap-3">
      <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${readAt ? 'bg-transparent' : 'bg-accent-600'}`} aria-hidden="true" />
      <span className="min-w-0">
        <span className={`block text-sm ${readAt ? 'text-ink-2' : 'font-semibold text-ink'}`}>{title}</span>
        {body && <span className="mt-0.5 line-clamp-2 block text-sm text-ink-2">{body}</span>}
        <span className="mt-1 block text-xs text-ink-2">{fmtDateTime(createdAt)}{readAt ? '' : <span className="sr-only"> · chưa đọc</span>}</span>
      </span>
    </span>
  );
}

function NotificationRow({ notification, onOpen }) {
  const open = () => onOpen(notification.id);
  if (!notification.requestId) {
    return <button type="button" onClick={open} className={`${ROW_CLASS} w-full text-left`}><NotificationContent notification={notification} /></button>;
  }
  return <Link to={`/tai-khoan/yeu-cau/${notification.requestId}`} onClick={open} className={ROW_CLASS}><NotificationContent notification={notification} /></Link>;
}

/** Chuông thông báo trên Topbar: chấm đỏ kèm số chưa đọc, bấm để xem danh sách. */
export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      buttonRef.current?.focus();
    };
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

  const openNotification = (id) => {
    markRead(id);
    setIsOpen(false);
  };

  const label = unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo';

  // Dưới lg bảng căn theo <header> để không tràn mép trái màn hình; từ lg căn theo nút chuông
  return (
    <div ref={rootRef} className="lg:relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={label}
        title={label}
        className="glass relative grid h-11 w-11 place-items-center rounded-full text-ink"
      >
        <BellIcon className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent-600 px-1 text-[11px] font-bold tabular-nums text-white" aria-hidden="true">
            {unreadCount > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-5 top-full mt-2 w-[min(24rem,calc(100vw-2.5rem))] animate-rise overflow-hidden rounded-2xl bg-ground-2 shadow-xl ring-1 ring-ink/10 sm:right-8 lg:right-0">
          <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 py-3">
            <p className="font-bold">Thông báo</p>
            {unreadCount > 0 && <button type="button" onClick={markAllRead} className="text-sm font-semibold text-action hover:underline">Đánh dấu đã đọc</button>}
          </div>
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-ink-2">Chưa có thông báo nào</p>
          ) : (
            <ul className="max-h-[60vh] divide-y divide-ink/5 overflow-y-auto">
              {notifications.map((n) => <li key={n.id}><NotificationRow notification={n} onOpen={openNotification} /></li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
