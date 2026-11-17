import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Reveal, { item } from '../components/Reveal.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import CoreServices from '../components/home/CoreServices.jsx';
import FactsBar from '../components/home/FactsBar.jsx';
import FeaturedProjects from '../components/home/FeaturedProjects.jsx';
import HeroScene from '../components/home/HeroScene.jsx';
import ProcessStepper from '../components/home/ProcessStepper.jsx';
import SectionHeading from '../components/home/SectionHeading.jsx';
import { SECTION_Y } from '../components/home/sectionSpacing.js';
import { Button } from '../components/ui/Button.jsx';
import { CheckIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';

/* =============================================================================
 * Trang chủ Bali Home: ít chữ, trực quan. Mỗi section = 1 thông điệp + 1 hành động.
 * Hero → Dịch vụ (4 card) → Quy trình (stepper) → Dải CTA → Thành viên (chỉ khách chưa đăng nhập) → Form liên hệ.
 * 6 bước làm việc: nội dung Bali Home cung cấp (12/11/2026). ⚠ Câu chữ cam kết khác vẫn là NỘI DUNG NHÁP.
 * ========================================================================== */
const PAGE_TITLE = 'Bali Home | Thiết kế, In ấn, Website và Marketing cho doanh nghiệp';
const MEMBER_BENEFITS = ['Lưu thông tin', 'Xem trạng thái', 'Miễn phí'];

/** Quầng sáng tím/xanh/vàng mờ sau nội dung, tạo chiều sâu cho nền tối (chỉ trang trí) */
function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <span className="absolute left-[-10%] top-[110vh] h-[520px] w-[520px] rounded-full bg-violet-600/20 blur-[120px]" />
      <span className="absolute right-[-12%] top-[180vh] h-[560px] w-[560px] rounded-full bg-indigo-500/15 blur-[130px]" />
      <span className="absolute left-[20%] top-[300vh] h-[480px] w-[480px] rounded-full bg-amber-400/10 blur-[120px]" />
    </div>
  );
}

function ProcessSection() {
  return (
    <section id="cach-lam-viec" aria-labelledby="cach-lam-viec-title" className="pb-28 lg:pb-44">
      <Reveal className={CONTAINER}>
        <SectionHeading id="cach-lam-viec-title" eyebrow="Cách làm việc" title="Sáu bước," accent="một người phụ trách." />
        <div {...item(2, 'mt-16 lg:mt-20')}>
          <ProcessStepper />
        </div>
      </Reveal>
    </section>
  );
}

/** Dải giá trị trên nền hoàng hôn (gradient CSS, không ảnh) */
function ValuesBand() {
  return (
    <section aria-labelledby="gia-tri-title" className="px-2 sm:px-4 lg:px-6">
      <Reveal className="relative isolate overflow-hidden rounded-[2rem] ring-1 ring-white/10 lg:rounded-[2.5rem]">
        <div
          className="absolute inset-0 -z-10 bg-[radial-gradient(55%_90%_at_50%_120%,rgb(255_200_138/0.75),rgb(229_143_143/0.35)_40%,transparent_75%),linear-gradient(180deg,#120d33_0%,#3b2a7a_55%,#8c5bb8_100%)]"
          aria-hidden="true"
        />
        <div className={`${CONTAINER} flex flex-col items-center py-24 text-center lg:py-32`}>
          <p {...item(0, 'glass-card inline-flex rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-2')}>Cam kết của Bali Home</p>
          <h2 id="gia-tri-title" {...item(1, 'mt-6 text-balance font-display text-title text-white')}>
            Uy tín, chất lượng, <span className="text-gradient-violet">tận tâm.</span>
          </h2>
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
    <div data-ui role="img" aria-label="Minh hoạ: danh sách yêu cầu và trạng thái trong tài khoản thành viên" className="w-[82%] rounded-2xl bg-ground/80 p-5 ring-1 ring-white/10 sm:p-7">
      <ul className="grid gap-2">
        {rows.map(([need, status, tone]) => (
          <li key={need} className="flex items-center justify-between gap-3 rounded-xl bg-ground-2 px-4 py-3">
            <span className="truncate text-[15px] font-semibold">{need}</span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-sm font-semibold ${tone}`}>{status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Mời khách tạo tài khoản. Chỉ dành cho khách chưa đăng nhập (người đã có tài khoản vào qua avatar trên Header). */
function MembersSection() {
  return (
    // Chỉ đệm dưới: luôn đứng ngay sau mục Dự án (đã có đệm dưới), tránh khoảng trống gấp đôi
    <section id="thanh-vien" aria-labelledby="thanh-vien-title" className="pb-28 lg:pb-44">
      <Reveal className={`${CONTAINER} grid items-center gap-16 lg:grid-cols-12`}>
        <div className="lg:col-span-6">
          <SectionHeading id="thanh-vien-title" eyebrow="Tài khoản thành viên" title="Theo dõi" accent="mọi yêu cầu." />
          <ul {...item(2, 'mt-10 flex flex-wrap gap-2')}>
            {MEMBER_BENEFITS.map((benefit) => (
              <li key={benefit} className="glass-card inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white">
                <CheckIcon className="h-4 w-4 text-success" /> {benefit}
              </li>
            ))}
          </ul>
          <div {...item(3, 'mt-12')}>
            <Button as={Link} to="/dang-ky" variant="dark" size="lg" bubble>Tạo tài khoản</Button>
          </div>
        </div>
        <div {...item(3, 'lg:col-span-6')}>
          <div className="glass-card mx-auto grid aspect-[4/3] w-full max-w-[560px] place-items-center rounded-[1.75rem]">
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
    // Trang chủ luôn tối kiểu "cinematic": cinematic + dark đổi toàn bộ token màu (kể cả Header, Footer bên trong)
    <div className="cinematic dark relative isolate min-h-dvh overflow-x-clip bg-ground text-ink">
      <AmbientGlow />
      <Navbar />
      <main>
        <HeroScene />
        <FactsBar />
        <CoreServices />
        <ProcessSection />
        <ValuesBand />
        <FeaturedProjects />
        {status === 'guest' && <MembersSection />}
        <ContactSection
          isClosing
          isCinematic
          title="Sẵn sàng nâng tầm thương hiệu?"
          intro="Để lại thông tin, Bali Home gọi lại tư vấn và gửi báo giá trọn gói."
          submitLabel="Nhận tư vấn & Báo giá trọn gói"
        />
      </main>
      <Footer />
    </div>
  );
}
