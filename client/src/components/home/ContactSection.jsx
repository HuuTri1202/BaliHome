import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal, { item } from '../Reveal.jsx';
import { CONTAINER } from '../Navbar.jsx';
import { Field, TextArea } from '../ui/Field.jsx';
import { Button } from '../ui/Button.jsx';
import Alert from '../ui/Alert.jsx';
import { UserIcon, PhoneIcon, MailIcon, ArrowRightIcon, CheckIcon, AlertIcon } from '../ui/icons.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useForm } from '../../hooks/useForm.js';
import { rules } from '../../lib/validators.js';
import { contactApi } from '../../lib/api.js';
import { NEEDS, needLabel } from '../../data/needs.js';

const schema = {
  fullName: rules.fullName,
  phone: (v) => (!v.trim() ? 'Vui lòng nhập số điện thoại' : rules.phone(v)),
  email: (v) => (v.trim() ? rules.email(v) : undefined),
  need: (v) => (!v ? 'Vui lòng chọn nhu cầu' : undefined),
  message: (v) => (v.length > 1000 ? 'Lời nhắn tối đa 1000 ký tự' : undefined),
};
const EMPTY = { fullName: '', phone: '', email: '', need: '', message: '' };

/** Nhóm lựa chọn nhu cầu: radio thật (bàn phím dùng mũi tên được), vẽ thành nút lục giác */
function NeedPicker({ value, error, onChange }) {
  return (
    <fieldset aria-describedby={error ? 'need-error' : undefined}>
      <legend className="mb-3 text-[15px] font-semibold text-ink">Bạn cần Bali Home hỗ trợ gì?</legend>
      <div className="flex flex-wrap gap-2">
        {NEEDS.map((n) => {
          const checked = value === n.value;
          return (
            <label
              key={n.value}
              className={
                'hex-pill flex h-11 cursor-pointer items-center px-5 text-[15px] font-semibold transition-transform active:scale-[.98] ' +
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-action ' +
                (checked ? 'text-on-action [--fill:var(--action)]' : 'text-ink [--fill:var(--ground-3)] hover:[--fill:var(--line)]')
              }
            >
              <input type="radio" name="need" value={n.value} checked={checked} onChange={onChange} className="sr-only" />
              {n.label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id="need-error" role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-medium text-signal">
          <AlertIcon className="h-4 w-4" /> {error}
        </p>
      )}
    </fieldset>
  );
}

export default function ContactSection() {
  const { user } = useAuth();
  const [sent, setSent] = useState(null);
  const { values, setValues, errors, formError, submitting, register, handleSubmit } = useForm(EMPTY, schema);

  // Thành viên đã đăng nhập → điền sẵn thông tin (chỉ những ô còn trống)
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({
      ...v,
      fullName: v.fullName || user.fullName || '',
      phone: v.phone || user.phone || '',
      email: v.email || user.email || '',
    }));
  }, [user, setValues]);

  const onSubmit = handleSubmit(async (v) => {
    await contactApi.send({
      fullName: v.fullName.trim(),
      phone: v.phone.trim(),
      email: v.email.trim() || undefined,
      need: v.need,
      message: v.message.trim() || undefined,
    });
    setSent({ need: v.need, phone: v.phone.trim() });
  });

  const needField = register('need');

  return (
    <section id="lien-he" aria-labelledby="lien-he-title" className="py-24 lg:py-28">
      <Reveal className={`${CONTAINER} grid gap-12 lg:grid-cols-12 lg:gap-16`}>
        <div className="lg:col-span-5">
          <h2 id="lien-he-title" {...item(0, 'text-title font-extrabold')}>
            Gửi yêu cầu tư vấn
          </h2>
          <p {...item(1, 'mt-6 max-w-[34ch] text-lead text-ink')}>
            Để lại số điện thoại và nhu cầu của bạn. Bali Home sẽ gọi lại để hỏi rõ và gửi báo giá.
          </p>
          <ul {...item(2, 'mt-10 grid gap-4 text-ink')}>
            {['Không mất phí tư vấn, không bắt buộc mua.', 'Báo giá theo từng hạng mục trước khi làm.', user ? 'Yêu cầu sẽ được lưu vào tài khoản của bạn.' : 'Đăng nhập để theo dõi yêu cầu trong tài khoản.'].map((t) => (
              <li key={t} className="flex gap-3">
                <span className="hex hex-ratio mt-1.5 w-3 shrink-0 bg-action" aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div {...item(3, 'bg-ground-2 p-6 sm:p-10 lg:col-span-7 lg:p-12')}>
          {sent ? (
            <div className="flex min-h-[420px] flex-col items-start justify-center" role="status">
              <span className="hex hex-ratio grid w-16 place-items-center bg-success text-white">
                <CheckIcon className="h-8 w-8" />
              </span>
              <h3 className="mt-8 text-lead font-bold">Bali Home đã nhận yêu cầu của bạn</h3>
              <p className="mt-3 max-w-[46ch] text-ink">
                Nhu cầu: <strong>{needLabel(sent.need)}</strong>. Chúng tôi sẽ gọi lại số <strong>{sent.phone}</strong> để tư vấn.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {user ? (
                  <Button as={Link} to="/tai-khoan" variant="primary">Xem trong tài khoản</Button>
                ) : (
                  <Button as={Link} to="/dang-ky" variant="primary">Tạo tài khoản để theo dõi</Button>
                )}
                <Button variant="soft" onClick={() => { setSent(null); setValues((v) => ({ ...v, need: '', message: '' })); }}>
                  Gửi yêu cầu khác
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate className="grid gap-6">
              <Alert>{formError}</Alert>
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Họ và tên" icon={UserIcon} autoComplete="name" placeholder="Nguyễn Văn A" {...register('fullName')} />
                <Field label="Số điện thoại" icon={PhoneIcon} type="tel" inputMode="tel" autoComplete="tel" placeholder="09xx xxx xxx" {...register('phone')} />
              </div>
              <Field label="Email" icon={MailIcon} type="email" inputMode="email" autoComplete="email" placeholder="ban@congty.vn" optional {...register('email')} />
              <NeedPicker
                value={values.need}
                error={errors.need}
                onChange={(e) => needField.onChange({ target: { value: e.target.value } })}
              />
              <TextArea label="Lời nhắn" optional placeholder="Ví dụ: cần lắp máy lọc nước cho căn hộ 2 phòng ngủ, quận 7." {...register('message')} />
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-2">Thông tin chỉ dùng để Bali Home liên hệ lại với bạn.</p>
                <Button type="submit" size="lg" loading={submitting}>
                  Gửi yêu cầu <ArrowRightIcon className="h-5 w-5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </Reveal>
    </section>
  );
}
