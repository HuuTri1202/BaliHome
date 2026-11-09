import { prisma } from '../lib/prisma.js';
import { OTHER_NEED } from '../validators/contact.schema.js';

/** Tên dịch vụ cho danh sách slug (1 truy vấn cho cả trang, tránh N+1) */
export async function serviceNameMap(slugs) {
  const unique = [...new Set(slugs)].filter((s) => s && s !== OTHER_NEED);
  const rows = unique.length
    ? await prisma.service.findMany({ where: { slug: { in: unique } }, select: { slug: true, name: true } })
    : [];
  const map = Object.fromEntries(rows.map((r) => [r.slug, r.name]));
  return (slug) => map[slug] ?? (slug === OTHER_NEED ? 'Tư vấn khác' : slug);
}

/** Trường khách được xem (không lộ ip, userId…) */
export const CUSTOMER_REQUEST_SELECT = {
  id: true, code: true, phone: true, need: true, company: true, industry: true, budget: true, deadline: true,
  message: true, status: true, createdAt: true, updatedAt: true,
  attachments: { select: { id: true, url: true, fileName: true, bytes: true, format: true }, orderBy: { createdAt: 'asc' } },
  events: {
    select: { id: true, kind: true, fromStatus: true, toStatus: true, note: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  },
};

export async function withServiceNames(requests) {
  const nameOf = await serviceNameMap(requests.map((r) => r.need));
  return requests.map((r) => ({ ...r, needLabel: nameOf(r.need) }));
}
