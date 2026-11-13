import { Link } from 'react-router-dom';
import { ArrowUpRightIcon } from '../ui/icons.jsx';

/**
 * Thẻ dự án trong lưới /du-an: ảnh bìa, tên, khách hàng · năm, dịch vụ.
 * @param {{ project: object, serviceLabel: (slug: string) => string }} props
 */
export default function ProjectCard({ project, serviceLabel }) {
  const meta = [project.client, project.year].filter(Boolean).join(' · ');
  return (
    <Link to={`/du-an/${project.slug}`} className="group block rounded-[28px] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-action">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[28px] bg-ground-2">
        <img
          src={project.cover.src}
          alt={project.cover.alt}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <span className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ground text-ink opacity-0 shadow-lg transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true">
          <ArrowUpRightIcon className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-5 px-1">
        {meta && <p className="text-sm font-medium text-ink-2">{meta}</p>}
        <h2 className="mt-1 text-[1.375rem] font-bold leading-snug transition-colors group-hover:text-action">{project.title}</h2>
        <p className="mt-2 line-clamp-2 text-ink-2">{project.summary}</p>
        {project.services.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2" aria-label="Dịch vụ">
            {project.services.map((slug) => (
              <li key={slug} className="rounded-full bg-ground-2 px-3 py-1 text-sm font-medium text-ink">{serviceLabel(slug)}</li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  );
}
