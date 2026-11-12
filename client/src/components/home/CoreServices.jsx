import { Link } from 'react-router-dom';
import { CONTAINER } from '../Navbar.jsx';
import { Button } from '../ui/Button.jsx';
import Reveal, { item } from '../Reveal.jsx';
import { ArrowRightIcon } from '../ui/icons.jsx';
import { CORE_SERVICES } from '../../data/coreServices.js';
import { SECTION_Y } from './sectionSpacing.js';

function ServiceCard({ service: { slug, title, line, Icon, tone }, index }) {
  return (
    <li {...item(index + 1)}>
      <Link to={`/dich-vu/${slug}`} className="group flex h-full flex-col rounded-3xl bg-ground-2 p-8 transition-transform duration-200 hover:-translate-y-1 lg:p-10">
        <span className={`grid h-14 w-14 place-items-center rounded-2xl ${tone}`}>
          <Icon className="h-7 w-7" />
        </span>
        <h3 className="mt-14 font-display text-[1.75rem] leading-tight">{title}</h3>
        <p className="mt-2 text-ink-2">{line}</p>
        <span className="mt-8 inline-flex items-center gap-2 text-[15px] font-semibold transition-colors group-hover:text-action">
          Xem chi tiết <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Link>
    </li>
  );
}

/** Khối dịch vụ tối giản: 4 card biểu tượng, chi tiết nằm ở trang riêng của từng dịch vụ */
export default function CoreServices() {
  return (
    <section id="dich-vu" aria-labelledby="dich-vu-title" className={SECTION_Y}>
      <Reveal className={CONTAINER}>
        <h2 id="dich-vu-title" {...item(0, 'font-display text-title')}>Tám dịch vụ, một đầu mối</h2>
        <ul className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {CORE_SERVICES.map((service, index) => <ServiceCard key={service.slug} service={service} index={index} />)}
        </ul>
        {/* CTA điều hướng (không phải báo giá): khách cần hiểu dịch vụ trước khi được mời báo giá */}
        <div {...item(5, 'mt-16')}>
          <Button as={Link} to="/dich-vu" variant="soft" size="lg" bubble>Khám phá dịch vụ</Button>
        </div>
      </Reveal>
    </section>
  );
}
