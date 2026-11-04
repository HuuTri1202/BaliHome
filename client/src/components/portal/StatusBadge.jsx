import { STATUS, STATUS_FLOW } from '../../data/requests.js';
import { CheckIcon } from '../ui/icons.jsx';

export function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.NEW;
  return <span className={`inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-semibold ${s.tone}`}>{s.label}</span>;
}

/** Thanh tiến độ 4 bước: Mới tiếp nhận → Đã liên hệ → Đang xử lý → Hoàn thành */
export function StatusStepper({ status, compact = false }) {
  if (status === 'CANCELLED') return <StatusBadge status="CANCELLED" />;
  const current = STATUS_FLOW.indexOf(status);
  return (
    <ol className={`grid grid-cols-4 gap-2 ${compact ? '' : 'sm:gap-3'}`} aria-label={`Tiến độ: ${STATUS[status]?.label}`}>
      {STATUS_FLOW.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="min-w-0" aria-current={active ? 'step' : undefined}>
            <span className={`block h-1.5 rounded-full transition-colors ${i <= current ? 'bg-action' : 'bg-ground-3'}`} />
            {!compact && (
              <span className={`mt-2 flex items-center gap-1.5 text-[13px] font-semibold ${i <= current ? 'text-ink' : 'text-ink-2'}`}>
                {done && <CheckIcon className="h-3.5 w-3.5 text-action" />}
                <span className="truncate">{STATUS[s].label}</span>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
