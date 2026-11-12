import { useId, useRef, useState } from 'react';
import { CheckIcon, ChatIcon, FileIcon, LayersIcon } from '../ui/icons.jsx';

const STEPS = [
  { title: 'Lắng nghe', detail: 'Hỏi rõ mục tiêu, khách hàng và ngân sách.', Icon: ChatIcon },
  { title: 'Báo giá', detail: 'Chia theo hạng mục, có mốc giao từng phần.', Icon: FileIcon },
  { title: 'Thực hiện', detail: 'Bạn duyệt bản nháp, góp ý để chỉnh sửa.', Icon: LayersIcon },
  { title: 'Bàn giao', detail: 'File gốc, tài khoản và hỗ trợ sau dự án.', Icon: CheckIcon },
];

/** Tâm của cột đầu và cột cuối trong lưới 4 cột: đường nối chạy giữa hai điểm này */
const LINE_INSET = '12.5%';
const KEY_STEPS = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };

function StepTab({ step: { title, Icon }, isActive, isReached, tabId, panelId, tabRef, onSelect }) {
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
        className={`relative grid h-14 w-14 place-items-center rounded-full transition-[background-color,color,transform,box-shadow] duration-300 group-hover:scale-105 lg:h-20 lg:w-20 ${
          isReached ? 'bg-action text-on-action' : 'bg-ground-3 text-ink'
        } ${isActive ? 'scale-105 ring-4 ring-[color-mix(in_srgb,var(--action)_25%,transparent)]' : ''}`}
      >
        <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
      </span>
      <span className={`text-[15px] transition-colors duration-300 lg:text-lead ${isActive ? 'text-action' : ''}`}>{title}</span>
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
        <span className="absolute top-9 h-0.5 bg-ground-3 lg:top-12" style={{ left: LINE_INSET, right: LINE_INSET }} aria-hidden="true">
          <span className="block h-full origin-left bg-action transition-transform duration-500" style={{ transform: `scaleX(${activeIndex / (STEPS.length - 1)})` }} />
        </span>
        <div role="tablist" aria-label="Các bước làm việc" onKeyDown={selectByKeyboard} className="relative grid grid-cols-4">
          {STEPS.map((step, index) => (
            <StepTab
              key={step.title}
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
        <div key={activeStep.title} className="animate-rise">
          <p className="text-lead font-bold">{activeStep.title}</p>
          <p className="mt-1 text-ink-2">{activeStep.detail}</p>
        </div>
      </div>
    </div>
  );
}
