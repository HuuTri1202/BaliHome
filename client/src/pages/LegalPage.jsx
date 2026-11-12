import { Link } from 'react-router-dom';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { LAST_UPDATED, LEGAL_PAGES } from '../data/legalContent.js';

const OTHER_PAGE_LINK = 'font-semibold text-action underline-offset-4 hover:underline';

function Section({ heading, paragraphs = [], items = [] }) {
  return (
    <section className="mt-10">
      <h2 className="text-[1.375rem] font-bold leading-snug">{heading}</h2>
      {paragraphs.map((text) => <p key={text} className="mt-3 leading-relaxed text-ink-2">{text}</p>)}
      {items.length > 0 && (
        <ul className="mt-3 grid list-disc gap-2 pl-6 leading-relaxed text-ink-2 marker:text-action">
          {items.map((text) => <li key={text}>{text}</li>)}
        </ul>
      )}
    </section>
  );
}

/**
 * Trang pháp lý dùng chung: Chính sách quyền riêng tư, Điều khoản sử dụng, Xoá dữ liệu người dùng.
 * Nội dung nằm ở data/legalContent.js.
 * @param {{ page: keyof typeof LEGAL_PAGES }} props
 */
export default function LegalPage({ page }) {
  const { title, intro, sections } = LEGAL_PAGES[page];
  const others = Object.entries(LEGAL_PAGES).filter(([key]) => key !== page);
  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main className={`${CONTAINER} pb-24 pt-12 lg:pt-20`}>
        <article className="mx-auto max-w-[72ch]">
          <h1 className="font-display text-[2.5rem] leading-[1.05] sm:text-[3.25rem]">{title}</h1>
          <p className="mt-3 text-sm text-ink-2">Cập nhật lần cuối: {LAST_UPDATED}</p>
          <p className="mt-8 text-[1.125rem] leading-relaxed">{intro}</p>
          {sections.map((section) => <Section key={section.heading} {...section} />)}
          <p className="mt-14 border-t border-ink/10 pt-6 text-[15px] text-ink-2">
            Xem thêm:{' '}
            {others.map(([key, other], index) => (
              <span key={key}>
                {index > 0 && ' · '}
                <Link to={other.path} className={OTHER_PAGE_LINK}>{other.title}</Link>
              </span>
            ))}
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
