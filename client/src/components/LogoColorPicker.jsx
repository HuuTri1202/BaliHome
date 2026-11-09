import { LOGO_COLORS } from '../data/logoColors.js';
import { useLogoColor } from '../hooks/useLogoColor.js';

/** Thanh chọn màu cho logo Header. Bấm lại màu đang chọn để trở về logo nguyên bản. */
export default function LogoColorPicker() {
  const { color: selected, toggleColor } = useLogoColor();

  return (
    <div role="group" aria-label="Đổi màu logo trên Header" className="flex items-center gap-1">
      {LOGO_COLORS.map(({ id, name, value }) => {
        const isSelected = selected?.id === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleColor(id)}
            aria-pressed={isSelected}
            aria-label={`Logo màu ${name}`}
            title={name}
            className="grid h-11 w-11 place-items-center rounded-full"
          >
            <span
              aria-hidden="true"
              className={`h-7 w-7 rounded-full transition-transform duration-200 ${isSelected ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-ground' : 'ring-1 ring-ink/40 hover:scale-110'}`}
              style={{ backgroundColor: value }}
            />
          </button>
        );
      })}
    </div>
  );
}
