import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';

export default function NotFoundPage() {
  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main className={`${CONTAINER} grid min-h-[calc(100dvh-5rem)] items-center gap-12 py-16 lg:grid-cols-12`}>
        <div className="lg:col-span-6">
          <h1 className="text-display font-extrabold">Không tìm thấy trang</h1>
          <p className="mt-6 max-w-[38ch] text-lead">Đường dẫn có thể đã thay đổi hoặc không tồn tại. Hãy quay về trang chủ.</p>
          <Button as={Link} to="/" size="lg" className="mt-10">Về trang chủ</Button>
        </div>
        {/* motif: lục giác lớn mang mã lỗi */}
        <div className="hex hex-ratio mx-auto grid w-[min(80vw,420px)] place-items-center bg-motif lg:col-span-6" aria-hidden="true">
          <span className="text-[7rem] font-extrabold tracking-[-0.05em] text-on-motif">404</span>
        </div>
      </main>
    </div>
  );
}
