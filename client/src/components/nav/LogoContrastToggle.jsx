import { ContrastIcon } from '../ui/icons.jsx';
import { useLogoColor } from '../../hooks/useLogoColor.js';

/** Nút cạnh logo trên Topbar: chuyển logo qua lại giữa trắng và tối */
export default function LogoContrastToggle() {
  const { color, toggleColor } = useLogoColor();
  const nextId = color?.id === 'white' ? 'black' : 'white';
  const label = nextId === 'white' ? 'Đổi logo sang màu trắng' : 'Đổi logo sang màu tối';

  return (
    <button
      type="button"
      onClick={() => toggleColor(nextId)}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ground-3 hover:text-ink"
    >
      <ContrastIcon className="h-5 w-5" />
    </button>
  );
}
