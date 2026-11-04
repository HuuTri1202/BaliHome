import { Link } from 'react-router-dom';
import { CONTAINER } from './Navbar.jsx';
import { LogoHex } from './BrandMark.jsx';

/* taste-skill: chân trang là một "lời kết" được thiết kế, không phải sitemap — tên thương hiệu trở lại ở bề ngang đầy đủ */
export default function Footer() {
  return (
    <footer className="overflow-hidden bg-ground-2">
      <div className={`${CONTAINER} pt-20 pb-10`}>
        <div className="grid gap-10 md:grid-cols-12">
          <div className="flex items-start gap-4 md:col-span-6">
            <LogoHex className="h-14 w-14 shrink-0" />
            <div>
              <p className="text-lead font-bold">Công ty TNHH Thương mại Dịch vụ Bali Home</p>
              <p className="mt-2 text-ink-2">Sản phẩm và dịch vụ cho ngôi nhà, một đầu mối từ đầu đến cuối.</p>
            </div>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-3 text-[15px] font-semibold md:col-span-6 md:justify-self-end" aria-label="Liên kết cuối trang">
            <a href="/#san-pham" className="hover:text-action">Sản phẩm &amp; dịch vụ</a>
            <a href="/#cach-lam-viec" className="hover:text-action">Cách làm việc</a>
            <a href="/#lien-he" className="hover:text-action">Gửi yêu cầu tư vấn</a>
            <Link to="/tai-khoan" className="hover:text-action">Tài khoản thành viên</Link>
          </nav>
        </div>
      </div>
      {/* Tên thương hiệu ở bề ngang trang — đây là hình, không phải tiêu đề */}
      <p aria-hidden="true" className="select-none whitespace-nowrap text-center text-[15.5vw] font-extrabold leading-[0.78] tracking-[-0.055em] text-action">
        BALI HOME
      </p>
      <div className={`${CONTAINER} flex flex-wrap justify-between gap-3 py-6 text-sm text-ink-2`}>
        <span>© {new Date().getFullYear()} Bali Home. Bảo lưu mọi quyền.</span>
        <span>Thương mại &amp; Dịch vụ</span>
      </div>
    </footer>
  );
}
