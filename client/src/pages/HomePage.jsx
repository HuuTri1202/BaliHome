import { Link } from 'react-router-dom';
import { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import HeroScene from '../components/home/HeroScene.jsx';
import Reveal, { item } from '../components/Reveal.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ArrowRightIcon } from '../components/ui/icons.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useServices } from '../hooks/useServices.js';
import { groupServices } from '../data/needs.js';
import { ServicesSkeleton, ServicesError } from '../components/services/ServiceStates.jsx';

/* =============================================================================
 * Trang chủ Bali Home — hướng "One motif" (taste-skill)
 * Ý tưởng: khung lục giác của logo trở thành hình khối duy nhất của cả trang —
 *   sân khấu cho logo 3D, hình nút bấm, gạch đầu dòng, khung giao diện, dải giá trị.
 * Lập luận (mỗi section = 1 luận điểm):
 *   1. Bali Home lo trọn các việc của một thương hiệu      → hero
 *   2. Tám dịch vụ, một đầu mối (dữ liệu thật từ DB)       → Dịch vụ
 *   3. Quy trình rõ ràng, có duyệt bản nháp                → Cách làm việc
 *   4. Uy tín · Chất lượng · Tận tâm                       → dải giá trị
 *   5. Thành viên theo dõi được yêu cầu của mình           → Thành viên
 *   6. Gửi yêu cầu ngay                                    → Liên hệ
 * ⚠ Các bước làm việc và câu chữ cam kết là NỘI DUNG NHÁP — cần Bali Home xác nhận.
 * ========================================================================== */


const STEPS = [
  ['Lắng nghe', 'Bạn gửi yêu cầu hoặc gọi điện. Bali Home hỏi rõ mục tiêu, khách hàng và ngân sách của bạn.'],
  ['Báo giá và lịch làm', 'Báo giá chia theo từng hạng mục, kèm mốc thời gian giao từng phần. Không phát sinh ngoài thoả thuận.'],
  ['Làm và duyệt bản nháp', 'Bạn xem bản nháp, góp ý; Bali Home chỉnh sửa theo số vòng đã thống nhất.'],
  ['Bàn giao và đồng hành', 'Bàn giao file gốc, tài khoản, hướng dẫn sử dụng. Vẫn hỗ trợ sau khi kết thúc dự án.'],
];

const VALUES = [
  ['Uy tín', 'Báo giá, hợp đồng và tiến độ đều rõ ràng; giao đúng những gì đã hứa.'],
  ['Chất lượng', 'Mỗi sản phẩm được kiểm tra trước khi đến tay bạn: đúng màu, đúng chữ, đúng thông điệp.'],
  ['Tận tâm', 'Coi việc của thương hiệu bạn như việc của mình, cả trước, trong và sau dự án.'],
];

/** Gạch đầu dòng = lục giác nhỏ (motif ở cỡ chữ) */
const HexDot = ({ className = 'bg-action' }) => <span className={`hex hex-ratio mt-[0.45em] w-3 shrink-0 ${className}`} aria-hidden="true" />;

/**
 * Bảng dịch vụ theo nhóm: mỗi nhóm 1 hàng (tên nhóm | các dịch vụ dạng liên kết).
 * Mỗi dịch vụ dẫn tới trang chi tiết /dich-vu/:slug.
 */
function ServiceIndex() {
  const { services, status, error, reload } = useServices();
  if (status === 'loading') return <ServicesSkeleton rows={3} />;
  if (status === 'error') return <ServicesError error={error} onRetry={reload} />;
  return (
    <div className="grid gap-1">
      {groupServices(services).map((g, gi) => (
        <div key={g.id} className={`grid gap-6 rounded-3xl p-7 sm:p-10 lg:grid-cols-12 lg:gap-10 ${gi % 2 ? 'bg-ground-3' : 'bg-ground-2'}`}>
          <div className="lg:col-span-4">
            <h3 className="text-lead font-bold">{g.name}</h3>
            <p className="mt-2 max-w-[32ch] text-ink-2">{g.intro}</p>
          </div>
          <ul className="grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:col-span-8">
            {g.services.map((s) => (
              <li key={s.slug}>
                <Link to={`/dich-vu/${s.slug}`} className="group flex items-start gap-4 py-3">
                  <HexDot />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-[20px] font-bold group-hover:text-action">
                      {s.name}
                      <ArrowRightIcon className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                    </span>
                    <span className="mt-1 block text-ink-2">{s.tagline}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="flex justify-end pt-6">
        <Button as={Link} to="/dich-vu" variant="soft">
          Xem chi tiết tất cả dịch vụ <ArrowRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/* Mảnh giao diện tài khoản thật (data-ui) — minh hoạ trang "Yêu cầu tư vấn" của thành viên */
function RequestsFragment() {
  const rows = [
    ['Design', 'Hôm nay', 'Đã nhận', 'bg-ground-3 text-ink'],
    ['In ấn', '28/10', 'Đã liên hệ', 'bg-[color-mix(in_srgb,var(--action)_16%,var(--ground))] text-action'],
    ['Web', '12/10', 'Hoàn tất', 'bg-[color-mix(in_srgb,var(--success)_16%,var(--ground))] text-success'],
  ];
  return (
    <div data-ui role="img" aria-label="Minh hoạ: danh sách yêu cầu tư vấn và trạng thái trong tài khoản thành viên" className="w-[82%] bg-ground p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-bold">Yêu cầu tư vấn của bạn</p>
        <p className="text-sm text-ink-2">3 yêu cầu</p>
      </div>
      <ul className="mt-4 grid gap-2">
        {rows.map(([need, date, status, tone]) => (
          <li key={need} className="flex items-center justify-between gap-3 bg-ground-2 px-4 py-3">
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-semibold">{need}</span>
              <span className="block text-sm text-ink-2">{date}</span>
            </span>
            <span className={`shrink-0 px-2.5 py-1 text-sm font-semibold ${tone}`}>{status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-dvh overflow-x-clip bg-ground">
      <main>
        {/* ================= 1. HERO (khung cảnh + menu kính + logo 3D + 3 thẻ nổi) ================= */}
        <HeroScene />

        {/* ================= 2. DỊCH VỤ (dữ liệu thật từ /api/services) ================= */}
        <section id="dich-vu" aria-labelledby="dich-vu-title" className="py-24 lg:py-28">
          <Reveal className={CONTAINER}>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="dich-vu-title" {...item(0, 'font-display text-title font-normal lg:col-span-7')}>
                Tám dịch vụ, một đầu mối
              </h2>
              <p {...item(1, 'max-w-[40ch] text-lead text-ink lg:col-span-5')}>
                Không phải tìm năm nơi cho năm việc. Từ bản thiết kế đầu tiên đến đơn hàng đầu tiên, Bali Home làm cùng bạn.
              </p>
            </div>
            <div {...item(2, 'mt-16')}>
              <ServiceIndex />
            </div>
          </Reveal>
        </section>

        {/* ================= 3. CÁCH LÀM VIỆC ================= */}
        <section id="cach-lam-viec" aria-labelledby="cach-lam-viec-title" className="pb-24 lg:pb-28">
          <Reveal className={`${CONTAINER} grid gap-12 lg:grid-cols-12`}>
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <h2 id="cach-lam-viec-title" {...item(0, 'font-display text-title font-normal')}>
                  Làm việc với Bali Home
                </h2>
                <p {...item(1, 'mt-6 max-w-[34ch] text-lead text-ink')}>
                  Bốn bước, một người phụ trách theo bạn từ cuộc gọi đầu tiên đến khi bàn giao xong.
                </p>
              </div>
            </div>
            <ol className="grid gap-4 lg:col-span-7">
              {STEPS.map(([title, text], i) => (
                <li key={title} {...item(2 + i, 'flex gap-6 rounded-3xl bg-ground-2 p-7 sm:p-9')}>
                  {/* thứ tự thể hiện bằng lục giác lớn dần, không dùng số 01/02 */}
                  <span className="hex hex-ratio mt-1 shrink-0 bg-action" style={{ width: `${1.1 + i * 0.35}rem` }} aria-hidden="true" />
                  <span>
                    <span className="block text-lead font-bold">{title}</span>
                    <span className="mt-2 block max-w-[52ch] text-ink">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Reveal>
        </section>

        {/* ================= 4. DẢI GIÁ TRỊ (mảng navy, 2 đầu vát theo motif) ================= */}
        <section aria-labelledby="gia-tri-title" className="px-0 sm:px-4 lg:px-6">
          <Reveal className="rounded-[2rem] bg-motif text-on-motif lg:rounded-[2.5rem]">
            <div className={`${CONTAINER} py-24 lg:py-36`}>
              <h2 id="gia-tri-title" {...item(0, 'font-display text-title font-normal')}>
                Uy tín, chất lượng, tận tâm
              </h2>
              <div className="mt-16 grid gap-12 md:grid-cols-3 md:gap-10">
                {VALUES.map(([title, text], i) => (
                  <div key={title} {...item(1 + i)}>
                    <span className="hex hex-ratio block w-10 bg-accent-500" aria-hidden="true" />
                    <h3 className="mt-6 text-lead font-bold">{title}</h3>
                    <p className="mt-3 max-w-[34ch] text-on-motif-2">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ================= 5. THÀNH VIÊN ================= */}
        <section id="thanh-vien" aria-labelledby="thanh-vien-title" className="py-24 lg:py-28">
          <Reveal className={`${CONTAINER} grid items-center gap-14 lg:grid-cols-12`}>
            <div className="lg:col-span-6">
              <h2 id="thanh-vien-title" {...item(0, 'font-display text-title font-normal')}>
                Theo dõi mọi yêu cầu
              </h2>
              <p {...item(1, 'mt-6 max-w-[38ch] text-lead text-ink')}>
                Tạo tài khoản thành viên miễn phí. Mỗi yêu cầu bạn gửi khi đã đăng nhập được lưu lại, kèm trạng thái xử lý.
              </p>
              <ul {...item(2, 'mt-10 grid gap-4')}>
                {['Không phải đọc lại số điện thoại, địa chỉ mỗi lần gọi.', 'Biết yêu cầu nào đã có người liên hệ, cái nào đã xong.', 'Đổi giao diện sáng hoặc tối theo ý bạn.'].map((t) => (
                  <li key={t} className="flex gap-3">
                    <HexDot />
                    {t}
                  </li>
                ))}
              </ul>
              <div {...item(3, 'mt-10')}>
                <Button as={Link} to={user ? '/tai-khoan' : '/dang-ky'} variant="dark" size="lg">
                  {user ? 'Mở tài khoản của tôi' : 'Tạo tài khoản'}
                </Button>
              </div>
            </div>
            <div {...item(2, 'lg:col-span-6')}>
              <div className="hex hex-ratio mx-auto grid w-full max-w-[560px] place-items-center bg-ground-2">
                <RequestsFragment />
              </div>
            </div>
          </Reveal>
        </section>

        {/* ================= 6. LIÊN HỆ ================= */}
        <div className="bg-ground">
          <ContactSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
