import { forwardRef, useId, useState } from 'react';
import { EyeIcon, EyeOffIcon, AlertIcon } from './icons.jsx';

/**
 * Ô nhập có nhãn, icon, gợi ý và thông báo lỗi (hỗ trợ sáng/tối).
 * Accessibility: label gắn với input, aria-invalid + aria-describedby trỏ tới lỗi/gợi ý.
 */
export const Field = forwardRef(function Field(
  { label, error, hint, icon: Icon, right, optional, className = '', inputClassName = '', ...inputProps },
  ref
) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-sm font-semibold text-slate-700 dark:text-slate-200">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-slate-400 dark:text-slate-500">Không bắt buộc</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            className={`pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors ${
              error ? 'text-accent-500 dark:text-accent-400' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={
            'block h-12 w-full rounded-xl border bg-white text-[15px] text-slate-900 shadow-sm outline-none transition ' +
            'placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ' +
            'dark:bg-slate-900 dark:text-slate-100 dark:shadow-none dark:placeholder:text-slate-500 dark:disabled:bg-slate-800 ' +
            (Icon ? 'pl-11 ' : 'pl-4 ') +
            (right ? 'pr-12 ' : 'pr-4 ') +
            (error
              ? 'border-accent-400 focus:border-accent-500 focus:ring-accent-500/15 dark:border-accent-400/70 dark:focus:ring-accent-500/25 '
              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-500/15 ' +
                'dark:border-slate-700 dark:hover:border-slate-600 dark:focus:border-brand-400 dark:focus:ring-brand-400/20 ') +
            inputClassName
          }
          {...inputProps}
        />
        {right && <div className="absolute inset-y-0 right-1.5 flex items-center">{right}</div>}
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-accent-600 dark:text-accent-400">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-[13px] text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
});

/** Ô mật khẩu có nút hiện/ẩn */
export const PasswordField = forwardRef(function PasswordField(props, ref) {
  const [visible, setVisible] = useState(false);
  return (
    <Field
      ref={ref}
      type={visible ? 'text' : 'password'}
      right={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-brand-500 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      }
      {...props}
    />
  );
});
