import { useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, PasswordField } from '../components/ui/Field.jsx';
import { Button } from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import PasswordStrength from '../components/ui/PasswordStrength.jsx';
import { MailIcon, LockIcon, UserIcon, PhoneIcon, ArrowRightIcon, AlertIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { rules } from '../lib/validators.js';

const schema = {
  fullName: rules.fullName,
  email: rules.email,
  phone: rules.phone,
  password: rules.newPassword,
  confirmPassword: (v, values) => {
    if (!v) return 'Vui lòng nhập lại mật khẩu';
    if (v !== values.password) return 'Mật khẩu nhập lại không khớp';
  },
};

/** Placeholder ở chế độ tối: slate-400 trên nền ô nhập, đạt WCAG AA */
const INPUT_CLASS = 'dark:placeholder:text-slate-400';

const TERMS_LINK_CLASS = 'font-semibold text-action underline-offset-4 hover:underline';

function TermsCheckbox({ checked, error, onChange }) {
  return (
    <div>
      <label className="flex cursor-pointer select-none items-start gap-3 text-[15px] leading-relaxed text-ink">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={!!error}
          className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer accent-[var(--action)]"
        />
        <span>
          Tôi đồng ý với <a href="#" className={TERMS_LINK_CLASS}>Điều khoản sử dụng</a> và{' '}
          <a href="#" className={TERMS_LINK_CLASS}>Chính sách bảo mật</a> của Bali Home.
        </span>
      </label>
      {error && (
        <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-signal">
          <AlertIcon className="h-4 w-4" /> {error}
        </p>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const passwordRulesId = useId();
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState('');

  const { values, register, handleSubmit, formError, submitting } = useForm(
    { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    schema
  );

  const onAgreeChange = (isChecked) => {
    setAgreed(isChecked);
    setAgreeError('');
  };

  const onSubmit = handleSubmit(async (v) => {
    if (!agreed) {
      setAgreeError('Vui lòng đồng ý với điều khoản để tiếp tục');
      return;
    }
    await signUp({
      fullName: v.fullName.trim(),
      email: v.email.trim(),
      phone: v.phone.trim() || undefined,
      password: v.password,
    });
    navigate(location.state?.from?.pathname ?? '/tai-khoan', { replace: true, state: { welcome: true } });
  });

  return (
    <AuthLayout
      title="Tạo tài khoản"
      subtitle="Chỉ mất chưa đến 1 phút để trở thành thành viên Bali Home."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to="/dang-nhap" state={location.state} className="font-bold text-action underline-offset-4 hover:underline">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-5">
        <Alert>{formError}</Alert>

        <Field label="Họ và tên" required icon={UserIcon} placeholder="Nguyễn Văn A" autoComplete="name" autoFocus inputClassName={INPUT_CLASS} {...register('fullName')} />
        <Field label="Email" required type="email" icon={MailIcon} placeholder="ban@congty.vn" autoComplete="email" inputMode="email" inputClassName={INPUT_CLASS} {...register('email')} />
        <Field label="Số điện thoại" type="tel" icon={PhoneIcon} placeholder="09xx xxx xxx" autoComplete="tel" inputMode="tel" optional inputClassName={INPUT_CLASS} {...register('phone')} />

        <div>
          <PasswordField
            label="Mật khẩu"
            required
            icon={LockIcon}
            placeholder="Nhập mật khẩu"
            autoComplete="new-password"
            inputClassName={INPUT_CLASS}
            describedBy={passwordRulesId}
            {...register('password')}
          />
          <PasswordStrength id={passwordRulesId} value={values.password} />
        </div>

        <PasswordField
          label="Nhập lại mật khẩu"
          required
          icon={LockIcon}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          inputClassName={INPUT_CLASS}
          {...register('confirmPassword')}
        />

        <TermsCheckbox checked={agreed} error={agreeError} onChange={onAgreeChange} />

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          Tạo tài khoản <ArrowRightIcon className="h-4.5 w-4.5" />
        </Button>
      </form>
    </AuthLayout>
  );
}
