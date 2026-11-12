import { ContrastIcon } from '../ui/icons.jsx';

/**
 * Nút cạnh logo: đổi chữ "BALI HOME" qua lại giữa trắng và tối.
 * Ẩn dưới sm vì ở đó Header chỉ hiện biểu tượng logo, không có chữ để đổi màu.
 * @param {{ tone: 'white'|'dark'|null, onToggle: () => void }} props
 */
export default function LogoToneToggle({ tone, onToggle }) {
  const label = tone === 'white' ? 'Đổi chữ logo sang màu tối' : 'Đổi chữ logo sang màu trắng';
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className="hidden h-11 w-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ground-3 hover:text-ink sm:grid"
    >
      <ContrastIcon className="h-5 w-5" />
    </button>
  );
}
