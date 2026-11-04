import { useEffect, useRef } from 'react';

/**
 * Lối vào cho các phần của một section (taste-skill §9.2):
 * tiêu đề → chữ → hình, lệch nhau 80ms, nâng 24px + mờ dần, chạy MỘT lần khi section đi vào màn hình.
 *
 * Dùng: <Reveal as="section"> ... <h2 {...item(0, 'text-title')}> ... <p {...item(1)}> ... </Reveal>
 * - Chỉ ẩn phần tử khi JS đã chạy (class reveal-armed) → script lỗi thì nội dung vẫn hiện đủ.
 * - prefers-reduced-motion → không ẩn, không di chuyển.
 */
export const item = (i, className = '') => ({ className: `reveal-item ${className}`, style: { '--i': i } });

export default function Reveal({ as: Tag = 'div', children, ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    el.classList.add('reveal-armed');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('reveal-in');
        io.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
