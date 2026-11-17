import { Link } from 'react-router-dom';
import { CONTAINER } from '../Navbar.jsx';
import Reveal, { item } from '../Reveal.jsx';
import { ArrowRightIcon, ArrowUpRightIcon, LayersIcon } from '../ui/icons.jsx';
import { PROJECTS } from '../../data/projects.js';
import { CONTACT_FORM_HREF, scrollToContactForm } from '../../lib/contactForm.js';
import SectionHeading from './SectionHeading.jsx';
import { SECTION_Y } from './sectionSpacing.js';

const FEATURED_COUNT = 3;

/** Thẻ ảnh dự án, nhãn kính nổi trên ảnh */
function FeaturedCard({ project, index }) {
  const meta = [project.client, project.year].filter(Boolean).join(' · ');
  return (
    <li {...item(index + 2)}>
      <Link to={`/du-an/${project.slug}`} className="group relative block aspect-[4/5] overflow-hidden rounded-[1.75rem] ring-1 ring-white/10">
        <img
          src={project.cover.src}
          alt={project.cover.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
        />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
        <span className="glass-card absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-2xl p-4">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-white">{project.title}</span>
            {meta && <span className="mt-0.5 block truncate text-sm text-ink-2">{meta}</span>}
          </span>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#160f33]" aria-hidden="true">
            <ArrowUpRightIcon className="h-4 w-4" />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Chưa có dự án được công bố: nói thật, chỉ đường tiếp theo (không đặt ảnh minh hoạ giả làm dự án) */
function ComingSoon() {
  return (
    <div {...item(2, 'glass-card mt-14 grid items-center gap-8 rounded-[1.75rem] p-8 sm:p-10 lg:grid-cols-[auto_1fr_auto]')}>
      <span className="neon-tile grid h-16 w-16 place-items-center rounded-2xl text-white" aria-hidden="true">
        <LayersIcon className="h-7 w-7" />
      </span>
      <div>
        <h3 className="font-display text-[1.5rem] leading-tight text-white sm:text-[1.75rem]">Dự án tiêu biểu đang được cập nhật</h3>
        <p className="mt-2 max-w-[56ch] text-ink-2">
          Bali Home chỉ công bố những dự án khách hàng đã đồng ý. Cần ví dụ đúng lĩnh vực của bạn? Nhắn cho chúng tôi.
        </p>
      </div>
      <Link
        to={CONTACT_FORM_HREF}
        onClick={scrollToContactForm}
        className="inline-flex h-12 items-center gap-2 justify-self-start rounded-full bg-white px-6 text-[15px] font-semibold text-[#160f33] transition-colors hover:bg-violet-100"
      >
        Nhận ví dụ phù hợp <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </div>
  );
}

export default function FeaturedProjects() {
  const featured = PROJECTS.slice(0, FEATURED_COUNT);
  return (
    <section id="du-an-tieu-bieu" aria-labelledby="du-an-title" className={SECTION_Y}>
      <Reveal className={CONTAINER}>
        <SectionHeading
          id="du-an-title"
          eyebrow="Dự án"
          title="Thương hiệu"
          accent="đã đồng hành."
          aside={
            <Link to="/du-an" className="glass-card group inline-flex h-12 items-center gap-2 rounded-full px-6 text-[15px] font-semibold text-white transition-colors hover:border-white/30">
              Xem tất cả dự án <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          }
        />
        {featured.length === 0 ? (
          <ComingSoon />
        ) : (
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((project, index) => <FeaturedCard key={project.slug} project={project} index={index} />)}
          </ul>
        )}
      </Reveal>
    </section>
  );
}
