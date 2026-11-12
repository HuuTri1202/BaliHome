import ChatThread from './ChatThread.jsx';
import ChatComposer from './ChatComposer.jsx';
import { useRequestThread } from '../../hooks/useRequestThread.js';

/**
 * Khung chat hoàn chỉnh của một yêu cầu, dùng chung cho trang khách, trang quản trị và bong bóng chat.
 * @param {{ initialMessages: object[], fetchMessages: Function, sendMessage: Function, viewer: 'customer'|'staff',
 *           notice?: React.ReactNode, className?: string, threadClassName?: string }} props
 *   className/threadClassName: dùng khi đặt trong khung có chiều cao cố định (bong bóng chat)
 */
export default function RequestChat({ initialMessages, fetchMessages, sendMessage, viewer, notice, className, threadClassName }) {
  const thread = useRequestThread({ initialMessages, fetchMessages, sendMessage });
  return (
    <div className={className}>
      <ChatThread messages={thread.messages} pending={thread.pending} viewer={viewer} onRetry={thread.retry} onDiscard={thread.discard} className={threadClassName} />
      {notice && <p className="mt-4 rounded-2xl bg-ground px-4 py-3 text-sm text-ink-2">{notice}</p>}
      <ChatComposer onSend={thread.send} />
    </div>
  );
}
