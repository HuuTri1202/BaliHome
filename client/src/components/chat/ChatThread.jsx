import { useLayoutEffect, useRef } from 'react';
import { fmtBytes, fmtDate, statusLabel } from '../../data/requests.js';
import { FileIcon } from '../ui/icons.jsx';

const STAFF_MESSAGE = 'note';
const CUSTOMER_MESSAGE = 'message';
const IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'gif'];
const NEAR_BOTTOM_PX = 80;

const pad = (n) => String(n).padStart(2, '0');
const fmtTime = (iso) => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };

function systemText(event, viewer) {
  if (event.kind === 'created') return 'Bali Home đã tiếp nhận yêu cầu';
  if (event.kind === 'status') return `Chuyển sang “${statusLabel(event.toStatus)}”`;
  if (event.kind === 'edited') return viewer === 'staff' ? 'Khách đã chỉnh sửa yêu cầu' : 'Bạn đã chỉnh sửa yêu cầu';
  return '';
}

function senderLabel(message, viewer) {
  if (message.kind === STAFF_MESSAGE) return message.author?.fullName ? `${message.author.fullName} · Bali Home` : 'Bali Home';
  return viewer === 'staff' ? message.author?.fullName ?? 'Khách hàng' : 'Bạn';
}

function AttachmentList({ files, isMine }) {
  if (!files?.length) return null;
  return (
    <ul className="mt-2 grid gap-1.5">
      {files.map((file) => {
        const isImage = IMAGE_FORMATS.includes((file.format || '').toLowerCase());
        return (
          <li key={file.id ?? file.url}>
            <a href={file.url} target="_blank" rel="noopener noreferrer" className="block">
              {isImage ? (
                <img src={file.url} alt={file.fileName} loading="lazy" className="max-h-56 w-auto max-w-full rounded-xl object-cover" />
              ) : (
                <span className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isMine ? 'bg-black/15' : 'bg-ground'}`}>
                  <FileIcon className="h-4 w-4 shrink-0" />
                  <span className="min-w-0 truncate font-semibold">{file.fileName}</span>
                  <span className="shrink-0 opacity-75">{fmtBytes(file.bytes)}</span>
                </span>
              )}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function Bubble({ message, viewer, isMine, footer }) {
  const showLabel = !(isMine && message.kind === CUSTOMER_MESSAGE);
  return (
    <li className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
      {showLabel && <span className="mb-1 px-1 text-xs font-semibold text-ink-2">{senderLabel(message, viewer)}</span>}
      <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[75%] ${isMine ? 'rounded-br-md bg-action text-on-action' : 'rounded-bl-md bg-ground-3 text-ink'}`}>
        {message.note && <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">{message.note}</p>}
        <AttachmentList files={message.attachments} isMine={isMine} />
      </div>
      <span className="mt-1 px-1 text-xs text-ink-2">{footer ?? fmtTime(message.createdAt)}</span>
    </li>
  );
}

function PendingFooter({ item, onRetry, onDiscard }) {
  if (item.status === 'sending') return 'Đang gửi…';
  return (
    <span className="text-signal">
      Chưa gửi được.{' '}
      <button type="button" onClick={() => onRetry(item.tempId)} className="font-semibold underline">Gửi lại</button>
      {' · '}
      <button type="button" onClick={() => onDiscard(item.tempId)} className="font-semibold underline">Xoá</button>
    </span>
  );
}

/**
 * Khung tin nhắn của một yêu cầu. Tin của người đang xem nằm bên phải, của bên kia bên trái;
 * các mốc trạng thái hiện ở giữa. Tự cuộn xuống khi có tin mới nếu người dùng đang ở cuối.
 * @param {{ messages: object[], pending: object[], viewer: 'customer'|'staff', onRetry: Function, onDiscard: Function }} props
 */
export default function ChatThread({ messages, pending, viewer, onRetry, onDiscard, className = 'max-h-[60vh] min-h-64' }) {
  const scrollRef = useRef(null);
  const isNearBottom = useRef(true);
  const myKind = viewer === 'staff' ? STAFF_MESSAGE : CUSTOMER_MESSAGE;
  const itemCount = messages.length + pending.length;

  useLayoutEffect(() => {
    const box = scrollRef.current;
    if (box && isNearBottom.current) box.scrollTop = box.scrollHeight;
  }, [itemCount]);

  const trackScroll = () => {
    const box = scrollRef.current;
    isNearBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < NEAR_BOTTOM_PX;
  };

  let lastDay = '';
  const dayDivider = (iso) => {
    const day = fmtDate(iso);
    if (day === lastDay) return null;
    lastDay = day;
    return <li key={`day-${day}`} className="my-1 text-center text-xs font-semibold text-ink-2">{day}</li>;
  };

  return (
    <div ref={scrollRef} onScroll={trackScroll} role="log" aria-live="polite" aria-label="Tin nhắn" className={`overflow-y-auto pr-1 ${className}`}>
      <ol className="grid gap-3">
        {messages.flatMap((event) => {
          const divider = dayDivider(event.createdAt);
          const isChat = event.kind === STAFF_MESSAGE || event.kind === CUSTOMER_MESSAGE;
          const row = isChat ? (
            <Bubble key={event.id} message={event} viewer={viewer} isMine={event.kind === myKind} />
          ) : (
            <li key={event.id} className="text-center">
              <span className="inline-block rounded-full bg-ground px-3 py-1 text-xs text-ink-2">{systemText(event, viewer)} · {fmtTime(event.createdAt)}</span>
            </li>
          );
          return divider ? [divider, row] : [row];
        })}
        {pending.map((item) => (
          <Bubble
            key={item.tempId}
            message={{ ...item, kind: myKind }}
            viewer={viewer}
            isMine
            footer={<PendingFooter item={item} onRetry={onRetry} onDiscard={onDiscard} />}
          />
        ))}
      </ol>
    </div>
  );
}
