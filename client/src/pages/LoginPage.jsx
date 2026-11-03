import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { Field, PasswordField } from '../components/ui/Field.jsx';
import { Button } from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { MailIcon, LockIcon, ArrowRightIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from '../hooks/useForm.js';
import { rules } from '../lib/validators.js';

const schema = { email: rules.email, password: rules.password };

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [remember, setRemember] = useState(true);
  const [shake, setShake] = useState(false);
  const { register, handleSubmit, formError, submitting } = useForm({ email: '', password: '' }, schema);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login({ email: values.email.trim(), password: values.password, remember });
      navigate(location.state?.from?.pathname ?? '/tai-khoan', { replace: true });
    } catch (err) {
      setShake(true); // rung form khi sai thông tin
      throw err;
    }
  });

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để tiếp tục với Bali Home."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to="/dang-ky" state={location.state} className="font-bold text-brand-500 hover:text-brand-700 hover:underline">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form
        onSubmit={onSubmit}
        noValidate
        className={`grid gap-5 ${shake ? 'animate-shake' : ''}`}
        onAnimationEnd={(e) => e.target === e.currentTarget && setShake(false)}
      >
        <Alert>{formError}</Alert>

        <Field
          label="Email"
          type="email"
          icon={MailIcon}
          placeholder="ban@congty.vn"
          autoComplete="email"
          inputMode="email"
          autoFocus
          {...register('email')}
        />

        <PasswordField
          label="Mật khẩu"
          icon={LockIcon}
          placeholder="Nhập mật khẩu"
          autoComplete="current-password"
          {...register('password')}
        />

        <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4.5 w-4.5 cursor-pointer rounded border-slate-300 accent-brand-500"
          />
          Ghi nhớ đăng nhập trong 30 ngày
        </label>

        <Button type="submit" size="lg" loading={submitting} className="mt-1 w-full">
          Đăng nhập <ArrowRightIcon className="h-4.5 w-4.5" />
        </Button>
      </form>
    </AuthLayout>
  );
}
