import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import BrandMark from '../components/BrandMark.jsx';

export default function NotFoundPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-gradient-to-b from-brand-50 to-white px-4 text-center">
      <div className="animate-rise">
        <BrandMark />
        <p className="mt-10 text-7xl font-black tracking-tight text-brand-500">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Không tìm thấy trang</h1>
        <p className="mt-2 text-slate-500">Đường dẫn có thể đã thay đổi hoặc không tồn tại.</p>
        <Button as={Link} to="/" className="mt-8">Về trang chủ</Button>
      </div>
    </div>
  );
}
