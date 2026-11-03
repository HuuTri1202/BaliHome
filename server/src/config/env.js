import { z } from 'zod';

/**
 * Đọc & kiểm tra biến môi trường ngay khi khởi động.
 * Thiếu/sai biến nào → dừng server với thông báo rõ ràng, thay vì lỗi khó hiểu lúc chạy.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET phải dài tối thiểu 32 ký tự'),
  ACCESS_TOKEN_TTL_MIN: z.coerce.number().int().positive().default(15),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
  REFRESH_TOKEN_REMEMBER_DAYS: z.coerce.number().int().positive().default(30),
  CLIENT_ORIGIN: z.string().default('http://localhost:5173'),
  // Số tầng proxy đứng trước app (Render = 1). Dev: chỉ tin proxy local (Vite).
  TRUST_PROXY: z
    .string()
    .default('loopback')
    .transform((v) => (/^\d+$/.test(v) ? Number(v) : v)),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Biến môi trường không hợp lệ:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = { ...parsed.data, isProd: parsed.data.NODE_ENV === 'production' };
