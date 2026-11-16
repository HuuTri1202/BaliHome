import { useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import DesiredPriceField from '../../components/quote/DesiredPriceField.jsx';
import { Field, TextArea } from '../../components/ui/Field.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowLeftIcon, MailIcon, PhoneIcon, UserIcon } from '../../components/ui/icons.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useServices } from '../../hooks/useServices.js';
import { contactApi } from '../../lib/api.js';
import { rules } from '../../lib/validators.js';
import { groupDigits, parseVnd, validateDesiredPrice } from '../../lib/money.js';
import { OTHER_NEED } from '../../data/needs.js';
import { BUDGETS, INDUSTRIES, isRequestEditable } from '../../data/requests.js';

const today = () => new Date().toISOString().slice(0, 10);
const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');
const detailPath = (id) => `/tai-khoan/yeu-cau/${id}`;
const SELECT_CLASS =
  'h-13 w-full rounded-2xl border border-field-line bg-field px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] focus:border-action focus:ring-2 focus:ring-action';

/** Kiểm tra phía trình duyệt (server kiểm tra lại toàn bộ). originalDeadline: giữ nguyên ngày cũ thì không bắt buộc từ hôm nay. */
const buildSchema = (originalDeadline) => ({
  fullName: rules.fullName,
  phone: (v) => (!v.trim() ? 'Vui lòng nhập số điện thoại' : rules.phone(v)),
  email: (v) => (v.trim() ? rules.email(v) : undefined),
  company: (v) => (v.length > 120 ? 'Tên doanh nghiệp tối đa 120 ký tự' : undefined),
  industry: (v) => (v.length > 80 ? 'Lĩnh vực tối đa 80 ký tự' : undefined),
  need: (v) => (!v ? 'Vui lòng chọn dịch vụ' : undefined),
  desiredPrice: validateDesiredPrice,
  deadline: (v) => (v && v !== originalDeadline && v < today() ? 'Deadline phải từ hôm nay trở đi' : undefined),
  message: (v) => (v.length > 2000 ? 'Mô tả tối đa 2000 ký tự' : undefined),
});

const initialValues = (request) => ({
  fullName: request.fullName ?? '',
  phone: request.phone ?? '',
  email: request.email ?? '',
  company: request.company ?? '',
  industry: request.industry ?? '',
  need: request.need,
  budget: request.budget ?? '',
  desiredPrice: groupDigits(request.desiredPrice),
  deadline: toDateInput(request.deadline),
  message: request.message ?? '',
});

/** Bỏ trống ô tuỳ chọn = xoá giá trị cũ (server lưu null) */
const toPayload = (v) => ({
  fullName: v.fullName.trim(),
  phone: v.phone.trim(),
  email: v.email.trim(),
  company: v.company.trim(),
  industry: v.industry.trim(),
  need: v.need,
  budget: v.budget,
  desiredPrice: parseVnd(v.desiredPrice) ?? '',
  deadline: v.deadline,
  message: v.message.trim(),
});

function FormSection({ title, children }) {
  return (
    <fieldset className="grid gap-5 border-t border-ink/10 pt-6 first:border-t-0 first:pt-0">
      <legend className="mb-1 text-[17px] font-bold">{title}</legend>
      {children}
    </fieldset>
  );
}

function EditForm({ request }) {
  const navigate = useNavigate();
  const needSelectId = useId();
  const budgetSelectId = useId();
  const industryListId = useId();
  const { services } = useServices();
  const originalDeadline = toDateInput(request.deadline);
  const { values, errors, formError, submitting, register, setValues, handleSubmit } = useForm(initialValues(request), buildSchema(originalDeadline));

  // Dịch vụ đang chọn có thể đã bị ẩn hoặc danh sách chưa tải xong: vẫn phải có trong danh sách chọn
  const known = [...services, OTHER_NEED];
  const options = known.some((s) => s.slug === request.need) ? known : [{ slug: request.need, name: request.needLabel }, ...known];
  const needField = register('need');
  const budgetField = register('budget');

  const onSubmit = handleSubmit(async (v) => {
    const { changed = [] } = await contactApi.updateMine(request.id, toPayload(v));
    navigate(detailPath(request.id), { replace: true, state: { edited: true, changed } });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      <Alert>{formError}</Alert>

      <FormSection title="Thông tin liên hệ">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Họ và tên" required icon={UserIcon} autoComplete="name" {...register('fullName')} />
          <Field label="Số điện thoại" required icon={PhoneIcon} type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
        </div>
        <Field label="Email" optional icon={MailIcon} type="email" autoComplete="email" {...register('email')} />
      </FormSection>

      <FormSection title="Nhu cầu">
        <div>
          <label htmlFor={needSelectId} className="mb-2 block text-[15px] font-semibold text-ink">Dịch vụ</label>
          <select id={needSelectId} name="need" value={values.need} onChange={needField.onChange} aria-invalid={!!errors.need} className={SELECT_CLASS}>
            {options.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
          </select>
          {errors.need && <p role="alert" className="mt-2 text-sm font-medium text-signal">{errors.need}</p>}
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Doanh nghiệp / thương hiệu" optional {...register('company')} />
          <Field label="Lĩnh vực" optional list={industryListId} {...register('industry')} />
          <datalist id={industryListId}>{INDUSTRIES.map((name) => <option key={name} value={name} />)}</datalist>
        </div>
        <TextArea label="Mô tả yêu cầu" optional rows={5} {...register('message')} />
      </FormSection>

      <FormSection title="Ngân sách & thời gian">
        <div className="max-w-sm">
          <label htmlFor={budgetSelectId} className="mb-2 block text-[15px] font-semibold text-ink">Ngân sách dự kiến</label>
          <select id={budgetSelectId} name="budget" value={values.budget} onChange={budgetField.onChange} className={SELECT_CLASS}>
            <option value="">Chưa chọn</option>
            {BUDGETS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </select>
        </div>
        <DesiredPriceField
          value={values.desiredPrice}
          onChange={(value) => setValues((v) => ({ ...v, desiredPrice: value }))}
          error={errors.desiredPrice}
        />
        <Field
          label="Deadline mong muốn"
          type="date"
          optional
          min={originalDeadline && originalDeadline < today() ? originalDeadline : today()}
          hint="Để trống nếu chưa có ngày cụ thể."
          className="max-w-xs"
          {...register('deadline')}
        />
      </FormSection>

      <p className="text-sm text-ink-2">Tệp đính kèm không sửa ở đây; bạn gửi thêm tệp trong khung trao đổi của yêu cầu.</p>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={submitting}>Lưu thay đổi</Button>
        <Button as={Link} to={detailPath(request.id)} variant="soft">Huỷ</Button>
      </div>
    </form>
  );
}

/** /tai-khoan/yeu-cau/:id/chinh-sua — khách sửa toàn bộ thông tin của yêu cầu còn "Mới tiếp nhận" */
export default function EditRequestPage() {
  const { id } = useParams();
  const [data, setData] = useState({ status: 'loading' });

  useEffect(() => {
    document.title = 'Chỉnh sửa yêu cầu — Bali Home';
    let isCurrent = true;
    contactApi
      .mineOne(id)
      .then(({ request }) => { if (isCurrent) setData({ status: 'ready', request }); })
      .catch((error) => { if (isCurrent) setData({ status: 'error', message: error.message }); });
    return () => { isCurrent = false; };
  }, [id]);

  const { request } = data;
  const back = (
    <Link to={detailPath(id)} className="inline-flex items-center gap-1.5 font-semibold text-ink-2 hover:text-ink">
      <ArrowLeftIcon className="h-4 w-4" /> Chi tiết yêu cầu
    </Link>
  );

  return (
    <PortalLayout title="Chỉnh sửa yêu cầu" subtitle={request?.code} actions={back}>
      <Panel className="max-w-3xl">
        {data.status === 'loading' && <div className="grid place-items-center py-10 text-action" role="status" aria-label="Đang tải"><Spinner className="h-6 w-6" /></div>}
        {data.status === 'error' && <Alert>{data.message}</Alert>}
        {request && !isRequestEditable(request) && <Alert>Yêu cầu này đã được Bali Home tiếp nhận xử lý nên không sửa được nữa. Vui lòng gọi hotline nếu cần thay đổi.</Alert>}
        {request && isRequestEditable(request) && <EditForm request={request} />}
      </Panel>
    </PortalLayout>
  );
}
