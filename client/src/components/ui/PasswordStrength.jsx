import { passwordStrength } from '../../lib/validators.js';
import { CheckIcon } from './icons.jsx';

const LEVELS = [
  { label: 'Rất yếu', color: 'bg-accent-500', text: 'text-accent-600 dark:text-accent-400' },
  { label: 'Yếu', color: 'bg-accent-400', text: 'text-accent-600 dark:text-accent-400' },
  { label: 'Trung bình', color: 'bg-amber-400', text: 'text-amber-600 dark:text-amber-400' },
  { label: 'Mạnh', color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { label: 'Rất mạnh', color: 'bg-emerald-600 dark:bg-emerald-400', text: 'text-emerald-700 dark:text-emerald-300' },
];

/** Thanh đo độ mạnh + checklist yêu cầu bắt buộc (khớp với server) */
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
    <div className="mt-2.5" aria-live="polite">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${i < Math.max(score, 1) ? level.color : 'bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
        <span className={`w-20 text-right text-xs font-bold ${level.text}`}>{level.label}</span>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {checks.map(([label, ok]) => (
          <li
            key={label}
            className={`flex items-center gap-1 text-xs font-medium transition-colors ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}
          >
            <CheckIcon className={`h-3.5 w-3.5 ${ok ? '' : 'opacity-40'}`} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
