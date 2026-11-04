import { forwardRef } from 'react';

/**
 * Nút bấm theo motif lục giác (2 đầu vát giống khung logo).
 * Màu nền đặt qua biến --fill (vẽ ở ::before của .hex-pill) → outline focus không bị cắt.
 * Tất cả màu lấy từ token nên tự đúng ở chế độ sáng/tối.
 */
const VARIANTS = {
  primary: 'text-on-action [--fill:var(--action)] hover:[--fill:var(--action-hover)]',
  soft: 'text-ink [--fill:var(--ground-3)] hover:[--fill:var(--line)]',
  outline: 'text-ink [--fill:var(--ground-3)] hover:[--fill:var(--line)]', // giữ tên cũ = soft
  dark: 'text-ground [--fill:var(--ink)] hover:[--fill:var(--ink-2)]',
  onMotif: 'text-motif [--fill:var(--on-motif)] hover:[--fill:var(--on-motif-2)]',
  danger:
    'text-signal [--fill:color-mix(in_srgb,var(--signal)_12%,transparent)] hover:[--fill:color-mix(in_srgb,var(--signal)_22%,transparent)]',
  ghost: 'text-ink-2 hover:text-ink [--fill:transparent] hover:[--fill:var(--ground-2)]',
};
const SIZES = {
  sm: 'h-10 px-5 text-sm [--cut:0.7rem]',
  md: 'h-12 px-6 text-[15px]',
  lg: 'h-14 px-8 text-base [--cut:1.05rem]',
};

export function Spinner({ className = 'h-5 w-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Nút có trạng thái loading: khoá thao tác + giữ nguyên kích thước (không nhảy layout) */
export const Button = forwardRef(function Button(
  { as: Comp = 'button', variant = 'primary', size = 'md', loading = false, className = '', children, disabled, ...props },
  ref
) {
  const isButton = Comp === 'button';
  return (
    <Comp
      ref={ref}
      {...(isButton && { type: props.type ?? 'button', disabled: disabled || loading })}
      aria-busy={loading || undefined}
      className={
        'hex-pill inline-flex select-none items-center justify-center gap-2 font-bold whitespace-nowrap ' +
        'transition-transform duration-200 hover:-translate-y-px active:translate-y-0 active:scale-[.98] ' +
        'disabled:pointer-events-none disabled:opacity-60 ' +
        `${VARIANTS[variant]} ${SIZES[size]} ${className}`
      }
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      )}
      <span className={`inline-flex items-center gap-2 ${loading ? 'invisible' : ''}`}>{children}</span>
    </Comp>
  );
});
