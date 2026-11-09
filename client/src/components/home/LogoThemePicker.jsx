/**
 * Nút chọn màu cho logo 3D. Dùng radio thật: bàn phím di chuyển bằng phím mũi tên,
 * trình đọc màn hình đọc được tên từng màu. Mỗi ô hiện 2 màu chính và phụ của bộ màu.
 * @param {{ themes: Array<{ id: string, name: string, primary: string, secondary: string }>, selectedId: string, onSelect: (id: string) => void }} props
 */
export default function LogoThemePicker({ themes, selectedId, onSelect }) {
  return (
    <div role="radiogroup" aria-label="Đổi màu logo" className="glass float-shadow flex items-center rounded-full p-1">
      {themes.map(({ id, name, primary, secondary }) => {
        const isSelected = id === selectedId;
        return (
          <label
            key={id}
            title={name}
            className="grid h-11 w-11 cursor-pointer place-items-center rounded-full has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-action"
          >
            <input type="radio" name="logo-theme" value={id} checked={isSelected} onChange={() => onSelect(id)} aria-label={name} className="sr-only" />
            <span
              aria-hidden="true"
              className={`h-7 w-7 rounded-full transition-transform duration-200 ${isSelected ? 'scale-110 ring-2 ring-ink ring-offset-2 ring-offset-ground' : 'ring-1 ring-ink/30 hover:scale-110'}`}
              style={{ background: `linear-gradient(135deg, ${primary} 50%, ${secondary} 50%)` }}
            />
          </label>
        );
      })}
    </div>
  );
}
