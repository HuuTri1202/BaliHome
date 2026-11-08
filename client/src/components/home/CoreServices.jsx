import { Link } from 'react-router-dom';
import { CONTAINER } from '../Navbar.jsx';
import QuoteButton from '../QuoteButton.jsx';
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
        <ArrowRightIcon className="mt-8 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
        <div {...item(5, 'mt-16 flex flex-wrap items-center gap-x-8 gap-y-5')}>
          <QuoteButton />
          <Link to="/dich-vu" className="inline-flex items-center gap-2 font-semibold hover:text-action">
            Xem tất cả dịch vụ <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
