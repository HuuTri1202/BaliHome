import { Field } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { ArrowRightIcon, MailIcon } from '../ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';
import { AUTH_INPUT_CLASS, AUTH_LINK_CLASS } from './authStyles.js';

const schema = { email: rules.email };

/**
 * Facebook đã xác minh người dùng nhưng không cho biết email (đăng ký Facebook bằng số điện thoại, hoặc bỏ quyền email)
 * → khách nhập email để hoàn tất tài khoản mới. Email đã có tài khoản thì server từ chối (không tự nối).
 * @param {{ pending: { pendingToken: string, name: string|null }, remember: boolean, onSuccess: () => void, onCancel: () => void }} props
 */
export default function CompleteSignupForm({ pending, remember, onSuccess, onCancel }) {
  const { completeSignup } = useAuth();
  const { register, handleSubmit, formError, submitting } = useForm({ email: '' }, schema);

  const onSubmit = handleSubmit(async ({ email }) => {
    await completeSignup({ pendingToken: pending.pendingToken, email: email.trim(), remember });
    onSuccess();
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      <p className="text-[15px] leading-relaxed text-ink-2">
        {pending.name ? <>Chào <span className="font-semibold text-ink">{pending.name}</span>, </> : 'Gần xong rồi: '}
        Facebook chưa cho Bali Home biết email của bạn. Nhập email để nhận thông tin về yêu cầu và báo giá.
      </p>
      <Alert>{formError}</Alert>
      <Field label="Email" type="email" icon={MailIcon} placeholder="ban@congty.vn" autoComplete="email" inputMode="email" autoFocus inputClassName={AUTH_INPUT_CLASS} {...register('email')} />
      <Button type="submit" variant="brand" size="lg" loading={submitting} className="w-full">
        Hoàn tất tài khoản <ArrowRightIcon className="h-4.5 w-4.5" />
      </Button>
      <button type="button" onClick={onCancel} className={`justify-self-center text-[15px] ${AUTH_LINK_CLASS}`}>
        Dùng cách đăng nhập khác
      </button>
    </form>
  );
}
