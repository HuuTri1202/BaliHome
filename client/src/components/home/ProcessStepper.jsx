import { useId, useState } from 'react';
import { CheckIcon, ChatIcon, FileIcon, LayersIcon } from '../ui/icons.jsx';

const STEPS = [
  { title: 'Lắng nghe', detail: 'Hỏi rõ mục tiêu, khách hàng và ngân sách.', Icon: ChatIcon },
  { title: 'Báo giá', detail: 'Chia theo hạng mục, có mốc giao từng phần.', Icon: FileIcon },
  { title: 'Thực hiện', detail: 'Bạn duyệt bản nháp, góp ý để chỉnh sửa.', Icon: LayersIcon },
  { title: 'Bàn giao', detail: 'File gốc, tài khoản và hỗ trợ sau dự án.', Icon: CheckIcon },
];

/** Tâm của cột đầu và cột cuối trong lưới 4 cột: đường nối chạy giữa hai điểm này */
const LINE_INSET = '12.5%';

function StepButton({ step: { title, Icon }, isOpen, isReached, panelId, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-controls={panelId}
      className="group flex w-full flex-col items-center gap-4 rounded-2xl py-2 font-semibold"
    >
      <span
        className={`relative grid h-14 w-14 place-items-center rounded-full transition-[background-color,color,transform] duration-300 group-hover:scale-105 lg:h-20 lg:w-20 ${
          isReached ? 'bg-action text-on-action' : 'bg-ground-3 text-ink'
        }`}
      >
        <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
      </span>
      <span className="text-[15px] lg:text-lead">{title}</span>
    </button>
  );
}

/**
 * Quy trình dạng stepper ngang. Mặc định chỉ hiện tên bước; bấm vào bước để xem chi tiết, bấm lại để đóng.
 * Dùng nút aria-expanded (không dùng tabs) vì trạng thái ban đầu là không mở bước nào.
 * Khung chi tiết giữ sẵn chiều cao → mở bước không làm trang bị đẩy.
 */
export default function ProcessStepper() {
  const [openIndex, setOpenIndex] = useState(null);
  const panelId = useId();
  const openStep = openIndex === null ? null : STEPS[openIndex];
  const progress = openIndex === null ? 0 : openIndex / (STEPS.length - 1);

  return (
    <div>
      <div className="relative">
        <span className="absolute top-9 h-0.5 bg-ground-3 lg:top-12" style={{ left: LINE_INSET, right: LINE_INSET }} aria-hidden="true">
          <span className="block h-full origin-left bg-action transition-transform duration-500" style={{ transform: `scaleX(${progress})` }} />
        </span>
        <ol className="relative grid grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title}>
              <StepButton
                step={step}
                isOpen={openIndex === index}
                isReached={openIndex !== null && index <= openIndex}
                panelId={panelId}
                onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
              />
            </li>
          ))}
        </ol>
      </div>

      <div id={panelId} aria-live="polite" className="mt-10 grid min-h-32 place-items-center rounded-3xl bg-ground-2 p-6 text-center lg:mt-14">
        {openStep ? (
          <div key={openStep.title} className="animate-rise">
            <p className="text-lead font-bold">{openStep.title}</p>
            <p className="mt-1 text-ink-2">{openStep.detail}</p>
          </div>
        ) : (
          <p className="text-ink-2">Chọn một bước để xem chi tiết</p>
        )}
      </div>
    </div>
  );
}
