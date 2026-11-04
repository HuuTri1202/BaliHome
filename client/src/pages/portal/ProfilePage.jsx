import { useState } from 'react';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import { Field } from '../../components/ui/Field.jsx';
import { Button } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { UserIcon, PhoneIcon, MailIcon } from '../../components/ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';
import { authApi } from '../../lib/api.js';
import { fmtDate } from '../../data/requests.js';

const schema = { fullName: rules.fullName, phone: rules.phone };

/** /tai-khoan/ho-so — cập nhật họ tên, số điện thoại */
export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [saved, setSaved] = useState(false);
  const { values, register, handleSubmit, formError, submitting } = useForm({ fullName: user.fullName, phone: user.phone ?? '' }, schema);
  const dirty = values.fullName.trim() !== user.fullName || values.phone.replace(/[\s.-]/g, '') !== (user.phone ?? '');

  const onSubmit = handleSubmit(async (v) => {
    setSaved(false);
    const { user: next } = await authApi.updateMe({ fullName: v.fullName.trim(), phone: v.phone.trim() });
    updateUser(next);
    setSaved(true);
  });

  return (
    <PortalLayout title="Hồ sơ" subtitle="Thông tin này được điền sẵn khi bạn gửi yêu cầu báo giá.">
      <Panel>
        <form onSubmit={onSubmit} noValidate className="grid max-w-2xl gap-6">
          <Alert>{formError}</Alert>
          {saved && !dirty && <Alert type="success">Đã lưu thay đổi.</Alert>}
          <Field label="Họ và tên" icon={UserIcon} autoComplete="name" {...register('fullName')} />
          <Field label="Số điện thoại" icon={PhoneIcon} type="tel" inputMode="tel" autoComplete="tel" optional placeholder="09xx xxx xxx" {...register('phone')} />
          <Field label="Email" icon={MailIcon} value={user.email} disabled readOnly hint="Email dùng để đăng nhập nên không đổi được ở đây." />
          <p className="text-sm text-ink-2">Thành viên từ {fmtDate(user.createdAt)}.</p>
          <div>
            <Button type="submit" loading={submitting} disabled={!dirty}>Lưu thay đổi</Button>
          </div>
        </form>
      </Panel>
    </PortalLayout>
  );
}
