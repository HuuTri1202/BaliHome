import { forwardRef, useId, useState } from 'react';
import { EyeIcon, EyeOffIcon, AlertIcon } from './icons.jsx';

/* Ô nhập vuông góc (khớp nút lục giác cạnh sắc). Form là nơi duy nhất được phép có viền. */
const CONTROL =
  'block w-full rounded-2xl border bg-ground text-[16px] text-ink outline-none transition-colors ' +
  'placeholder:text-ink-2/70 disabled:cursor-not-allowed disabled:bg-ground-2 ';
const controlState = (error) =>
  error
    ? 'border-signal focus:border-signal focus:ring-4 focus:ring-[color-mix(in_srgb,var(--signal)_18%,transparent)] '
    : 'border-line hover:border-ink-2/50 focus:border-action focus:ring-4 focus:ring-[color-mix(in_srgb,var(--action)_18%,transparent)] ';

function Label({ htmlFor, label, optional }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between text-[15px] font-semibold text-ink">
      <span>{label}</span>
      {optional && <span className="text-sm font-normal text-ink-2">Không bắt buộc</span>}
    </label>
  );
}

function Message({ id, error, hint }) {
  if (error) {
    return (
      <p id={`${id}-error`} role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-signal">
        <AlertIcon className="h-4 w-4 shrink-0" />
        {error}
      </p>
    );
  }
  return hint ? <p id={`${id}-hint`} className="mt-2 text-sm text-ink-2">{hint}</p> : null;
}

/**
 * Ô nhập có nhãn, icon, gợi ý và thông báo lỗi.
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
      <Label htmlFor={id} label={label} optional={optional} />
      <div className="relative">
        {Icon && (
          <Icon className={`pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 ${error ? 'text-signal' : 'text-ink-2'}`} />
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={CONTROL + controlState(error) + 'h-13 ' + (Icon ? 'pl-12 ' : 'pl-4 ') + (right ? 'pr-13 ' : 'pr-4 ') + inputClassName}
          {...inputProps}
        />
        {right && <div className="absolute inset-y-0 right-1.5 flex items-center">{right}</div>}
      </div>
      <Message id={id} error={error} hint={hint} />
    </div>
  );
});

/** Ô nhập nhiều dòng */
export const TextArea = forwardRef(function TextArea({ label, error, hint, optional, className = '', rows = 4, ...props }, ref) {
  const id = useId();
  return (
    <div className={className}>
      <Label htmlFor={id} label={label} optional={optional} />
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
        className={CONTROL + controlState(error) + 'resize-y px-4 py-3 leading-relaxed'}
        {...props}
      />
      <Message id={id} error={error} hint={hint} />
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
          className="grid h-10 w-10 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ground-2 hover:text-ink"
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
