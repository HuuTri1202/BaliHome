import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../utils/AppError.js';

// Trường công khai trả về cho trang web (process/faqs = nội dung riêng từng dịch vụ)
const PUBLIC_FIELDS = {
  slug: true, name: true, group: true, tagline: true, summary: true,
  deliverables: true, idealFor: true, process: true, faqs: true, priceFrom: true, sortOrder: true,
};

const router = Router();

// Danh sách dịch vụ ít thay đổi → cho trình duyệt/CDN cache ngắn hạn (60s, dùng bản cũ thêm 5 phút khi đang làm mới)
const cache = (res) => res.set('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

// GET /api/services — các dịch vụ đang hoạt động, theo thứ tự hiển thị
router.get('/', async (_req, res) => {
  const services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: PUBLIC_FIELDS,
  });
  cache(res).json({ services });
});

// GET /api/services/:slug — chi tiết 1 dịch vụ
router.get('/:slug', async (req, res) => {
  const service = await prisma.service.findFirst({
    where: { slug: String(req.params.slug).toLowerCase(), isActive: true },
    select: PUBLIC_FIELDS,
  });
  if (!service) throw new AppError(404, 'SERVICE_NOT_FOUND', 'Không tìm thấy dịch vụ này.');
  cache(res).json({ service });
});

export default router;
