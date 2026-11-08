import { useEffect } from 'react';
import Navbar, { CONTAINER } from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ContactSection from '../components/home/ContactSection.jsx';
import ServiceExplorer from '../components/services/ServiceExplorer.jsx';

/* =============================================================================
 * /dich-vu — bấm từng dịch vụ để xem mô tả riêng (bộ chọn ServiceExplorer).
 * Dịch vụ đang xem nằm trên URL: /dich-vu?dv=web
 * ========================================================================== */
export default function ServicesPage() {
  useEffect(() => { document.title = 'Dịch vụ — Bali Home'; }, []);

  return (
    <div className="min-h-dvh bg-ground">
      <Navbar />
      <main>
        <section className={`${CONTAINER} grid gap-6 pt-12 pb-12 lg:grid-cols-12 lg:items-end lg:pt-20`}>
          <h1 className="animate-rise font-display text-display lg:col-span-7">Dịch vụ Bali Home</h1>
          <p className="max-w-[44ch] animate-rise text-lead [animation-delay:90ms] lg:col-span-5">
            Tám dịch vụ cho thương hiệu của bạn. Bấm vào từng dịch vụ để xem bạn nhận được gì, quy trình làm và câu hỏi thường gặp.
          </p>
        </section>

        <section aria-label="Danh sách dịch vụ" className={`${CONTAINER} pb-24 lg:pb-28`}>
          <ServiceExplorer idPrefix="page-sv" />
        </section>

        <ContactSection
          title="Chưa biết chọn gì?"
          intro="Kể cho Bali Home nghe về thương hiệu và mục tiêu của bạn. Chúng tôi sẽ đề xuất những dịch vụ thật sự cần."
          defaultService="other"
        />
      </main>
      <Footer />
    </div>
  );
}
