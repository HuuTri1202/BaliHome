import { forwardRef } from 'react';
import { ArrowRightIcon } from './icons.jsx';

/**
 * Nút viên thuốc (bo tròn hoàn toàn) — phong cách "light luxury".
 * Màu lấy từ token → tự đúng ở chế độ sáng/tối.
 *  primary : nền mực đậm (đảo màu ở chế độ tối)   brand : xanh thương hiệu
 *  soft    : bậc tông nền                          glass : kính mờ (đặt trên ảnh/cảnh nền)
 *  outline : viền mảnh, nền trong suốt (nút phụ đặt cạnh nút chính)
 *  onMotif : trắng trên mảng navy                  danger / ghost
 */
const VARIANTS = {
  primary: 'bg-ink text-ground hover:bg-ink/85',
  brand: 'bg-action text-on-action hover:bg-action-hover',
  soft: 'bg-ground-3 text-ink hover:bg-line',
  outline: 'border border-ink/40 bg-transparent text-ink hover:border-ink hover:bg-ink/5', // viền mảnh, nền trong suốt: nút phụ
  glass: 'glass text-ink hover:bg-ground',
  dark: 'bg-ink text-ground hover:bg-ink/85',
  onMotif: 'bg-on-motif text-motif hover:bg-on-motif-2',
  danger: 'bg-[color-mix(in_srgb,var(--signal)_12%,transparent)] text-signal hover:bg-[color-mix(in_srgb,var(--signal)_20%,transparent)]',
  ghost: 'text-ink-2 hover:bg-ground-2 hover:text-ink',
};
const SIZES = {
  sm: 'h-10 px-5 text-sm',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-7 text-base',
};

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Vòng tròn chứa mũi tên ở đuôi nút (như mẫu "Start a Project →") */
export function ArrowBubble({ className = '' }) {
  return (
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-ground text-ink transition-transform group-hover:translate-x-0.5 ${className}`} aria-hidden="true">
      <ArrowRightIcon className="h-4 w-4" />
    </span>
  );
}

/** Nút có trạng thái loading: khoá thao tác + giữ nguyên kích thước (không nhảy layout) */
export const Button = forwardRef(function Button(
  { as: Comp = 'button', variant = 'primary', size = 'md', loading = false, bubble = false, className = '', children, disabled, ...props },
  ref
) {
  const isButton = Comp === 'button';
  return (
    <Comp
      ref={ref}
      {...(isButton && { type: props.type ?? 'button', disabled: disabled || loading })}
      aria-busy={loading || undefined}
      className={
        'group relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold ' +
        'transition-[transform,background-color,color] duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[.98] ' +
        'disabled:pointer-events-none disabled:opacity-60 ' +
        `${VARIANTS[variant]} ${SIZES[size]} ${bubble ? 'pr-1.5' : ''} ${className}`
      }
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>{children}</span>
      {bubble && <ArrowBubble className={`ml-3 ${loading ? 'invisible' : ''}`} />}
    </Comp>
  );
});
