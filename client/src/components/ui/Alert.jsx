import { AlertIcon, CheckIcon } from './icons.jsx';

/** Thông báo cấp form (lỗi server, mất mạng, thành công). Mảng tông màu phẳng, không viền. */
export default function Alert({ type = 'error', children, className = '' }) {
  if (!children) return null;
  const styles =
    type === 'error'
      ? 'bg-[color-mix(in_srgb,var(--signal)_10%,var(--ground))] text-signal'
      : 'bg-[color-mix(in_srgb,var(--success)_12%,var(--ground))] text-success';
  const Icon = type === 'error' ? AlertIcon : CheckIcon;
  return (
    <div role="alert" className={`flex animate-rise items-start gap-2.5 px-4 py-3.5 text-[15px] font-medium ${styles} ${className}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
