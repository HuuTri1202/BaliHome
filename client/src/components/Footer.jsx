import { Link } from 'react-router-dom';
import { CONTAINER } from './Navbar.jsx';
import { LogoHex } from './BrandMark.jsx';
import { Button } from './ui/Button.jsx';
import { MailIcon, PhoneIcon } from './ui/icons.jsx';
import { CONTACT, PORTFOLIO_PATH, SOCIAL_LINKS, toTelHref } from '../data/siteContact.js';
import { CORE_SERVICES } from '../data/coreServices.js';

const SERVICE_LABELS = { 'in-an': 'In ấn', design: 'Thiết kế', web: 'Website', marketing: 'Marketing' };

const LINK_CLASS = 'transition-colors hover:text-action';

function FooterColumn({ title, children }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-2">{title}</h2>
      <ul className="mt-6 grid gap-4 text-[15px] font-medium">{children}</ul>
    </nav>
  );
}

function BrandColumn() {
  const { hotline, email } = CONTACT;
  return (
    <div className="col-span-2 lg:col-span-1">
      <Link to="/" className="inline-flex items-center gap-3" aria-label="Bali Home — về trang chủ">
        <LogoHex className="h-12 w-12" />
        <span className="font-display text-[1.875rem] font-extrabold leading-none tracking-[-0.03em] sm:text-[2.25rem]">BALI HOME</span>
      </Link>
      <p className="mt-6 max-w-[34ch] text-ink-2">Giải pháp sáng tạo và công nghệ toàn diện cho doanh nghiệp.</p>
      {(hotline || email) && (
        <ul className="mt-8 grid gap-3 text-[15px] font-medium">
          {hotline && (
            <li>
              <a href={toTelHref(hotline)} className={`inline-flex items-center gap-3 ${LINK_CLASS}`}>
                <PhoneIcon className="h-5 w-5 text-ink-2" /> {hotline}
              </a>
            </li>
          )}
          {email && (
            <li>
              <a href={`mailto:${email}`} className={`inline-flex items-center gap-3 ${LINK_CLASS}`}>
                <MailIcon className="h-5 w-5 text-ink-2" /> {email}
              </a>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

/** Chân trang 4 cột, luôn nền tối (class dark đặt tại đây áp token tối cho riêng khối này) */
export default function Footer() {
  return (
    <footer className="dark border-t border-ink/10 bg-ground text-ink">
      <div className={`${CONTAINER} grid grid-cols-2 gap-x-8 gap-y-14 pb-20 pt-24 lg:grid-cols-[1.7fr_1fr_1fr_1.2fr] lg:pb-28 lg:pt-32`}>
        <BrandColumn />

        <FooterColumn title="Dịch vụ">
          {CORE_SERVICES.map(({ slug }) => (
            <li key={slug}><Link to={`/dich-vu/${slug}`} className={LINK_CLASS}>{SERVICE_LABELS[slug]}</Link></li>
          ))}
        </FooterColumn>

        <FooterColumn title="Về chúng tôi">
          <li><a href="/#cach-lam-viec" className={LINK_CLASS}>Cách làm việc</a></li>
          {PORTFOLIO_PATH && <li><Link to={PORTFOLIO_PATH} className={LINK_CLASS}>Dự án tiêu biểu</Link></li>}
          <li><Link to="/tai-khoan" className={LINK_CLASS}>Tài khoản thành viên</Link></li>
        </FooterColumn>

        <div className="col-span-2 lg:col-span-1">
          <h2 className="font-display text-[1.5rem] leading-tight">Cần tư vấn?</h2>
          <Button as="a" href="/#lien-he" variant="brand" className="mt-6">Tư vấn nhanh</Button>
        </div>
      </div>

      <div className={`${CONTAINER} flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-ink/10 py-7 text-sm text-ink-2`}>
        <p>© {new Date().getFullYear()} Bali Home. All rights reserved.</p>
        {SOCIAL_LINKS.length > 0 && (
          <ul className="flex flex-wrap gap-6" aria-label="Mạng xã hội">
            {SOCIAL_LINKS.map(({ label, href }) => (
              <li key={label}><a href={href} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>{label}</a></li>
            ))}
          </ul>
        )}
      </div>
    </footer>
  );
}
