import crypto from 'node:crypto';
import { env } from '../config/env.js';

/**
 * Upload trực tiếp từ trình duyệt lên Cloudinary bằng chữ ký do server cấp.
 * File KHÔNG đi qua server (Render free không giữ file khi deploy lại).
 * Server chỉ ký các tham số cố định (folder, timestamp) → client không đổi được thư mục.
 * Tài liệu: https://cloudinary.com/documentation/authentication_signatures
 */
export const UPLOAD_FOLDER = 'balihome/requests';
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB / file (giới hạn gói free)
export const MAX_FILES = 5;

export const cloudinaryEnabled = () =>
  Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);

/** Chữ ký = SHA-1( các tham số sắp xếp a→z nối bằng & + api_secret ) */
export function signUpload() {
  const params = { folder: UPLOAD_FOLDER, timestamp: Math.floor(Date.now() / 1000) };
  const toSign = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
  const signature = crypto.createHash('sha1').update(toSign + env.CLOUDINARY_API_SECRET).digest('hex');
  return {
    ...params,
    signature,
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    maxBytes: MAX_FILE_BYTES,
    maxFiles: MAX_FILES,
  };
}

/**
 * Chỉ chấp nhận file nằm đúng tài khoản + đúng thư mục của Bali Home.
 * Phân tích URL thay vì so chuỗi: new URL() đã chuẩn hoá "..", nên link kiểu
 * /<cloud>/../<cloud-khác>/x.jpg không lọt qua; publicId phải nằm đúng trong đường dẫn.
 */
export function isOwnUpload({ url, publicId }) {
  if (!cloudinaryEnabled() || typeof url !== 'string' || typeof publicId !== 'string') return false;
  if (!publicId.startsWith(`${UPLOAD_FOLDER}/`) || publicId.includes('..')) return false;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return (
    parsed.protocol === 'https:' &&
    parsed.hostname === 'res.cloudinary.com' &&
    parsed.pathname.startsWith(`/${env.CLOUDINARY_CLOUD_NAME}/`) &&
    parsed.pathname.includes(`/${publicId}`)
  );
}
