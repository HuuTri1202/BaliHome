import { useEffect, useId, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import { Field, TextArea } from '../../components/ui/Field.jsx';
import { Button, Spinner } from '../../components/ui/Button.jsx';
import Alert from '../../components/ui/Alert.jsx';
import { ArrowLeftIcon, PhoneIcon } from '../../components/ui/icons.jsx';
import { useForm } from '../../hooks/useForm.js';
import { useServices } from '../../hooks/useServices.js';
import { contactApi } from '../../lib/api.js';
import { rules } from '../../lib/validators.js';
import { OTHER_NEED } from '../../data/needs.js';
import { isRequestEditable } from '../../data/requests.js';

const schema = {
  phone: (v) => (!v.trim() ? 'Vui lòng nhập số điện thoại' : rules.phone(v)),
  need: (v) => (!v ? 'Vui lòng chọn dịch vụ' : undefined),
  message: (v) => (v.length > 2000 ? 'Mô tả tối đa 2000 ký tự' : undefined),
};

const detailPath = (id) => `/tai-khoan/yeu-cau/${id}`;

function EditForm({ request }) {
  const navigate = useNavigate();
  const needSelectId = useId();
  const { services } = useServices();
  const { values, errors, formError, submitting, register, handleSubmit } = useForm(
    { phone: request.phone, need: request.need, message: request.message ?? '' },
    schema
  );

  // Dịch vụ đang chọn có thể đã bị ẩn hoặc danh sách chưa tải xong: vẫn phải có trong danh sách chọn
  const known = [...services, OTHER_NEED];
  const options = known.some((s) => s.slug === request.need) ? known : [{ slug: request.need, name: request.needLabel }, ...known];
  const needField = register('need');

  const onSubmit = handleSubmit(async (v) => {
    await contactApi.updateMine(request.id, { phone: v.phone.trim(), need: v.need, message: v.message.trim() });
    navigate(detailPath(request.id), { replace: true, state: { edited: true } });
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      <Alert>{formError}</Alert>
      <Field label="Số điện thoại" required icon={PhoneIcon} type="tel" inputMode="tel" autoComplete="tel" {...register('phone')} />
      <div>
        <label htmlFor={needSelectId} className="mb-2 block text-[15px] font-semibold text-ink">Dịch vụ</label>
        <select
          id={needSelectId}
          name="need"
          value={values.need}
          onChange={needField.onChange}
          aria-invalid={!!errors.need}
          className="h-13 w-full rounded-2xl border border-field-line bg-field px-4 text-[16px] text-ink outline-none transition-[border-color,box-shadow] focus:border-action focus:ring-2 focus:ring-action"
        >
          {options.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}
        </select>
        {errors.need && <p role="alert" className="mt-2 text-sm font-medium text-signal">{errors.need}</p>}
      </div>
      <TextArea label="Mô tả yêu cầu" optional rows={5} {...register('message')} />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={submitting}>Lưu thay đổi</Button>
        <Button as={Link} to={detailPath(request.id)} variant="soft">Huỷ</Button>
      </div>
    </form>
  );
}

/** /tai-khoan/yeu-cau/:id/chinh-sua — khách sửa số điện thoại, dịch vụ, mô tả của yêu cầu còn chờ xử lý */
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
      <Panel className="max-w-2xl">
        {data.status === 'loading' && <div className="grid place-items-center py-10 text-action" role="status" aria-label="Đang tải"><Spinner className="h-6 w-6" /></div>}
        {data.status === 'error' && <Alert>{data.message}</Alert>}
        {request && !isRequestEditable(request) && <Alert>Yêu cầu này đã được Bali Home tiếp nhận xử lý nên không sửa được nữa. Vui lòng gọi hotline nếu cần thay đổi.</Alert>}
        {request && isRequestEditable(request) && <EditForm request={request} />}
      </Panel>
    </PortalLayout>
  );
}
