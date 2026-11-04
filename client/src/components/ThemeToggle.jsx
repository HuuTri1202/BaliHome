import { useTheme } from '../context/ThemeContext.jsx';
import { SunIcon, MoonIcon, MonitorIcon } from './ui/icons.jsx';

/** Nút tròn kính mờ đổi nhanh Sáng ↔ Tối. Nút chỉ có icon → có aria-label. */
export default function ThemeToggle({ className = '' }) {
  const { isDark, toggle } = useTheme();
  const label = isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`glass relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full text-ink transition-transform hover:-translate-y-px ${className}`}
    >
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

/** Bộ chọn đủ 3 chế độ (trang tài khoản) */
export function ThemeSelector() {
  const { preference, setPreference } = useTheme();
  return (
    <div role="radiogroup" aria-label="Chế độ giao diện" className="grid grid-cols-3 gap-1 rounded-2xl bg-ground-3 p-1">
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
              'flex flex-col items-center gap-1.5 rounded-xl px-2 py-3 text-sm font-semibold transition-colors ' +
              (active ? 'bg-ground text-action shadow-sm' : 'text-ink-2 hover:bg-ground-2 hover:text-ink')
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
