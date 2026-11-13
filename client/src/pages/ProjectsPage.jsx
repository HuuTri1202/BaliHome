import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import ProjectCard from '../components/projects/ProjectCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { LayersIcon } from '../components/ui/icons.jsx';
import { PROJECTS } from '../data/projects.js';
import { serviceName, useServices } from '../hooks/useServices.js';
import { CONTACT_FORM_HREF } from '../lib/contactForm.js';

const FILTER_PARAM = 'dv';

const chipClass = (isActive) =>
  `rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${isActive ? 'bg-ink text-ground' : 'bg-ground-2 text-ink hover:bg-ground-3'}`;

/** Chưa có dự án công bố: nói thật và chỉ đường tiếp theo, không để trang trống */
function ProjectsComingSoon() {
  return (
    <div className="grid items-center gap-8 rounded-[2rem] bg-ground-2 p-8 sm:p-12 lg:grid-cols-[auto_1fr]">
      <span className="hex hex-ratio grid w-20 place-items-center bg-motif text-on-motif" aria-hidden="true">
        <LayersIcon className="h-8 w-8" />
      </span>
      <div>
        <h2 className="font-display text-[1.75rem] leading-tight sm:text-[2rem]">Dự án tiêu biểu đang được cập nhật</h2>
        <p className="mt-3 max-w-[56ch] text-ink-2">
          Bali Home đang chọn lọc những dự án đã được khách hàng đồng ý công bố. Trong lúc chờ, bạn có thể xem chi tiết từng dịch vụ
          hoặc nhắn cho chúng tôi để nhận ví dụ phù hợp với lĩnh vực của bạn.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button as={Link} to="/dich-vu" variant="outline">Xem dịch vụ</Button>
          <Button as="a" href={CONTACT_FORM_HREF} variant="brand">Nhận ví dụ phù hợp</Button>
        </div>
      </div>
    </div>
  );
}

/**
 * /du-an — danh sách dự án thực tế. Lọc theo dịch vụ (?dv=web) khi có từ 2 dịch vụ trở lên.
 * Dữ liệu: data/projects.js
 */
export default function ProjectsPage() {
  useEffect(() => { document.title = 'Dự án — Bali Home'; }, []);
  const { services } = useServices();
  const [searchParams, setSearchParams] = useSearchParams();
  const serviceLabel = (slug) => serviceName(slug, services);

  const serviceSlugs = [...new Set(PROJECTS.flatMap((p) => p.services))];
  const activeFilter = serviceSlugs.includes(searchParams.get(FILTER_PARAM)) ? searchParams.get(FILTER_PARAM) : '';
  const visible = activeFilter ? PROJECTS.filter((p) => p.services.includes(activeFilter)) : PROJECTS;
  const setFilter = (slug) => setSearchParams(slug ? { [FILTER_PARAM]: slug } : {}, { replace: true });

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main>
        <section className={`${CONTAINER} grid gap-6 pb-12 pt-12 lg:grid-cols-12 lg:items-end lg:pt-20`}>
          <h1 className="animate-rise font-display text-display lg:col-span-7">Dự án</h1>
          <p className="max-w-[44ch] animate-rise text-lead [animation-delay:90ms] lg:col-span-5">
            Những thương hiệu Bali Home đã đồng hành: bối cảnh, cách chúng tôi làm và kết quả mang lại.
          </p>
        </section>

        <section aria-label="Danh sách dự án" className={`${CONTAINER} pb-24 lg:pb-28`}>
          {PROJECTS.length === 0 ? (
            <ProjectsComingSoon />
          ) : (
            <>
              {serviceSlugs.length > 1 && (
                <div role="group" aria-label="Lọc theo dịch vụ" className="mb-10 flex flex-wrap gap-2">
                  <button type="button" onClick={() => setFilter('')} aria-pressed={!activeFilter} className={chipClass(!activeFilter)}>Tất cả</button>
                  {serviceSlugs.map((slug) => (
                    <button key={slug} type="button" onClick={() => setFilter(slug)} aria-pressed={activeFilter === slug} className={chipClass(activeFilter === slug)}>
                      {serviceLabel(slug)}
                    </button>
                  ))}
                </div>
              )}
              <ul className="grid gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((project) => (
                  <li key={project.slug}><ProjectCard project={project} serviceLabel={serviceLabel} /></li>
                ))}
              </ul>
            </>
          )}
        </section>

        <ContactSection
          title="Dự án tiếp theo có thể là của bạn"
          intro="Kể cho Bali Home nghe về thương hiệu và mục tiêu của bạn. Chúng tôi sẽ đề xuất cách làm phù hợp."
          defaultService="other"
        />
      </main>
      <Footer />
    </div>
  );
}
