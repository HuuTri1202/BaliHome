import { Button } from '../ui/Button.jsx';

/** Khung chờ khi đang tải dịch vụ (giữ đúng bố cục → không nhảy trang) */
export function ServicesSkeleton({ rows = 4 }) {
  return (
    <div className="grid gap-1" role="status" aria-label="Đang tải dịch vụ">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-28 animate-pulse bg-ground-2" />
      ))}
    </div>
  );
}

/** Lỗi tải dịch vụ (mất mạng / server ngủ) + nút thử lại */
export function ServicesError({ error, onRetry }) {
  return (
    <div className="flex flex-col items-start gap-4 bg-ground-2 p-8" role="alert">
      <p className="text-lead font-bold">Chưa tải được danh sách dịch vụ</p>
      <p className="text-ink-2">{error?.message ?? 'Đã có lỗi xảy ra.'}</p>
      <Button variant="soft" onClick={onRetry}>Thử lại</Button>
    </div>
  );
}
