import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import FileDrop from '../components/quote/FileDrop.jsx';
import { Field, TextArea } from '../components/ui/Field.jsx';
import { Button } from '../components/ui/Button.jsx';
import Alert from '../components/ui/Alert.jsx';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, UserIcon, PhoneIcon, MailIcon, AlertIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useServices, serviceName } from '../hooks/useServices.js';
import { useUploads } from '../hooks/useUploads.js';
import { rules } from '../lib/validators.js';
import { contactApi, ApiError } from '../lib/api.js';
import { OTHER_NEED } from '../data/needs.js';
import { BUDGETS, INDUSTRIES, budgetLabel, fmtDate } from '../data/requests.js';
import RequestCode from '../components/portal/RequestCode.jsx';

/* =============================================================================
 * /bao-gia — Form yêu cầu báo giá 5 bước (Dynamic multi-step form)
 *  1 Dịch vụ · 2 Dự án · 3 Ngân sách & thời gian · 4 Tệp đính kèm · 5 Liên hệ & xác nhận
 *  - Kiểm tra từng bước trước khi sang bước sau; server kiểm tra lại toàn bộ.
 *  - Bản nháp lưu sessionStorage → lỡ tải lại trang không mất dữ liệu.
 *  - Đổi bước → focus vào tiêu đề bước (trình đọc màn hình đọc đúng chỗ).
 * ========================================================================== */

const STEPS = ['Dịch vụ', 'Dự án', 'Ngân sách & thời gian', 'Tệp đính kèm', 'Liên hệ & xác nhận'];
const DRAFT_KEY = 'bh-quote-draft';
const EMPTY = { need: '', company: '', industry: '', message: '', budget: '', deadline: '', fullName: '', phone: '', email: '' };
const today = () => new Date().toISOString().slice(0, 10);

const readDraft = () => {
  try { return JSON.parse(sessionStorage.getItem(DRAFT_KEY) || 'null'); } catch { return null; }
};
const writeDraft = (d) => { try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(d)); } catch { /* bỏ qua */ } };
const clearDraft = () => { try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* bỏ qua */ } };

/** Kiểm tra theo bước → { field: 'lỗi' } */
function validateStep(step, v) {
  const e = {};
  if (step === 0 && !v.need) e.need = 'Vui lòng chọn một dịch vụ';
  if (step === 1) {
    if (v.message.trim().length < 10) e.message = 'Hãy mô tả ngắn nhu cầu của bạn (ít nhất 10 ký tự)';
    if (v.message.length > 2000) e.message = 'Mô tả tối đa 2000 ký tự';
  }
  if (step === 2) {
    if (!v.budget) e.budget = 'Vui lòng chọn khoảng ngân sách';
    if (v.deadline && v.deadline < today()) e.deadline = 'Deadline phải từ hôm nay trở đi';
  }
  if (step === 4) {
    const fn = rules.fullName(v.fullName); if (fn) e.fullName = fn;
    if (!v.phone.trim()) e.phone = 'Vui lòng nhập số điện thoại'; else { const p = rules.phone(v.phone); if (p) e.phone = p; }
    if (v.email.trim()) { const m = rules.email(v.email); if (m) e.email = m; }
  }
  return e;
}

/** Nút chọn dạng viên thuốc (radio thật bên trong) */
function Choice({ name, value, checked, onChange, children }) {
  return (
    <label className={`flex cursor-pointer items-center rounded-full px-5 py-3 text-[15px] font-semibold transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-action ${checked ? 'bg-ink text-ground' : 'bg-ground text-ink hover:bg-ground-3'}`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  );
}

const FieldError = ({ id, children }) =>
  children ? <p id={id} role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-signal"><AlertIcon className="h-4 w-4" /> {children}</p> : null;

/** "profile-card" → "Profile card" (chỉ dùng khi chưa có tên thật của dịch vụ) */
const slugToLabel = (slug) => {
  const words = slug.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
};

export default function QuotePage() {
  const { user } = useAuth();
  const { services, status: svStatus } = useServices();
  const [params] = useSearchParams();
  const draft = useRef(readDraft()).current;

  const [step, setStep] = useState(draft?.step ?? 0);
  const [values, setValues] = useState(() => ({ ...EMPTY, ...draft?.values, ...(params.get('dv') && { need: params.get('dv') }) }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(null);
  const uploads = useUploads(draft?.attachments ?? []);
  const headingRef = useRef(null);
  const firstRender = useRef(true);

  useEffect(() => { document.title = 'Yêu cầu báo giá — Bali Home'; }, []);

  // Thành viên → điền sẵn liên hệ (chỉ ô còn trống)
  useEffect(() => {
    if (!user) return;
    setValues((v) => ({ ...v, fullName: v.fullName || user.fullName || '', phone: v.phone || user.phone || '', email: v.email || user.email || '' }));
  }, [user]);

  // Lưu nháp mỗi khi đổi dữ liệu / bước / tệp đã tải xong
  useEffect(() => { if (!sent) writeDraft({ step, values, attachments: uploads.results }); }, [step, values, uploads.results, sent]);

  // Đổi bước → cuộn lên + focus tiêu đề bước
  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [step, sent]);

  const set = (field) => (e) => {
    const value = e?.target ? e.target.value : e;
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) setErrors((x) => ({ ...x, [field]: undefined }));
  };

  const goNext = () => {
    const e = validateStep(step, values);
    setErrors(e);
    if (Object.keys(e).length) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const goBack = () => { setErrors({}); setStep((s) => Math.max(s - 1, 0)); };

  const submit = async (ev) => {
    ev.preventDefault();
    if (step < STEPS.length - 1) return goNext();
    const e = validateStep(4, values);
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    setFormError('');
    try {
      const { request } = await contactApi.send({
        fullName: values.fullName.trim(),
        phone: values.phone.trim(),
        email: values.email.trim() || undefined,
        company: values.company.trim() || undefined,
        need: values.need,
        industry: values.industry.trim() || undefined,
        budget: values.budget,
        deadline: values.deadline || undefined,
        message: values.message.trim(),
        attachments: uploads.results,
      });
      clearDraft();
      setSent(request);
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) {
        setErrors(err.fields);
        const back = ['need'].some((k) => err.fields[k]) ? 0 : ['message', 'industry', 'company'].some((k) => err.fields[k]) ? 1 : ['budget', 'deadline'].some((k) => err.fields[k]) ? 2 : err.fields.attachments ? 3 : 4;
        setStep(back);
      }
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Đang dùng danh sách dự phòng (chỉ 4 dịch vụ) mà khách đến từ link dịch vụ khác → vẫn hiện đúng lựa chọn của họ
  const isNeedMissing = svStatus === 'fallback' && values.need && values.need !== OTHER_NEED.slug && !services.some((s) => s.slug === values.need);
  const missingNeedOption = isNeedMissing ? [{ slug: values.need, name: slugToLabel(values.need) }] : [];
  const options = [...services, ...missingNeedOption, OTHER_NEED];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main className={`${CONTAINER} pb-24 pt-8 lg:pt-14`}>
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Cột trái: tiêu đề + các bước */}
          <aside className="lg:col-span-4">
            <h1 className="font-display text-title">Yêu cầu báo giá</h1>
            <p className="mt-4 max-w-[38ch] text-ink-2">Năm bước ngắn, khoảng 2 phút. Bali Home liên hệ lại kèm báo giá chi tiết theo từng hạng mục.</p>
            {!sent && (
              <ol className="mt-8 hidden gap-1 lg:grid" aria-label="Các bước">
                {STEPS.map((s, i) => (
                  <li key={s} aria-current={i === step ? 'step' : undefined} className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${i === step ? 'bg-ground-2 font-semibold' : 'text-ink-2'}`}>
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i < step ? 'bg-action text-on-action' : i === step ? 'bg-ink text-ground' : 'bg-ground-3'}`}>
                      {i < step ? <CheckIcon className="h-4 w-4" /> : i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ol>
            )}
          </aside>

          {/* Cột phải: nội dung bước */}
          <section className="lg:col-span-8" aria-live="polite">
            {sent ? (
              <div className="rounded-[2rem] bg-ground-2 p-8 sm:p-12">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-success text-white"><CheckIcon className="h-8 w-8" /></span>
                <h2 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-title outline-none">Đã gửi yêu cầu</h2>
                <p className="mt-4 max-w-[50ch] text-lead">
                  Bali Home sẽ gọi lại số <strong>{values.phone}</strong> để trao đổi và gửi báo giá.
                </p>
                <div className="max-w-md"><RequestCode code={sent.code} /></div>
                <div className="mt-10 flex flex-wrap gap-3">
                  {user ? (
                    <Button as={Link} to={`/tai-khoan/yeu-cau/${sent.id}`} bubble>Theo dõi tiến độ</Button>
                  ) : (
                    <Button as={Link} to="/dang-ky" bubble>Tạo tài khoản để theo dõi</Button>
                  )}
                  <Button as={Link} to="/dich-vu" variant="soft">Xem các dịch vụ khác</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="rounded-[2rem] bg-ground-2 p-6 sm:p-10">
                {/* Thanh tiến trình (mọi kích thước) */}
                <div className="flex items-center justify-between text-sm text-ink-2">
                  <span>Bước {step + 1} / {STEPS.length}</span>
                  <span className="lg:hidden">{STEPS[step]}</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ground-3" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="Tiến trình">
                  <span className="block h-full rounded-full bg-action transition-all duration-500" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
                </div>

                <h2 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-[2rem] leading-tight outline-none sm:text-[2.5rem]">
                  {['Bạn cần dịch vụ nào?', 'Kể về dự án của bạn', 'Ngân sách và thời gian', 'Tài liệu tham khảo', 'Thông tin liên hệ'][step]}
                </h2>
                {formError && <Alert className="mt-6">{formError}</Alert>}

                <div key={step} className="mt-8 animate-rise">
                  {step === 0 && (
                    <fieldset aria-describedby={errors.need ? 'err-need' : undefined}>
                      <legend className="sr-only">Chọn dịch vụ</legend>
                      {svStatus === 'loading' ? (
                        <div className="flex flex-wrap gap-2">{Array.from({ length: 8 }, (_, i) => <span key={i} className="h-12 w-28 animate-pulse rounded-full bg-ground-3" />)}</div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {options.map((s) => (
                            <Choice key={s.slug} name="need" value={s.slug} checked={values.need === s.slug} onChange={() => set('need')(s.slug)}>{s.name}</Choice>
                          ))}
                        </div>
                      )}
                      {values.need && values.need !== OTHER_NEED.slug && (
                        <p className="mt-5 text-ink-2">{services.find((s) => s.slug === values.need)?.tagline}</p>
                      )}
                      <FieldError id="err-need">{errors.need}</FieldError>
                    </fieldset>
                  )}

                  {step === 1 && (
                    <div className="grid gap-6">
                      <Field label="Tên doanh nghiệp / thương hiệu" optional value={values.company} onChange={set('company')} error={errors.company} placeholder="Ví dụ: Quán cà phê Mây" />
                      <fieldset>
                        <legend className="mb-3 text-[15px] font-semibold">Lĩnh vực kinh doanh <span className="font-normal text-ink-2">(không bắt buộc)</span></legend>
                        <div className="flex flex-wrap gap-2">
                          {INDUSTRIES.map((ind) => (
                            <Choice key={ind} name="industry" value={ind} checked={values.industry === ind} onChange={() => set('industry')(ind)}>{ind}</Choice>
                          ))}
                        </div>
                        <Field className="mt-3" label="Hoặc nhập lĩnh vực khác" value={INDUSTRIES.includes(values.industry) ? '' : values.industry} onChange={set('industry')} error={errors.industry} placeholder="Ví dụ: Nông sản sạch" />
                      </fieldset>
                      <TextArea
                        label="Mô tả nhu cầu"
                        rows={5}
                        value={values.message}
                        onChange={set('message')}
                        error={errors.message}
                        hint="Mục tiêu, số lượng, phong cách mong muốn… Có link tài liệu (Google Drive) thì dán vào đây."
                        placeholder="Ví dụ: Cần bộ nhận diện và 500 danh thiếp cho quán cà phê sắp khai trương ở Đà Lạt."
                      />
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid gap-8">
                      <fieldset aria-describedby={errors.budget ? 'err-budget' : undefined}>
                        <legend className="mb-3 text-[15px] font-semibold">Ngân sách dự kiến</legend>
                        <div className="flex flex-wrap gap-2">
                          {BUDGETS.map((b) => (
                            <Choice key={b.value} name="budget" value={b.value} checked={values.budget === b.value} onChange={() => set('budget')(b.value)}>{b.label}</Choice>
                          ))}
                        </div>
                        <FieldError id="err-budget">{errors.budget}</FieldError>
                      </fieldset>
                      <Field label="Deadline mong muốn" type="date" optional min={today()} value={values.deadline} onChange={set('deadline')} error={errors.deadline} hint="Để trống nếu chưa có ngày cụ thể." className="max-w-xs" />
                    </div>
                  )}

                  {step === 3 && (
                    <div>
                      <p className="mb-5 text-ink-2">Logo, ảnh mẫu, brief, file thiết kế cũ… giúp Bali Home báo giá sát hơn. Bước này không bắt buộc.</p>
                      <FileDrop uploads={uploads} />
                    </div>
                  )}

                  {step === 4 && (
                    <div className="grid gap-6">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field label="Họ và tên" icon={UserIcon} autoComplete="name" value={values.fullName} onChange={set('fullName')} error={errors.fullName} />
                        <Field label="Số điện thoại" icon={PhoneIcon} type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set('phone')} error={errors.phone} placeholder="09xx xxx xxx" />
                      </div>
                      <Field label="Email" icon={MailIcon} type="email" autoComplete="email" optional value={values.email} onChange={set('email')} error={errors.email} />
                      <div className="rounded-3xl bg-ground p-5">
                        <p className="font-semibold">Kiểm tra lại yêu cầu</p>
                        <dl className="mt-3 grid gap-2 text-[15px] sm:grid-cols-2">
                          {[
                            ['Dịch vụ', serviceName(values.need, options)],
                            ['Doanh nghiệp', values.company || '—'],
                            ['Lĩnh vực', values.industry || '—'],
                            ['Ngân sách', budgetLabel(values.budget)],
                            ['Deadline', values.deadline ? fmtDate(values.deadline) : '—'],
                            ['Tệp đính kèm', `${uploads.results.length} tệp`],
                          ].map(([k, v]) => (
                            <div key={k}><dt className="text-sm text-ink-2">{k}</dt><dd className="font-semibold">{v}</dd></div>
                          ))}
                        </dl>
                        <button type="button" onClick={() => setStep(0)} className="mt-4 text-sm font-semibold text-action hover:underline">Sửa lại từ đầu</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-10 flex items-center justify-between gap-3">
                  {step > 0 ? (
                    <Button variant="soft" onClick={goBack}><ArrowLeftIcon className="h-4 w-4" /> Quay lại</Button>
                  ) : <span />}
                  <Button type="submit" size="lg" loading={submitting} disabled={step === 3 && uploads.uploading} bubble>
                    {isLast ? 'Gửi yêu cầu' : step === 3 && uploads.uploading ? 'Đang tải tệp…' : 'Tiếp tục'}
                  </Button>
                </div>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
