import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import LogoCanvas from '../components/LazyLogoCanvas.jsx';
import { Button } from '../components/ui/Button.jsx';
import { THEMES } from '../data/themes.js';
import { useAuth } from '../context/AuthContext.jsx';

// Logo dùng màu nhận diện nguyên bản (xanh - đỏ). Muốn đổi: chọn phần tử khác trong THEMES.
const theme = THEMES[0];

export default function HomePage() {
  const { user } = useAuth();
  const accentStyle = { backgroundColor: theme.ui };

  return (
    <div
      className="theme-bg min-h-dvh overflow-x-hidden"
      style={{ '--c1': theme.bg[0], '--c2': theme.bg[1], '--c3': theme.bg[2] }}
    >
      <Navbar accent={theme.ui} />

      <main className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 pb-10 sm:px-8 lg:grid-cols-[1fr_1.35fr_1fr] lg:gap-4">
        {/* Cột trái */}
        <section className="order-1 animate-rise text-center lg:text-left" id="gioi-thieu">
          <p className="text-xs font-bold uppercase tracking-[.25em]" style={{ color: theme.ui }}>
            Thương mại · Dịch vụ
          </p>
          <h1 className="mt-3 text-5xl font-black leading-[1.02] tracking-tight text-slate-900 sm:text-6xl">
            BALI <span style={{ color: theme.ui }}>HOME</span>
          </h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-wide text-slate-500">Công ty TNHH Thương mại Dịch vụ Bali Home</p>
          <p className="mx-auto mt-4 max-w-sm text-[15px] leading-relaxed text-slate-600 lg:mx-0">
            Uy tín, chất lượng và tận tâm: Bali Home đồng hành cùng khách hàng trong từng sản phẩm và dịch vụ.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3 lg:justify-start">
            {user ? (
              <Button as={Link} to="/tai-khoan" size="lg" className="rounded-full" style={accentStyle}>Tài khoản của tôi</Button>
            ) : (
              <Button as={Link} to="/dang-ky" size="lg" className="rounded-full" style={accentStyle}>Trở thành thành viên</Button>
            )}
            <Button as="a" href="#dich-vu" variant="outline" size="lg" className="rounded-full">Khám phá</Button>
          </div>
        </section>

        {/* Cột giữa: logo 3D */}
        <section className="relative order-2 h-[420px] sm:h-[520px] lg:h-[calc(100dvh-160px)] lg:min-h-[520px]">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden="true">
            <span className="outline-word select-none whitespace-nowrap text-[24vw] font-black uppercase leading-none lg:text-[14vw]">Bali</span>
          </div>
          <LogoCanvas theme={theme} />
          <p className="pointer-events-none absolute bottom-2 left-0 right-0 text-center text-xs font-medium text-slate-500">
            Rê chuột hoặc kéo để xoay logo
          </p>
        </section>

        {/* Cột phải */}
        <aside className="order-3" id="dich-vu">
          <div className="mx-auto max-w-sm rounded-3xl border border-white/70 bg-white/55 p-6 shadow-xl shadow-slate-900/5 backdrop-blur-md">
            <h2 className="text-sm font-bold uppercase tracking-[.18em] text-slate-500">Giá trị cốt lõi</h2>
            <ul className="mt-4 space-y-4">
              {[
                ['Uy tín', 'Cam kết minh bạch trong từng giao dịch.'],
                ['Chất lượng', 'Sản phẩm và dịch vụ được kiểm soát chặt chẽ.'],
                ['Tận tâm', 'Đồng hành cùng khách hàng trước và sau bán.'],
              ].map(([title, text]) => (
                <li key={title} className="flex gap-3">
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rotate-45" style={{ backgroundColor: theme.secondary }} />
                  <div>
                    <div className="text-[15px] font-bold text-slate-800">{title}</div>
                    <div className="text-sm text-slate-500">{text}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Button as="a" href="#lien-he" size="lg" className="mt-6 w-full" style={accentStyle}>Nhận tư vấn</Button>
          </div>
        </aside>
      </main>
    </div>
  );
}
