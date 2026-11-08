import { Link } from 'react-router-dom';
import { Button } from '../ui/Button.jsx';

const Bar = ({ className }) => <div className={`animate-pulse rounded-full bg-ground-3 ${className}`} />;

/** Khung chờ dạng khối (trang chi tiết dịch vụ) */
export function ServicesSkeleton({ rows = 4 }) {
  return (
    <div className="grid gap-1" role="status" aria-label="Đang tải dịch vụ">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-3xl bg-ground-2" />
      ))}
    </div>
  );
}

/** Khung chờ đúng bố cục ServiceExplorer (danh sách + bảng mô tả) → dữ liệu về không làm nhảy trang */
export function ServiceExplorerSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr] lg:gap-6 xl:grid-cols-[340px_1fr]" role="status" aria-label="Đang tải dịch vụ">
      <div className="flex gap-2 overflow-hidden lg:flex-col lg:rounded-[2rem] lg:bg-ground-2 lg:p-5">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="shrink-0 lg:py-3">
            <Bar className="h-11 w-28 lg:h-4 lg:w-24" />
            <Bar className="mt-2 hidden h-3 w-48 lg:block" />
          </div>
        ))}
      </div>
      <div className="rounded-[2rem] bg-ground-2 p-6 sm:p-8 lg:p-10" aria-hidden="true">
        <Bar className="h-3 w-32" />
        <Bar className="mt-5 h-12 w-56" />
        <Bar className="mt-6 h-5 w-full max-w-md" />
        <Bar className="mt-4 h-4 w-full max-w-2xl" />
        <Bar className="mt-3 h-4 w-4/5 max-w-xl" />
        <div className="mt-10 grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => <Bar key={i} className="h-5 w-11/12" />)}
        </div>
      </div>
    </div>
  );
}

/**
 * Dịch vụ không có trong danh sách dự phòng và API chưa phản hồi.
 * Không kết luận "không tìm thấy" vì chưa biết chắc; đưa khách sang việc làm được ngay.
 */
export function ServiceTemporarilyUnavailable() {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl bg-ground-2 p-8">
      <h1 className="text-lead font-bold">Thông tin dịch vụ này đang được cập nhật</h1>
      <p className="max-w-[52ch] text-ink">Bạn có thể xem các dịch vụ cốt lõi của Bali Home hoặc gửi yêu cầu để được tư vấn trực tiếp.</p>
      <div className="flex flex-wrap gap-3">
        <Button as={Link} to="/dich-vu">Xem dịch vụ</Button>
        <Button as="a" href="/#lien-he" variant="soft">Tư vấn miễn phí</Button>
      </div>
    </div>
  );
}
