import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import { ArrowLeftIcon, ArrowUpRightIcon, CheckIcon } from '../components/ui/icons.jsx';
import { findProject } from '../data/projects.js';
import { serviceName, useServices } from '../hooks/useServices.js';
import NotFoundPage from './NotFoundPage.jsx';

function StorySection({ title, children }) {
  return (
    <section className="grid gap-3 border-t border-ink/10 py-10 lg:grid-cols-12 lg:gap-8">
      <h2 className="text-[1.375rem] font-bold lg:col-span-4">{title}</h2>
      <div className="leading-relaxed text-ink-2 lg:col-span-8">{children}</div>
    </section>
  );
}

function ProjectFacts({ project, serviceLabel }) {
  const facts = [
    ['Khách hàng', project.client],
    ['Năm', project.year],
    ['Dịch vụ', project.services.map(serviceLabel).join(', ')],
  ].filter(([, value]) => value);
  if (facts.length === 0) return null;
  return (
    <dl className="grid gap-6 sm:grid-cols-3">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-sm font-medium text-ink-2">{label}</dt>
          <dd className="mt-1 font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** /du-an/:slug — case study: bối cảnh, giải pháp, kết quả, hình ảnh. Dữ liệu: data/projects.js */
export default function ProjectDetailPage() {
  const { slug } = useParams();
  const project = findProject(slug);
  const { services } = useServices();
  const serviceLabel = (s) => serviceName(s, services);

  useEffect(() => {
    if (project) document.title = `${project.title} — Dự án Bali Home`;
  }, [project]);

  if (!project) return <NotFoundPage />;

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main>
        <article className={`${CONTAINER} pb-20 pt-10 lg:pt-14`}>
          <Link to="/du-an" className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink">
            <ArrowLeftIcon className="h-4 w-4" /> Tất cả dự án
          </Link>
          <header className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h1 className="animate-rise font-display text-[2.75rem] leading-[1.05] sm:text-[3.5rem] lg:col-span-7">{project.title}</h1>
            <p className="animate-rise text-lead [animation-delay:90ms] lg:col-span-5">{project.summary}</p>
          </header>

          <img src={project.cover.src} alt={project.cover.alt} className="mt-10 aspect-[16/9] w-full rounded-[2rem] bg-ground-2 object-cover" />

          <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
            <ProjectFacts project={project} serviceLabel={serviceLabel} />
            {project.link && (
              <a href={project.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-action underline-offset-4 hover:underline">
                Xem sản phẩm <ArrowUpRightIcon className="h-4 w-4" />
              </a>
            )}
          </div>

          <div className="mt-10">
            {project.challenge && <StorySection title="Bối cảnh">{project.challenge}</StorySection>}
            {project.solution && <StorySection title="Bali Home đã làm">{project.solution}</StorySection>}
            {project.results.length > 0 && (
              <StorySection title="Kết quả">
                <ul className="grid gap-3">
                  {project.results.map((result) => (
                    <li key={result} className="flex gap-3 text-ink">
                      <CheckIcon className="mt-1 h-5 w-5 shrink-0 text-action" /> {result}
                    </li>
                  ))}
                </ul>
              </StorySection>
            )}
          </div>

          {project.gallery.length > 0 && (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2" aria-label="Hình ảnh dự án">
              {project.gallery.map((image) => (
                <li key={image.src}>
                  <img src={image.src} alt={image.alt} loading="lazy" className="aspect-[4/3] w-full rounded-[28px] bg-ground-2 object-cover" />
                </li>
              ))}
            </ul>
          )}
        </article>

        <ContactSection
          title="Muốn một dự án như thế này?"
          intro="Gửi yêu cầu, Bali Home sẽ liên hệ để tư vấn cách làm phù hợp với thương hiệu của bạn."
          defaultService={project.services[0] ?? 'other'}
        />
      </main>
      <Footer />
    </div>
  );
}
