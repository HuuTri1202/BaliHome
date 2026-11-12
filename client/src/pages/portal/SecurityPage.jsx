import { useState } from 'react';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import LinkedAccounts from '../../components/portal/LinkedAccounts.jsx';
import { PasswordField } from '../../components/ui/Field.jsx';
import PasswordStrength from '../../components/ui/PasswordStrength.jsx';
import { ThemeSelector } from '../../components/ThemeToggle.jsx';
import { Button } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { LockIcon } from '../../components/ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';
import { authApi } from '../../lib/api.js';

const confirmRule = (v, all) => (!v ? 'Vui lòng nhập lại mật khẩu mới' : v !== all.newPassword ? 'Mật khẩu nhập lại không khớp' : undefined);
const CHANGE_SCHEMA = {
  currentPassword: rules.password,
  newPassword: (v, all) => rules.newPassword(v) ?? (v && v === all.currentPassword ? 'Mật khẩu mới phải khác mật khẩu hiện tại' : undefined),
  confirmPassword: confirmRule,
};
// Tài khoản tạo bằng Google chưa có mật khẩu → đặt mới, không hỏi mật khẩu hiện tại
const SET_SCHEMA = { newPassword: rules.newPassword, confirmPassword: confirmRule };
const EMPTY = { currentPassword: '', newPassword: '', confirmPassword: '' };

/** /tai-khoan/bao-mat — đổi (hoặc đặt) mật khẩu, đăng xuất mọi thiết bị khác + chế độ giao diện */
export default function SecurityPage() {
  const { user, updateUser } = useAuth();
  const [done, setDone] = useState('');
  const hasPassword = user?.hasPassword !== false;
  const { values, setValues, register, handleSubmit, formError, submitting } = useForm(EMPTY, hasPassword ? CHANGE_SCHEMA : SET_SCHEMA);

  const onSubmit = handleSubmit(async (v) => {
    const { user: next } = await authApi.changePassword({
      ...(hasPassword && { currentPassword: v.currentPassword }),
      newPassword: v.newPassword,
    });
    updateUser(next);
    setValues(EMPTY);
    setDone(hasPassword ? 'Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất.' : 'Đã đặt mật khẩu. Từ giờ bạn đăng nhập được bằng email và mật khẩu này.');
  });

  return (
    <PortalLayout title="Bảo mật & giao diện">
      <div className="grid items-start gap-6 xl:grid-cols-5">
        <Panel title={hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'} className="xl:col-span-3">
          <form onSubmit={onSubmit} noValidate className="grid gap-6">
            <Alert>{formError}</Alert>
            {done && <Alert type="success">{done}</Alert>}
            {hasPassword ? (
              <PasswordField label="Mật khẩu hiện tại" icon={LockIcon} autoComplete="current-password" {...register('currentPassword')} />
            ) : (
              <p className="text-[15px] text-ink-2">Tài khoản của bạn đang đăng nhập bằng Google. Đặt thêm mật khẩu để đăng nhập được cả bằng email.</p>
            )}
            <div>
              <PasswordField label="Mật khẩu mới" icon={LockIcon} autoComplete="new-password" placeholder="Tối thiểu 8 ký tự, gồm chữ và số" {...register('newPassword')} />
              <PasswordStrength value={values.newPassword} />
            </div>
            <PasswordField label="Nhập lại mật khẩu mới" icon={LockIcon} autoComplete="new-password" {...register('confirmPassword')} />
            <p className="text-sm text-ink-2">Sau khi đổi, mọi thiết bị khác đang đăng nhập tài khoản này sẽ bị đăng xuất.</p>
            <div><Button type="submit" loading={submitting}>{hasPassword ? 'Đổi mật khẩu' : 'Đặt mật khẩu'}</Button></div>
          </form>
        </Panel>
        <div className="grid gap-6 xl:col-span-2">
          <LinkedAccounts />
          <Panel title="Giao diện">
            <ThemeSelector />
            <p className="mt-3 text-sm text-ink-2">“Theo hệ thống” tự đổi sáng/tối theo cài đặt của máy hoặc điện thoại.</p>
          </Panel>
        </div>
      </div>
    </PortalLayout>
  );
}
