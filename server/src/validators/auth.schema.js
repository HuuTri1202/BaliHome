import { z } from 'zod';

// ⚠ Giữ đồng bộ với client/src/lib/validators.js

const email = z
  .string({ required_error: 'Vui lòng nhập email' })
  .trim()
  .toLowerCase()
  .min(1, 'Vui lòng nhập email')
  .max(254, 'Email quá dài')
  .email('Email không hợp lệ');

// bcrypt chỉ dùng 72 byte đầu → giới hạn 72 ký tự
const newPassword = z
  .string({ required_error: 'Vui lòng nhập mật khẩu' })
  .min(8, 'Mật khẩu tối thiểu 8 ký tự')
  .max(72, 'Mật khẩu tối đa 72 ký tự')
  .regex(/[A-Za-zÀ-ỹ]/, 'Mật khẩu cần có ít nhất 1 chữ cái')
  .regex(/\d/, 'Mật khẩu cần có ít nhất 1 chữ số');

// Số điện thoại VN: 0xxxxxxxxx hoặc +84xxxxxxxxx. Bỏ khoảng trắng / dấu chấm / gạch.
// Để trống → undefined (không bắt buộc)
const phone = z.preprocess(
  (v) => (typeof v === 'string' ? v.replace(/[\s.-]/g, '') || undefined : v),
  z
    .string()
    .regex(/^(0|\+84)[1-9]\d{8}$/, 'Số điện thoại không hợp lệ')
    .transform((v) => v.replace(/^\+84/, '0'))
    .optional()
);

export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Vui lòng nhập họ tên' })
    .trim()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  email,
  phone,
  password: newPassword,
});

/** Cập nhật hồ sơ: chỉ họ tên + số điện thoại (email là định danh đăng nhập, không cho đổi ở đây) */
export const profileSchema = z.object({
  fullName: z
    .string({ required_error: 'Vui lòng nhập họ tên' })
    .trim()
    .min(2, 'Họ tên tối thiểu 2 ký tự')
    .max(100, 'Họ tên tối đa 100 ký tự'),
  phone: z.preprocess((v) => (v === '' ? null : v), phone.nullable()),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Vui lòng nhập mật khẩu hiện tại' }).min(1, 'Vui lòng nhập mật khẩu hiện tại').max(200),
    newPassword: newPassword,
  })
  .refine((v) => v.currentPassword !== v.newPassword, { message: 'Mật khẩu mới phải khác mật khẩu hiện tại', path: ['newPassword'] });

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Vui lòng nhập mật khẩu' }).min(1, 'Vui lòng nhập mật khẩu').max(200),
  remember: z.boolean().optional().default(false),
});
