import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import BrandMark from '../components/BrandMark.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function NotFoundPage() {
  return (
    <div className="relative grid min-h-dvh place-items-center bg-gradient-to-b from-brand-50 to-white px-4 text-center dark:from-brand-950/60 dark:to-[#050a18]">
      <ThemeToggle className="absolute right-4 top-5 sm:right-8" />
      <div className="animate-rise">
        <BrandMark />
        <p className="mt-10 text-7xl font-black tracking-tight text-brand-500 dark:text-brand-400">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Không tìm thấy trang</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Đường dẫn có thể đã thay đổi hoặc không tồn tại.</p>
        <Button as={Link} to="/" className="mt-8">Về trang chủ</Button>
      </div>
    </div>
  );
}
