import { Link } from 'react-router-dom';
import { CONTAINER } from '../Navbar.jsx';
import Reveal, { item } from '../Reveal.jsx';
import { ArrowRightIcon, ArrowUpRightIcon } from '../ui/icons.jsx';
import { CORE_SERVICES } from '../../data/coreServices.js';
import SectionHeading from './SectionHeading.jsx';
import { SECTION_Y } from './sectionSpacing.js';

function ServiceCard({ service: { slug, title, line, Icon, glow }, index }) {
  return (
    <li {...item(index + 2)}>
      <Link
        to={`/dich-vu/${slug}`}
        className="glass-card group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] p-7 transition-[transform,border-color] duration-300 hover:-translate-y-1.5 hover:border-white/30 lg:p-8"
      >
        {/* quầng sáng màu dịch vụ, rõ hơn khi rê chuột */}
        <span
          className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-25 blur-3xl transition-opacity duration-300 group-hover:opacity-50"
          style={{ background: glow }}
          aria-hidden="true"
        />
        <span className="neon-tile relative grid h-16 w-16 place-items-center rounded-2xl text-white" style={{ '--glow': glow }}>
          <Icon className="h-7 w-7" />
        </span>
        <h3 className="mt-8 font-display lg:mt-12 text-[1.625rem] leading-tight text-white">{title}</h3>
        <p className="mt-2 text-ink-2">{line}</p>
        <span className="mt-8 flex items-center justify-between gap-3 text-[15px] font-semibold text-white">
          Khám phá
          <span className="grid h-10 w-10 place-items-center rounded-full ring-1 ring-white/25 transition-colors group-hover:bg-white group-hover:text-[#160f33]">
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Dịch vụ: 4 thẻ kính có ô biểu tượng phát sáng; chi tiết ở trang riêng của từng dịch vụ */
export default function CoreServices() {
  return (
    <section id="dich-vu" aria-labelledby="dich-vu-title" className={SECTION_Y}>
      <Reveal className={CONTAINER}>
        <SectionHeading
          id="dich-vu-title"
          eyebrow="Bali Home làm gì"
          title="Tám dịch vụ,"
          accent="một đầu mối."
          aside={
            // CTA điều hướng (không phải báo giá): khách cần hiểu dịch vụ trước khi được mời báo giá
            <Link to="/dich-vu" className="glass-card group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/30">
              Xem tất cả dịch vụ <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />
        <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:mt-20 lg:grid-cols-4 lg:gap-5">
          {CORE_SERVICES.map((service, index) => <ServiceCard key={service.slug} service={service} index={index} />)}
        </ul>
      </Reveal>
    </section>
  );
}
