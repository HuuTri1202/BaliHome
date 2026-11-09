import { statusLabel, fmtDateTime } from '../../data/requests.js';

/** Dòng thời gian của 1 yêu cầu (mới nhất ở trên). showAuthor = trang admin */
export default function Timeline({ events = [], showAuthor = false }) {
  const items = [...events].reverse();
  return (
    <ol className="relative grid gap-6 border-l-2 border-ground-3 pl-6">
      {items.map((e, i) => {
        const title =
          e.kind === 'created' ? 'Bali Home đã tiếp nhận yêu cầu'
          : e.kind === 'status' ? `Chuyển sang “${statusLabel(e.toStatus)}”`
          : e.kind === 'edited' ? (showAuthor ? 'Khách đã chỉnh sửa yêu cầu' : 'Bạn đã chỉnh sửa yêu cầu')
          : 'Ghi chú từ Bali Home';
        return (
          <li key={e.id} className="relative">
            <span className={`absolute -left-[33px] top-1 h-4 w-4 rounded-full ring-4 ring-ground-2 ${i === 0 ? 'bg-action' : 'bg-ink-2/50'}`} aria-hidden="true" />
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-ink-2">
              {fmtDateTime(e.createdAt)}
              {showAuthor && e.author?.fullName ? ` · ${e.author.fullName}` : ''}
            </p>
            {e.note && <p className="mt-2 rounded-2xl bg-ground px-4 py-3 text-[15px] leading-relaxed">{e.note}</p>}
          </li>
        );
      })}
    </ol>
  );
}
