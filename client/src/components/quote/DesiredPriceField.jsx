import { Field } from '../ui/Field.jsx';
import { groupDigits, parseVnd } from '../../lib/money.js';

/**
 * Ô "Mức giá mong muốn" (không bắt buộc): gõ số tuỳ ý, rời ô thì tự thêm dấu chấm ngăn cách ("15000000" → "15.000.000").
 * Dùng ở form báo giá và form sửa yêu cầu.
 * @param {{ value: string, onChange: (value: string) => void, error?: string, inputClassName?: string }} props
 */
export default function DesiredPriceField({ value, onChange, error, inputClassName = '' }) {
  const formatOnBlur = () => {
    const amount = parseVnd(value);
    if (amount !== null && !Number.isNaN(amount)) onChange(groupDigits(amount));
  };
  return (
    <Field
      label="Mức giá mong muốn"
      optional
      inputMode="numeric"
      autoComplete="off"
      placeholder="Ví dụ: 15.000.000"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={formatOnBlur}
      error={error}
      hint="Số tiền bạn dự định chi cho hạng mục này, giúp Bali Home đề xuất phương án vừa ngân sách."
      right={<span className="pr-3 text-[15px] font-semibold text-ink-2" aria-hidden="true">đ</span>}
      inputClassName={inputClassName}
      className="max-w-sm"
    />
  );
}
