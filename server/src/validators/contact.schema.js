import { z } from 'zod';

/** "Khác" — khách chưa chắc cần dịch vụ nào. Các giá trị khác phải là slug dịch vụ có trong DB. */
export const OTHER_NEED = 'other';

const optionalText = (max, msg) =>
  z.preprocess((v) => (typeof v === 'string' ? v.trim() || undefined : v), z.string().max(max, msg).optional());

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
  // Kiểm tra slug có tồn tại hay không được làm ở route (cần truy vấn DB)
  need: z
    .string({ required_error: 'Vui lòng chọn dịch vụ' })
    .trim()
    .toLowerCase()
    .min(1, 'Vui lòng chọn dịch vụ')
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'Dịch vụ không hợp lệ'),
  message: optionalText(1000, 'Lời nhắn tối đa 1000 ký tự'),
});
