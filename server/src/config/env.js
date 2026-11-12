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
  // Cloudinary (lưu file đính kèm). Không đặt → tính năng tải file tự tắt, phần còn lại vẫn chạy.
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Hoặc dán 1 dòng gộp từ trang Cloudinary: cloudinary://<api_key>:<api_secret>@<cloud_name>
  CLOUDINARY_URL: z.string().optional(),
  // Khoá chung với Cloudflare Worker (cloudflare/worker.js) để tin IP thật của khách. Không đặt → bỏ qua.
  PROXY_SECRET: z.string().min(32, 'PROXY_SECRET phải dài tối thiểu 32 ký tự').optional(),
  // OAuth Client ID (loại Web) trên Google Cloud. Không đặt → nút "Tiếp tục với Google" tự ẩn.
  GOOGLE_CLIENT_ID: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() || undefined : v),
    z.string().regex(/\.apps\.googleusercontent\.com$/, 'GOOGLE_CLIENT_ID phải có dạng ....apps.googleusercontent.com').optional()
  ),
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

/** Tách CLOUDINARY_URL → 3 biến riêng (biến riêng nếu đã đặt thì được ưu tiên) */
function cloudinaryFromUrl(raw) {
  // Không chấp nhận chữ mẫu "<your_api_key>" (dán nhầm từ trang Cloudinary khi chưa thay khoá thật)
  const m = /^cloudinary:\/\/([^:@\s<>]+):([^@\s<>]+)@([^/\s?<>]+)\/?$/.exec((raw ?? '').trim());
  if (!m) {
    if (raw) console.warn('⚠ CLOUDINARY_URL sai định dạng hoặc còn chữ mẫu <your_api_key> — cần cloudinary://KHOA:BI_MAT@cloud_name → tắt tải tệp.');
    return {};
  }
  return { CLOUDINARY_API_KEY: m[1], CLOUDINARY_API_SECRET: m[2], CLOUDINARY_CLOUD_NAME: m[3] };
}

const fromUrl = cloudinaryFromUrl(parsed.data.CLOUDINARY_URL);
export const env = {
  ...parsed.data,
  CLOUDINARY_CLOUD_NAME: parsed.data.CLOUDINARY_CLOUD_NAME || fromUrl.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: parsed.data.CLOUDINARY_API_KEY || fromUrl.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: parsed.data.CLOUDINARY_API_SECRET || fromUrl.CLOUDINARY_API_SECRET,
  isProd: parsed.data.NODE_ENV === 'production',
};
