import { useTheme } from '../context/ThemeContext.jsx';
import { SunIcon, MoonIcon, MonitorIcon } from './ui/icons.jsx';

/** Nút tròn đổi nhanh Sáng ↔ Tối (dùng trên navbar / trang xác thực) */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();
  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={
        'relative grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full transition ' +
        'bg-white/70 text-slate-600 shadow-sm ring-1 ring-slate-900/5 backdrop-blur hover:bg-white hover:text-slate-900 ' +
        'dark:bg-slate-800/70 dark:text-slate-300 dark:ring-white/10 dark:hover:bg-slate-700 dark:hover:text-white ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ' +
        className
      }
    >
      {/* 2 icon chồng nhau, xoay + mờ dần khi đổi */}
      <SunIcon className={`absolute h-5 w-5 transition-all duration-500 ${isDark ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
      <MoonIcon className={`absolute h-5 w-5 transition-all duration-500 ${isDark ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'}`} />
    </button>
  );
}

const OPTIONS = [
  { value: 'light', label: 'Sáng', icon: SunIcon },
  { value: 'dark', label: 'Tối', icon: MoonIcon },
  { value: 'system', label: 'Theo hệ thống', icon: MonitorIcon },
];

/** Bộ chọn đầy đủ 3 chế độ (dùng trong trang tài khoản) */
export function ThemeSelector() {
  const { preference, setPreference } = useTheme();
  return (
    <div role="radiogroup" aria-label="Chế độ giao diện" className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = preference === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setPreference(value)}
            className={
              'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-xs font-semibold transition sm:text-[13px] ' +
              'focus-visible:outline-2 focus-visible:outline-brand-500 ' +
              (active
                ? 'bg-white text-brand-600 shadow-sm ring-1 ring-slate-900/5 dark:bg-slate-950 dark:text-brand-200 dark:ring-white/10'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
