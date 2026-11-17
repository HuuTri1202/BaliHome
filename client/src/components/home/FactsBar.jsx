import { CONTAINER } from '../Navbar.jsx';
import Reveal, { item } from '../Reveal.jsx';

/**
 * Dải "con số" kính. CHỈ dùng sự thật về cách Bali Home làm việc, không bịa số khách hàng/dự án.
 * Khi có số liệu thật (đã kiểm chứng) thì thay vào đây.
 */
const FACTS = [
  { value: '8', label: 'dịch vụ dưới một mái nhà' },
  { value: '6', label: 'bước làm việc rõ ràng' },
  { value: '1', label: 'người phụ trách xuyên suốt' },
  { value: '24/7', label: 'theo dõi yêu cầu trực tuyến' },
];

export default function FactsBar() {
  return (
    <section aria-label="Bali Home trong vài con số" className="pt-16 lg:pt-24">
      <Reveal className={CONTAINER}>
        <dl className="glass-card grid grid-cols-2 gap-y-8 rounded-[1.75rem] px-6 py-8 sm:px-10 lg:grid-cols-4 lg:divide-x lg:divide-white/10 lg:py-10">
          {FACTS.map(({ value, label }, index) => (
            <div key={label} {...item(index, 'flex flex-col-reverse items-center gap-2 px-2 text-center')}>
              <dt className="text-sm text-ink-2">{label}</dt>
              <dd className="font-display text-[2.5rem] font-extrabold leading-none tracking-[-0.03em] text-white lg:text-[3rem]">
                <span className="text-gradient-violet">{value}</span>
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
