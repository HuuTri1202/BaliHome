import { useId, useRef, useState } from 'react';
import { ChatIcon, CheckIcon, FileIcon, PenIcon, ShieldIcon, SparkIcon } from '../ui/icons.jsx';

/**
 * Quy trình làm việc do Bali Home cung cấp (12/11/2026).
 * label: tên ngắn dưới vòng tròn; title + detail: hiện đầy đủ ở khung bên dưới khi chọn bước.
 */
const STEPS = [
  { label: 'Lắng nghe', title: 'Lắng nghe & Tiếp nhận nhu cầu', detail: 'Tìm hiểu mong muốn, mục tiêu, ngân sách và những yêu cầu cụ thể của khách hàng.', Icon: ChatIcon },
  { label: 'Tư vấn', title: 'Tư vấn & Đề xuất giải pháp', detail: 'Phân tích nhu cầu, đưa ra phương án phù hợp và tối ưu hiệu quả cho khách hàng.', Icon: SparkIcon },
  { label: 'Báo giá', title: 'Báo giá & Xác nhận', detail: 'Gửi báo giá chi tiết, thống nhất chi phí, tiến độ và phạm vi công việc.', Icon: FileIcon },
  { label: 'Triển khai', title: 'Ký kết & Triển khai', detail: 'Xác nhận thỏa thuận, tiến hành thực hiện dịch vụ theo kế hoạch đã thống nhất.', Icon: PenIcon },
  { label: 'Bàn giao', title: 'Nghiệm thu & Bàn giao', detail: 'Kiểm tra chất lượng, hoàn thiện các hạng mục và bàn giao kết quả cho khách hàng.', Icon: CheckIcon },
  { label: 'Chăm sóc', title: 'Chăm sóc & Hỗ trợ sau dịch vụ', detail: 'Tiếp nhận phản hồi, hỗ trợ phát sinh và duy trì mối quan hệ lâu dài với khách hàng.', Icon: ShieldIcon },
];

/** Tâm của cột đầu và cột cuối trong lưới N cột: đường nối chạy giữa hai điểm này */
const LINE_INSET = `${100 / (2 * STEPS.length)}%`;
const KEY_STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function StepTab({ step: { label, Icon }, isActive, isReached, tabId, panelId, tabRef, onSelect }) {
  return (
    <button
      ref={tabRef}
      id={tabId}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
      onClick={onSelect}
      className="group flex w-full flex-col items-center gap-4 rounded-2xl py-2 font-semibold"
    >
      <span
        className={`relative grid h-11 w-11 place-items-center rounded-full transition-[background-color,color,transform,box-shadow] duration-300 group-hover:scale-105 sm:h-14 sm:w-14 lg:h-20 lg:w-20 ${
          isReached ? 'bg-action text-on-action' : 'bg-ground-3 text-ink'
        } ${isActive ? 'scale-105 ring-4 ring-[color-mix(in_srgb,var(--action)_25%,transparent)]' : ''}`}
      >
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />
      </span>
      {/* Điện thoại: 6 cột quá hẹp cho chữ → chỉ còn vòng tròn, tên bước vẫn có cho trình đọc màn hình */}
      <span className={`sr-only text-[15px] transition-colors duration-300 sm:not-sr-only lg:text-[1.0625rem] ${isActive ? 'text-action' : ''}`}>{label}</span>
    </button>
  );
}

/**
 * Quy trình dạng stepper ngang (chuẩn ARIA tabs): bước "Lắng nghe" được chọn sẵn khi tải trang,
 * luôn có đúng một bước đang xem. Bàn phím: mũi tên trái/phải, Home, End.
 */
export default function ProcessStepper() {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const tabRefs = useRef([]);
  const activeStep = STEPS[activeIndex];
  const tabId = (index) => `${baseId}-tab-${index}`;
  const panelId = `${baseId}-panel`;

  const selectByKeyboard = (event) => {
    const last = STEPS.length - 1;
    const target = event.key === 'Home' ? 0 : event.key === 'End' ? last : KEY_STEPS[event.key] === undefined ? null : (activeIndex + KEY_STEPS[event.key] + STEPS.length) % STEPS.length;
    if (target === null) return;
    event.preventDefault();
    setActiveIndex(target);
    tabRefs.current[target]?.focus();
  };

  return (
    <div>
      <div className="relative">
        <span className="absolute top-[30px] h-0.5 bg-ground-3 sm:top-9 lg:top-12" style={{ left: LINE_INSET, right: LINE_INSET }} aria-hidden="true">
          <span className="block h-full origin-left bg-action transition-transform duration-500" style={{ transform: `scaleX(${activeIndex / (STEPS.length - 1)})` }} />
        </span>
        <div role="tablist" aria-label="Các bước làm việc" onKeyDown={selectByKeyboard} className="relative grid grid-cols-6">
          {STEPS.map((step, index) => (
            <StepTab
              key={step.label}
              step={step}
              isActive={index === activeIndex}
              isReached={index <= activeIndex}
              tabId={tabId(index)}
              panelId={panelId}
              tabRef={(el) => { tabRefs.current[index] = el; }}
              onSelect={() => setActiveIndex(index)}
            />
          ))}
        </div>
      </div>

      <div id={panelId} role="tabpanel" aria-labelledby={tabId(activeIndex)} className="mt-10 grid min-h-32 place-items-center rounded-3xl bg-ground-2 p-6 text-center lg:mt-14">
        {/* key = bước → mỗi lần đổi bước nội dung "mọc" lên lại */}
        <div key={activeStep.label} className="animate-rise">
          <p className="text-sm font-semibold text-action">Bước {activeIndex + 1}/{STEPS.length}</p>
          <p className="mt-1 text-lead font-bold">{activeStep.title}</p>
          <p className="mx-auto mt-2 max-w-[52ch] text-ink-2">{activeStep.detail}</p>
        </div>
      </div>
    </div>
  );
}
