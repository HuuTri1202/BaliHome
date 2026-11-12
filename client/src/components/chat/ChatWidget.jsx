import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import RequestChat from './RequestChat.jsx';
import { ArrowLeftIcon, ChatIcon, CloseIcon } from '../ui/icons.jsx';
import { Spinner } from '../ui/Button.jsx';
import { useNotifications } from '../../hooks/useNotifications.js';
import { contactApi } from '../../lib/api.js';
import { CONTACT_FORM_HREF } from '../../lib/contactForm.js';
import { fmtDateTime } from '../../data/requests.js';

const MAX_BADGE_COUNT = 9;
const chatEvents = (request) => request.events.filter((e) => e.kind === 'note' || e.kind === 'message');

/** Số tin nhắn Bali Home chưa đọc, theo từng yêu cầu */
function useUnreadMessages() {
  const { notifications, markRequestRead } = useNotifications();
  const byRequest = new Map();
  notifications
    .filter((n) => n.kind === 'message' && !n.readAt && n.requestId)
    .forEach((n) => byRequest.set(n.requestId, (byRequest.get(n.requestId) ?? 0) + 1));
  const total = [...byRequest.values()].reduce((sum, n) => sum + n, 0);
  return { byRequest, total, markRequestRead };
}

function ConversationList({ data, unreadByRequest, onOpen }) {
  if (data.status === 'loading') return <div className="grid h-full place-items-center text-action" role="status" aria-label="Đang tải"><Spinner className="h-6 w-6" /></div>;
  if (data.status === 'error') return <p className="p-5 text-sm text-signal">{data.message}</p>;
  if (data.items.length === 0) {
    return (
      <div className="grid h-full place-content-center gap-3 p-6 text-center">
        <p className="text-ink-2">Bạn chưa gửi yêu cầu nào. Gửi yêu cầu để bắt đầu trò chuyện với Bali Home.</p>
        <a href={CONTACT_FORM_HREF} className="font-semibold text-action hover:underline">Gửi yêu cầu tư vấn</a>
      </div>
    );
  }
  return (
    <ul className="divide-y divide-ink/5">
      {data.items.map((request) => {
        const last = chatEvents(request).at(-1);
        const unread = unreadByRequest.get(request.id) ?? 0;
        return (
          <li key={request.id}>
            <button type="button" onClick={() => onOpen(request)} className="flex w-full items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-ground-3">
              <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${unread ? 'bg-accent-600' : 'bg-transparent'}`} aria-hidden="true" />
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-2">
                  <span className={`truncate ${unread ? 'font-bold' : 'font-semibold'}`}>{request.code} · {request.needLabel}</span>
                  {unread > 0 && <span className="shrink-0 text-xs font-bold text-accent-600">{unread} tin mới</span>}
                </span>
                <span className="mt-0.5 block truncate text-sm text-ink-2">
                  {last ? `${last.kind === 'note' ? 'Bali Home' : 'Bạn'}: ${last.note ?? 'Tệp đính kèm'}` : 'Chưa có tin nhắn'}
                </span>
                {last && <span className="text-xs text-ink-2">{fmtDateTime(last.createdAt)}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Bong bóng chat nổi cho khách đã đăng nhập: chọn yêu cầu (theo mã BLH-…) rồi nhắn ngay với Bali Home.
 * Desktop: hộp chat cạnh cụm nút liên hệ. Điện thoại: toàn màn hình.
 */
export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [list, setList] = useState({ status: 'loading', items: [] });
  const [activeRequest, setActiveRequest] = useState(null);
  const [listVersion, setListVersion] = useState(0);
  const { byRequest, total, markRequestRead } = useUnreadMessages();
  const launcherRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  // Mở hộp hoặc quay lại danh sách: tải dữ liệu mới nhất; chỉ có 1 yêu cầu thì vào thẳng cuộc trò chuyện
  useEffect(() => {
    if (!isOpen) return undefined;
    let isCurrent = true;
    setList((current) => ({ ...current, status: 'loading' }));
    contactApi
      .mine()
      .then(({ requests }) => {
        if (!isCurrent) return;
        setList({ status: 'ready', items: requests });
        if (requests.length === 1) setActiveRequest(requests[0]);
      })
      .catch((error) => { if (isCurrent) setList({ status: 'error', items: [], message: error.message }); });
    return () => { isCurrent = false; };
  }, [isOpen, listVersion]);

  const backToList = () => {
    setActiveRequest(null);
    setListVersion((v) => v + 1);
  };

  // Đang xem cuộc trò chuyện thì tin mới của nó coi như đã đọc
  const activeId = activeRequest?.id;
  const activeUnread = activeId ? byRequest.get(activeId) ?? 0 : 0;
  useEffect(() => {
    if (isOpen && activeId && activeUnread > 0) markRequestRead(activeId);
  }, [isOpen, activeId, activeUnread, markRequestRead]);

  // Đóng thì bỏ cuộc trò chuyện đang xem: lần mở sau dùng dữ liệu mới, không hiện tin cũ
  const close = () => {
    setIsOpen(false);
    setActiveRequest(null);
    launcherRef.current?.focus();
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape') close();
  };

  const launcherLabel = total ? `Tin nhắn với Bali Home, ${total} tin mới` : 'Tin nhắn với Bali Home';

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-label={launcherLabel}
        title={launcherLabel}
        className="relative grid h-12 w-12 place-items-center rounded-full bg-action text-on-action shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
      >
        {isOpen ? <CloseIcon className="h-6 w-6" /> : <ChatIcon className="h-6 w-6" />}
        {total > 0 && !isOpen && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent-600 px-1 text-[11px] font-bold tabular-nums text-white ring-2 ring-ground" aria-hidden="true">
            {total > MAX_BADGE_COUNT ? `${MAX_BADGE_COUNT}+` : total}
          </span>
        )}
      </button>

      {/* Portal ra <body>: cụm nút nổi có z-index riêng, nếu nằm trong đó hộp chat toàn màn hình sẽ bị Header che */}
      {isOpen && createPortal(
        <section
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-label="Tin nhắn với Bali Home"
          onKeyDown={onKeyDown}
          style={{ outline: 'none' }} // nhận focus để Esc/Tab hoạt động, không cần viền focus quanh cả hộp
          className="fixed inset-0 z-[60] flex animate-rise flex-col bg-ground-2 outline-none sm:inset-auto sm:bottom-6 sm:right-24 sm:h-[min(640px,calc(100dvh-7rem))] sm:w-[400px] sm:overflow-hidden sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-ink/10"
        >
          <header className="flex items-center gap-2 border-b border-ink/10 px-3 py-3">
            {activeRequest && list.items.length > 1 && (
              <button type="button" onClick={backToList} aria-label="Danh sách cuộc trò chuyện" className="grid h-10 w-10 place-items-center rounded-full hover:bg-ground-3">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0 flex-1 px-2">
              <p className="truncate font-bold">{activeRequest ? activeRequest.code : 'Tin nhắn với Bali Home'}</p>
              <p className="truncate text-xs text-ink-2">
                {activeRequest ? activeRequest.needLabel : 'Chọn yêu cầu để trò chuyện'}
                {activeRequest && <> · <Link to={`/tai-khoan/yeu-cau/${activeRequest.id}`} onClick={close} className="font-semibold text-action hover:underline">Xem chi tiết</Link></>}
              </p>
            </div>
            <button type="button" onClick={close} aria-label="Đóng hộp chat" className="grid h-10 w-10 place-items-center rounded-full hover:bg-ground-3">
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1">
            {activeRequest ? (
              <RequestChat
                key={activeRequest.id}
                viewer="customer"
                initialMessages={activeRequest.events}
                fetchMessages={() => contactApi.messages(activeRequest.id)}
                sendMessage={(payload) => contactApi.sendMessage(activeRequest.id, payload)}
                className="flex h-full flex-col px-4 pb-3 pt-3"
                threadClassName="min-h-0 flex-1"
              />
            ) : (
              <div className="h-full overflow-y-auto">
                <ConversationList data={list} unreadByRequest={byRequest} onOpen={setActiveRequest} />
              </div>
            )}
          </div>
        </section>,
        document.body
      )}
    </>
  );
}
