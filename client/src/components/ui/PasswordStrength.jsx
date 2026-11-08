import { passwordChecks, passwordStrength } from '../../lib/validators.js';
import { CheckIcon } from './icons.jsx';

const LEVELS = [
  { label: 'Rất yếu', fill: 'bg-signal', text: 'text-signal' },
  { label: 'Yếu', fill: 'bg-signal', text: 'text-signal' },
  { label: 'Trung bình', fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  { label: 'Mạnh', fill: 'bg-success', text: 'text-success' },
  { label: 'Rất mạnh', fill: 'bg-success', text: 'text-success' },
];
const METER_SEGMENTS = [0, 1, 2, 3];

function RuleItem({ label, isMet }) {
  return (
    <li className={`flex items-center gap-1.5 text-sm font-medium transition-colors duration-200 ${isMet ? 'text-success' : 'text-ink-2'}`}>
      {isMet ? <CheckIcon className="h-4 w-4" /> : <span className="mx-1 h-2 w-2 rounded-full border border-current" aria-hidden="true" />}
      {label}
      <span className="sr-only">{isMet ? ': đã đạt' : ': chưa đạt'}</span>
    </li>
  );
}

/**
 * Thanh độ mạnh + điều kiện bắt buộc của mật khẩu (khớp với server), cập nhật theo từng phím gõ.
 * Luôn giữ nguyên chiều cao để phần form bên dưới không bị nhảy.
 * Trình đọc màn hình chỉ được báo khi số điều kiện đạt thay đổi, không đọc lại sau mỗi phím.
 * @param {{ value: string, id?: string }} props id để ô nhập trỏ tới qua aria-describedby
 */
export default function PasswordStrength({ value, id }) {
  const hasValue = value.length > 0;
  const score = passwordStrength(value);
  const level = LEVELS[score];
  const filledSegments = hasValue ? Math.max(score, 1) : 0;
  const checks = passwordChecks(value);
  const metCount = checks.filter((check) => check.isMet).length;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="flex flex-1 gap-1">
          {METER_SEGMENTS.map((i) => (
            <span key={i} className={`h-2 flex-1 transition-colors duration-300 ${i < filledSegments ? level.fill : 'bg-ground-3'}`} />
          ))}
        </div>
        <span className={`h-5 w-24 text-right text-sm font-bold ${level.text}`}>{hasValue ? level.label : ''}</span>
      </div>
      <ul id={id} className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(({ label, isMet }) => <RuleItem key={label} label={label} isMet={isMet} />)}
      </ul>
      <p className="sr-only" aria-live="polite">{hasValue ? `Đạt ${metCount} trên ${checks.length} điều kiện mật khẩu` : ''}</p>
    </div>
  );
}
