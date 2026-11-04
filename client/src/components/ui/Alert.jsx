import { AlertIcon, CheckIcon } from './icons.jsx';

/** Thông báo cấp form (lỗi server, mất mạng, ...) */
export default function Alert({ type = 'error', children, className = '' }) {
  if (!children) return null;
  const styles =
    type === 'error'
      ? 'border-accent-500/20 bg-accent-500/5 text-accent-600 dark:border-accent-400/30 dark:bg-accent-500/10 dark:text-accent-400'
      : 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/10 dark:text-emerald-300';
  const Icon = type === 'error' ? AlertIcon : CheckIcon;
  return (
    <div role="alert" className={`flex animate-rise items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium ${styles} ${className}`}>
      <Icon className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
