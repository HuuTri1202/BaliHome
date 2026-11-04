import { useState } from 'react';
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

export default function RegisterPage() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState('');

  const { values, register, handleSubmit, formError, submitting } = useForm(
    { fullName: '', email: '', phone: '', password: '', confirmPassword: '' },
    schema
  );

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
          <Link to="/dang-nhap" state={location.state} className="font-bold text-brand-500 hover:text-brand-700 hover:underline dark:text-brand-400 dark:hover:text-brand-200">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="grid gap-5">
        <Alert>{formError}</Alert>

        <Field label="Họ và tên" icon={UserIcon} placeholder="Nguyễn Văn A" autoComplete="name" autoFocus {...register('fullName')} />

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Email" type="email" icon={MailIcon} placeholder="ban@congty.vn" autoComplete="email" inputMode="email" {...register('email')} />
          <Field label="Số điện thoại" type="tel" icon={PhoneIcon} placeholder="09xx xxx xxx" autoComplete="tel" inputMode="tel" optional {...register('phone')} />
        </div>

        <div>
          <PasswordField
            label="Mật khẩu"
            icon={LockIcon}
            placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
            autoComplete="new-password"
            {...register('password')}
          />
          <PasswordStrength value={values.password} />
        </div>

        <PasswordField
          label="Nhập lại mật khẩu"
          icon={LockIcon}
          placeholder="Nhập lại mật khẩu"
          autoComplete="new-password"
          {...register('confirmPassword')}
        />

        <div>
          <label className="flex cursor-pointer select-none items-start gap-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => { setAgreed(e.target.checked); setAgreeError(''); }}
              aria-invalid={!!agreeError}
              className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer accent-brand-500"
            />
            <span>
              Tôi đồng ý với <a href="#" className="font-semibold text-brand-500 hover:underline dark:text-brand-400">Điều khoản sử dụng</a> và{' '}
              <a href="#" className="font-semibold text-brand-500 hover:underline dark:text-brand-400">Chính sách bảo mật</a> của Bali Home.
            </span>
          </label>
          {agreeError && (
            <p role="alert" className="mt-1.5 flex items-center gap-1.5 text-[13px] font-medium text-accent-600 dark:text-accent-400">
              <AlertIcon className="h-4 w-4" /> {agreeError}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          Tạo tài khoản <ArrowRightIcon className="h-4.5 w-4.5" />
        </Button>
      </form>
    </AuthLayout>
  );
}
