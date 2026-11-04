import { z } from 'zod';
import { MAX_FILES, MAX_FILE_BYTES } from '../lib/cloudinary.js';

/** "Khác" — khách chưa chắc cần dịch vụ nào. Các giá trị khác phải là slug dịch vụ có trong DB. */
export const OTHER_NEED = 'other';

/** Khoảng ngân sách — ⚠ khớp client/src/data/quote.js */
export const BUDGETS = ['under-5m', '5-15m', '15-50m', 'over-50m', 'unsure'];

export const STATUSES = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'DONE', 'CANCELLED'];

const optionalText = (max, msg) =>
  z.preprocess((v) => (typeof v === 'string' ? v.trim() || undefined : v), z.string().max(max, msg).optional());

const attachment = z.object({
  url: z.string().url().max(500),
  publicId: z.string().max(300),
  fileName: z.string().trim().min(1).max(200),
  bytes: z.number().int().positive().max(MAX_FILE_BYTES, 'Mỗi tệp tối đa 10 MB'),
  format: z.string().max(20).optional().nullable(),
});

export const contactSchema = z.object({
  fullName: z
    .string({ required_error: 'Vui lòng nhập họ tên' })
    .trim()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  phone: z.preprocess(
    (v) => (typeof v === 'string' ? v.replace(/[\s.-]/g, '') : v),
    z
      .string({ required_error: 'Vui lòng nhập số điện thoại' })
      .regex(/^(0|\+84)[1-9]\d{8}$/, 'Số điện thoại không hợp lệ')
      .transform((v) => v.replace(/^\+84/, '0'))
  ),
  email: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toLowerCase() || undefined : v),
    z.string().email('Email không hợp lệ').max(254).optional()
  ),
  company: optionalText(120, 'Tên doanh nghiệp tối đa 120 ký tự'),
  // Kiểm tra slug có tồn tại hay không được làm ở route (cần truy vấn DB)
  need: z
    .string({ required_error: 'Vui lòng chọn dịch vụ' })
    .trim()
    .toLowerCase()
    .min(1, 'Vui lòng chọn dịch vụ')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Dịch vụ không hợp lệ'),
  industry: optionalText(80, 'Lĩnh vực tối đa 80 ký tự'),
  budget: z.enum(BUDGETS, { errorMap: () => ({ message: 'Ngân sách không hợp lệ' }) }).optional(),
  deadline: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.coerce
      .date({ errorMap: () => ({ message: 'Ngày không hợp lệ' }) })
      .refine((d) => d.getTime() >= Date.now() - 24 * 3600 * 1000, 'Deadline phải từ hôm nay trở đi')
      .optional()
  ),
  message: optionalText(2000, 'Mô tả tối đa 2000 ký tự'),
  attachments: z.array(attachment).max(MAX_FILES, `Tối đa ${MAX_FILES} tệp`).optional().default([]),
});

/** Admin cập nhật yêu cầu: đổi trạng thái và/hoặc gửi ghi chú cho khách */
export const adminUpdateSchema = z
  .object({
    status: z.enum(STATUSES).optional(),
    note: optionalText(1000, 'Ghi chú tối đa 1000 ký tự'),
  })
  .refine((v) => v.status || v.note, { message: 'Cần đổi trạng thái hoặc nhập ghi chú', path: ['note'] });
