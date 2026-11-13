import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal, { item } from '../components/Reveal.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import CoreServices from '../components/home/CoreServices.jsx';
import HeroScene from '../components/home/HeroScene.jsx';
import ProcessStepper from '../components/home/ProcessStepper.jsx';
import { SECTION_Y } from '../components/home/sectionSpacing.js';
import { Button } from '../components/ui/Button.jsx';
import { CheckIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/* =============================================================================
 * Trang chủ Bali Home: ít chữ, trực quan. Mỗi section = 1 thông điệp + 1 hành động.
 * Hero → Dịch vụ (4 card) → Quy trình (stepper) → Dải CTA → Thành viên (chỉ khách chưa đăng nhập) → Form liên hệ.
 * ⚠ Các bước làm việc và câu chữ cam kết là NỘI DUNG NHÁP, cần Bali Home xác nhận.
 * ========================================================================== */
const PAGE_TITLE = 'Bali Home | Thiết kế, In ấn, Website và Marketing cho doanh nghiệp';
const MEMBER_BENEFITS = ['Lưu thông tin', 'Xem trạng thái', 'Miễn phí'];

function ProcessSection() {
  return (
    <section id="cach-lam-viec" aria-labelledby="cach-lam-viec-title" className="pb-28 lg:pb-44">
      <Reveal className={CONTAINER}>
        <h2 id="cach-lam-viec-title" {...item(0, 'font-display text-title')}>Bốn bước, một người phụ trách</h2>
        <div {...item(1, 'mt-20')}>
          <ProcessStepper />
        </div>
      </Reveal>
    </section>
  );
}

function ValuesBand() {
  return (
    <section aria-labelledby="gia-tri-title" className="px-2 sm:px-4 lg:px-6">
      <Reveal className="rounded-[2rem] bg-motif text-on-motif lg:rounded-[2.5rem]">
        <div className={`${CONTAINER} py-24 lg:py-32`}>
          <h2 id="gia-tri-title" {...item(0, 'font-display text-title')}>Uy tín, chất lượng, tận tâm</h2>
        </div>
      </Reveal>
    </section>
  );
}

/* Mảnh giao diện tài khoản thật (data-ui): minh hoạ trang "Yêu cầu tư vấn" của thành viên */
function RequestsFragment() {
  const rows = [
    ['Design', 'Đã nhận', 'bg-ground-3 text-ink'],
    ['In ấn', 'Đã liên hệ', 'bg-[color-mix(in_srgb,var(--action)_16%,var(--ground))] text-action'],
    ['Web', 'Hoàn tất', 'bg-[color-mix(in_srgb,var(--success)_16%,var(--ground))] text-success'],
  ];
  return (
    <div data-ui role="img" aria-label="Minh hoạ: danh sách yêu cầu và trạng thái trong tài khoản thành viên" className="w-[82%] bg-ground p-5 sm:p-7">
      <ul className="grid gap-2">
        {rows.map(([need, status, tone]) => (
          <li key={need} className="flex items-center justify-between gap-3 bg-ground-2 px-4 py-3">
            <span className="truncate text-[15px] font-semibold">{need}</span>
            <span className={`shrink-0 px-2.5 py-1 text-sm font-semibold ${tone}`}>{status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mời khách tạo tài khoản. Chỉ dành cho khách chưa đăng nhập (người đã có tài khoản vào qua avatar trên Header). */
function MembersSection() {
  return (
    <section id="thanh-vien" aria-labelledby="thanh-vien-title" className={SECTION_Y}>
      <Reveal className={`${CONTAINER} grid items-center gap-16 lg:grid-cols-12`}>
        <div className="lg:col-span-6">
          <h2 id="thanh-vien-title" {...item(0, 'font-display text-title')}>Theo dõi mọi yêu cầu</h2>
          <ul {...item(1, 'mt-10 flex flex-wrap gap-2')}>
            {MEMBER_BENEFITS.map((benefit) => (
              <li key={benefit} className="inline-flex items-center gap-2 rounded-full bg-ground-2 px-4 py-2 text-sm font-semibold">
                <CheckIcon className="h-4 w-4 text-success" /> {benefit}
              </li>
            ))}
          </ul>
          <div {...item(2, 'mt-12')}>
            <Button as={Link} to="/dang-ky" variant="dark" size="lg">Tạo tài khoản</Button>
          </div>
        </div>
        <div {...item(2, 'lg:col-span-6')}>
          <div className="hex hex-ratio mx-auto grid w-full max-w-[560px] place-items-center bg-ground-2">
            <RequestsFragment />
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function HomePage() {
  // Chỉ hiện lời mời tạo tài khoản khi đã chắc là khách (không hiện rồi biến mất với người đã đăng nhập)
  const { status } = useAuth();

  useEffect(() => { document.title = PAGE_TITLE; }, []);

  return (
    <div className="min-h-dvh overflow-x-clip bg-ground">
      <Navbar />
      <main>
        <HeroScene />
        <CoreServices />
        <ProcessSection />
        <ValuesBand />
        {status === 'guest' && <MembersSection />}
        <ContactSection
          isClosing
          title="Sẵn sàng nâng tầm thương hiệu?"
          intro="Để lại thông tin, Bali Home gọi lại tư vấn và gửi báo giá trọn gói."
          submitLabel="Nhận tư vấn & Báo giá trọn gói"
        />
      </main>
      <Footer />
    </div>
  );
}
