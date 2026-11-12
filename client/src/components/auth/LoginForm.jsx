import { useId, useState } from 'react';
import { Field, PasswordField } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { MailIcon, LockIcon, ArrowRightIcon } from '../ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';
import { AUTH_INPUT_CLASS, AUTH_LINK_CLASS } from './authStyles.js';
import { ZALO_URL } from './AuthSupport.jsx';

const schema = { email: rules.email, password: rules.password };

/**
 * Chưa có dịch vụ gửi email → chưa tự đặt lại mật khẩu qua email được. Chỉ đường thật sự dùng được:
 * Gmail thì vào bằng Google rồi đặt mật khẩu mới; còn lại nhắn Zalo.
 */
function ForgotPasswordHelp({ id, isGoogleEnabled }) {
  return (
    <div id={id} className="animate-rise rounded-xl bg-ground-2 p-4 text-sm leading-relaxed text-ink-2 ring-1 ring-ink/5">
      <p className="font-semibold text-ink">Lấy lại quyền truy cập</p>
      <ul className="mt-2 grid list-disc gap-1.5 pl-5">
        {isGoogleEnabled && (
          <li>Email là Gmail: bấm <span className="font-semibold text-ink">Đăng nhập với Google</span> bên dưới, sau đó đặt mật khẩu mới trong mục Bảo mật.</li>
        )}
        {ZALO_URL && (
          <li>
            <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className={AUTH_LINK_CLASS}>Nhắn Zalo cho Bali Home</a> kèm email đăng ký để được hỗ trợ.
          </li>
        )}
      </ul>
    </div>
  );
}

/**
 * @param {{ remember: boolean, onRememberChange: (value: boolean) => void, isGoogleEnabled: boolean, onSuccess: () => void }} props
 */
export default function LoginForm({ remember, onRememberChange, isGoogleEnabled, onSuccess }) {
  const { login } = useAuth();
  const helpId = useId();
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const { register, handleSubmit, formError, submitting } = useForm({ email: '', password: '' }, schema);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login({ email: values.email.trim(), password: values.password, remember });
      onSuccess();
    } catch (err) {
      setShake(true); // rung form khi sai thông tin
      throw err;
    }
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`grid gap-5 ${shake ? 'animate-shake' : ''}`}
      onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}
    >
      <Alert>{formError}</Alert>

      <Field label="Email" type="email" icon={MailIcon} placeholder="ban@congty.vn" autoComplete="email" inputMode="email" autoFocus inputClassName={AUTH_INPUT_CLASS} {...register('email')} />
      <PasswordField label="Mật khẩu" icon={LockIcon} placeholder="Nhập mật khẩu" autoComplete="current-password" inputClassName={AUTH_INPUT_CLASS} {...register('password')} />

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <label className="flex cursor-pointer select-none items-center gap-2.5 text-[15px] font-medium text-ink">
          <input type="checkbox" checked={remember} onChange={(e) => onRememberChange(e.target.checked)} className="h-5 w-5 cursor-pointer accent-[var(--action)]" />
          Ghi nhớ 30 ngày
        </label>
        <button type="button" onClick={() => setIsHelpOpen((open) => !open)} aria-expanded={isHelpOpen} aria-controls={helpId} className={`text-[15px] ${AUTH_LINK_CLASS}`}>
          Quên mật khẩu?
        </button>
      </div>
      {isHelpOpen && <ForgotPasswordHelp id={helpId} isGoogleEnabled={isGoogleEnabled} />}

      <Button type="submit" variant="brand" size="lg" loading={submitting} className="mt-1 w-full">
        Đăng nhập <ArrowRightIcon className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
      </Button>
    </form>
  );
}
