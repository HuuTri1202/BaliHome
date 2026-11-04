import { forwardRef } from 'react';

const VARIANTS = {
  primary:
    'bg-brand-500 text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/35 active:bg-brand-700 ' +
    'dark:shadow-brand-500/15 dark:hover:bg-brand-400',
  dark: 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200',
  outline:
    'border border-slate-300 bg-white/70 text-slate-700 backdrop-blur hover:border-slate-400 hover:bg-white ' +
    'dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:bg-slate-800',
  ghost: 'text-slate-600 hover:bg-slate-900/5 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white',
  danger:
    'border border-accent-500/30 bg-white text-accent-600 hover:bg-accent-500/5 ' +
    'dark:border-accent-400/40 dark:bg-transparent dark:text-accent-400 dark:hover:bg-accent-500/10',
};
const SIZES = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
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
        'relative inline-flex select-none items-center justify-center gap-2 rounded-xl font-bold transition-all duration-200 ' +
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ' +
        'disabled:cursor-not-allowed disabled:opacity-60 ' +
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
