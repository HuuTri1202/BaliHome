import { item } from '../Reveal.jsx';

/**
 * Đầu mục section kiểu cinematic: nhãn kính nhỏ + tiêu đề lớn, phần nhấn mạnh tô gradient tím.
 * Dùng bên trong <Reveal> (chiếm vị trí lối vào 0 và 1).
 * @param {{ id: string, eyebrow: string, title: string, accent?: string, align?: 'left' | 'center', aside?: import('react').ReactNode }} props
 */
export default function SectionHeading({ id, eyebrow, title, accent, align = 'left', aside }) {
  const isCenter = align === 'center';
  return (
    <div className={`flex flex-wrap items-end justify-between gap-6 ${isCenter ? 'flex-col items-center text-center' : ''}`}>
      <div className={isCenter ? 'flex flex-col items-center' : ''}>
        <p {...item(0, 'glass-card inline-flex rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-2')}>{eyebrow}</p>
        <h2 id={id} {...item(1, 'mt-5 max-w-[22ch] text-balance font-display text-title text-white')}>
          {title}
          {accent && <> <span className="text-gradient-violet">{accent}</span></>}
        </h2>
      </div>
      {aside && <div {...item(2)}>{aside}</div>}
    </div>
  );
}
