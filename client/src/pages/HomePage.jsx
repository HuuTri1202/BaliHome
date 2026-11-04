import { Link } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import LogoCanvas from '../components/LazyLogoCanvas.jsx';
import Reveal, { item } from '../components/Reveal.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import { Button } from '../components/ui/Button.jsx';
import { ArrowRightIcon } from '../components/ui/icons.jsx';
import { THEMES } from '../data/themes.js';
import { useAuth } from '../context/AuthContext.jsx';

/* =============================================================================
 * Trang chủ Bali Home — hướng "One motif" (taste-skill)
 * Ý tưởng: khung lục giác của logo trở thành hình khối duy nhất của cả trang —
 *   sân khấu cho logo 3D, hình nút bấm, gạch đầu dòng, khung giao diện, dải giá trị.
 * Lập luận (mỗi section = 1 luận điểm):
 *   1. Bali Home là một đầu mối cho cả ngôi nhà            → hero
 *   2. Mua và làm ở cùng một nơi                           → Sản phẩm & dịch vụ
 *   3. Quy trình rõ ràng, có trách nhiệm đến cuối          → Cách làm việc
 *   4. Uy tín · Chất lượng · Tận tâm                       → dải giá trị
 *   5. Thành viên theo dõi được yêu cầu của mình           → Thành viên
 *   6. Gửi yêu cầu ngay                                    → Liên hệ
 * ⚠ Danh mục sản phẩm/dịch vụ và các bước là NỘI DUNG MẪU — cần Bali Home xác nhận.
 * ========================================================================== */

const logoTheme = THEMES[0]; // màu nhận diện xanh – đỏ nguyên bản cho logo 3D

const OFFER = [
  {
    title: 'Thương mại',
    lead: 'Chọn và cung cấp sản phẩm cho nhà ở, đúng nhu cầu và ngân sách của bạn.',
    items: [
      ['Thiết bị gia dụng, điện máy', 'Bếp, máy lọc nước, máy nước nóng, điều hoà.'],
      ['Thiết bị vệ sinh và nhà bếp', 'Sen vòi, lavabo, bồn cầu, chậu rửa, phụ kiện.'],
      ['Vật tư hoàn thiện', 'Đèn, công tắc, ổ cắm, sơn và vật tư điện nước.'],
      ['Nội thất', 'Tủ, kệ, bàn ghế cho phòng khách, phòng ngủ, bếp.'],
    ],
  },
  {
    title: 'Dịch vụ',
    lead: 'Kỹ thuật viên của Bali Home đến tận nơi, làm xong, kiểm tra cùng bạn rồi mới bàn giao.',
    items: [
      ['Lắp đặt', 'Lắp mới thiết bị đã mua tại Bali Home hoặc nơi khác.'],
      ['Bảo trì định kỳ', 'Vệ sinh, kiểm tra điều hoà, máy lọc nước, máy nước nóng.'],
      ['Sửa chữa điện, nước', 'Xử lý rò rỉ, chập điện, thay thế linh kiện hỏng.'],
      ['Tư vấn cải tạo', 'Khảo sát, đề xuất phương án và dự toán cho căn nhà.'],
    ],
  },
];

const STEPS = [
  ['Lắng nghe nhu cầu', 'Bạn gửi yêu cầu hoặc gọi điện. Bali Home gọi lại để hỏi rõ hiện trạng và mong muốn.'],
  ['Báo giá rõ ràng', 'Báo giá chia theo từng hạng mục: sản phẩm, công lắp đặt, vật tư. Không phát sinh ngoài thoả thuận.'],
  ['Làm đúng hẹn', 'Giao hàng và thi công theo lịch đã chốt. Xong việc, kiểm tra cùng bạn rồi mới bàn giao.'],
  ['Bảo hành tận nơi', 'Có trục trặc trong thời gian bảo hành, kỹ thuật viên quay lại xử lý tại nhà.'],
];

const VALUES = [
  ['Uy tín', 'Báo giá, hợp đồng và phiếu bảo hành đều rõ ràng, có giấy tờ cho từng việc.'],
  ['Chất lượng', 'Sản phẩm có nguồn gốc rõ ràng; lắp đặt đúng hướng dẫn kỹ thuật của nhà sản xuất.'],
  ['Tận tâm', 'Đồng hành cùng gia đình bạn cả trước, trong và sau khi bán hàng.'],
];

/** Gạch đầu dòng = lục giác nhỏ (motif ở cỡ chữ) */
const HexDot = ({ className = 'bg-action' }) => <span className={`hex hex-ratio mt-[0.45em] w-3 shrink-0 ${className}`} aria-hidden="true" />;

/* Mảnh giao diện tài khoản thật (data-ui) — minh hoạ trang "Yêu cầu tư vấn" của thành viên */
function RequestsFragment() {
  const rows = [
    ['Lắp đặt', 'Hôm nay', 'Đã nhận', 'bg-ground-3 text-ink'],
    ['Bảo trì, sửa chữa', '28/10', 'Đã liên hệ', 'bg-[color-mix(in_srgb,var(--action)_16%,var(--ground))] text-action'],
    ['Mua sản phẩm', '12/10', 'Hoàn tất', 'bg-[color-mix(in_srgb,var(--success)_16%,var(--ground))] text-success'],
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
      <Navbar />

      <main>
        {/* ================= 1. HERO ================= */}
        <section aria-labelledby="hero-title" className="relative overflow-hidden">
          <div className={`${CONTAINER} grid min-h-[calc(100svh-5rem)] items-center gap-6 pb-12 lg:grid-cols-12 lg:pb-0`}>
            <div className="relative z-10 pt-10 lg:col-span-6 lg:py-24">
              <h1 id="hero-title" className="animate-rise text-display font-extrabold">
                Trọn gói cho ngôi nhà
              </h1>
              <p className="mt-8 max-w-[34ch] animate-rise text-lead text-ink [animation-delay:90ms]">
                Bali Home cung cấp sản phẩm cho nhà ở và nhận lắp đặt, bảo trì tận nơi. Một đầu mối, chịu trách nhiệm từ đầu đến cuối.
              </p>
              <div className="mt-10 flex animate-rise flex-wrap items-center gap-x-7 gap-y-4 [animation-delay:180ms]">
                <Button as="a" href="#lien-he" size="lg">
                  Gửi yêu cầu tư vấn <ArrowRightIcon className="h-5 w-5" />
                </Button>
                <Link
                  to={user ? '/tai-khoan' : '/dang-ky'}
                  className="group inline-flex items-center gap-2 py-2 text-[17px] font-semibold text-action"
                >
                  {user ? 'Tài khoản của tôi' : 'Tạo tài khoản thành viên'}
                  <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Lục giác khổng lồ = sân khấu cho logo 3D (thứ "sống" duy nhất của trang: kéo để xoay) */}
            <div className="relative mx-auto w-[88vw] max-w-[540px] lg:absolute lg:top-1/2 lg:right-[-3vw] lg:w-[min(44vw,calc((100svh-6rem)*0.866))] lg:max-w-[760px] lg:-translate-y-1/2">
              <div className="hex hex-ratio hex-hero relative w-full bg-motif">
                <LogoCanvas theme={logoTheme} className="absolute left-[6%] top-[20%] h-[60%] w-[80%] lg:left-[4%]" />
              </div>
              <p className="mt-3 text-center text-sm text-ink-2 lg:hidden">Chạm và kéo để xoay logo</p>
            </div>
          </div>
        </section>

        {/* ================= 2. SẢN PHẨM & DỊCH VỤ ================= */}
        <section id="san-pham" aria-labelledby="san-pham-title" className="py-24 lg:py-28">
          <Reveal className={CONTAINER}>
            <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
              <h2 id="san-pham-title" {...item(0, 'text-title font-extrabold lg:col-span-7')}>
                Mua và làm, cùng một nơi
              </h2>
              <p {...item(1, 'max-w-[40ch] text-lead text-ink lg:col-span-5')}>
                Bạn không phải mua một nơi rồi đi tìm thợ ở nơi khác. Bali Home lo cả sản phẩm lẫn công lắp đặt, bảo trì.
              </p>
            </div>
            <div className="mt-16 grid lg:grid-cols-2">
              {OFFER.map((o, i) => (
                <article key={o.title} {...item(2 + i, `${i ? 'bg-ground-3' : 'bg-ground-2'} p-7 sm:p-10 lg:p-14`)}>
                  <h3 className="text-lead font-bold">{o.title}</h3>
                  <p className="mt-3 max-w-[44ch] text-ink-2">{o.lead}</p>
                  <ul className="mt-10 grid gap-7">
                    {o.items.map(([name, desc]) => (
                      <li key={name} className="flex gap-4">
                        <HexDot />
                        <span>
                          <span className="block text-[18px] font-semibold">{name}</span>
                          <span className="mt-1 block text-ink-2">{desc}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </Reveal>
        </section>

        {/* ================= 3. CÁCH LÀM VIỆC ================= */}
        <section id="cach-lam-viec" aria-labelledby="cach-lam-viec-title" className="pb-24 lg:pb-28">
          <Reveal className={`${CONTAINER} grid gap-12 lg:grid-cols-12`}>
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-32">
                <h2 id="cach-lam-viec-title" {...item(0, 'text-title font-extrabold')}>
                  Làm việc với Bali Home
                </h2>
                <p {...item(1, 'mt-6 max-w-[34ch] text-lead text-ink')}>
                  Bốn bước, một người phụ trách theo bạn từ cuộc gọi đầu tiên đến khi hết bảo hành.
                </p>
              </div>
            </div>
            <ol className="grid gap-4 lg:col-span-7">
              {STEPS.map(([title, text], i) => (
                <li key={title} {...item(2 + i, 'flex gap-6 bg-ground-2 p-7 sm:p-9')}>
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
          <Reveal className="hex-band bg-motif text-on-motif [--notch:1.75rem] sm:[--notch:3rem] lg:[--notch:5rem]">
            <div className={`${CONTAINER} py-24 lg:py-36`}>
              <h2 id="gia-tri-title" {...item(0, 'text-title font-extrabold')}>
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
              <h2 id="thanh-vien-title" {...item(0, 'text-title font-extrabold')}>
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
