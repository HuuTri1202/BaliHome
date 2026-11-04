import { passwordStrength } from '../../lib/validators.js';
import { CheckIcon } from './icons.jsx';

const LEVELS = [
  { label: 'Rất yếu', fill: 'bg-signal', text: 'text-signal' },
  { label: 'Yếu', fill: 'bg-signal', text: 'text-signal' },
  { label: 'Trung bình', fill: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-400' },
  { label: 'Mạnh', fill: 'bg-success', text: 'text-success' },
  { label: 'Rất mạnh', fill: 'bg-success', text: 'text-success' },
];

/** Thanh đo độ mạnh (4 lục giác nhỏ) + điều kiện bắt buộc (khớp với server) */
export default function PasswordStrength({ value }) {
  if (!value) return null;
  const score = passwordStrength(value);
  const level = LEVELS[score];
  const checks = [
    ['Tối thiểu 8 ký tự', value.length >= 8],
    ['Có chữ cái', /[A-Za-zÀ-ỹ]/.test(value)],
    ['Có chữ số', /\d/.test(value)],
  ];

  return (
    <div className="mt-3" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`h-2 flex-1 transition-colors duration-300 ${i < Math.max(score, 1) ? level.fill : 'bg-ground-3'}`} />
          ))}
        </div>
        <span className={`w-24 text-right text-sm font-bold ${level.text}`}>{level.label}</span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(([label, ok]) => (
          <li key={label} className={`flex items-center gap-1 text-sm font-medium ${ok ? 'text-success' : 'text-ink-2'}`}>
            <CheckIcon className={`h-4 w-4 ${ok ? '' : 'opacity-40'}`} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
