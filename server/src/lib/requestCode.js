import { randomInt } from 'node:crypto';

const TIME_ZONE = 'Asia/Ho_Chi_Minh';
const SHORT_CODE_DIGITS = 4;
const LONG_CODE_DIGITS = 6; // dự phòng khi dải 4 chữ số của năm đã gần đầy
const SHORT_CODE_ATTEMPTS = 8;
const MAX_ATTEMPTS = 12;

/** Mã khách đọc khi gọi hotline, vd. BLH-2026-8921. Năm theo giờ Việt Nam. */
export function buildRequestCode(date = new Date(), digits = SHORT_CODE_DIGITS) {
  const year = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric' }).format(date);
  return `BLH-${year}-${randomInt(10 ** (digits - 1), 10 ** digits)}`;
}

const isCodeCollision = (error) =>
  error?.code === 'P2002' && [error.meta?.target].flat().some((field) => String(field).includes('code'));

/**
 * Tạo bản ghi với một mã chưa ai dùng; ràng buộc unique trong DB là nguồn sự thật, trùng thì sinh mã khác.
 * @template T
 * @param {(code: string) => Promise<T>} createRecord
 * @param {typeof buildRequestCode} [buildCode]
 * @returns {Promise<T>}
 */
export async function createWithUniqueCode(createRecord, buildCode = buildRequestCode) {
  for (let attempt = 1; ; attempt += 1) {
    const digits = attempt <= SHORT_CODE_ATTEMPTS ? SHORT_CODE_DIGITS : LONG_CODE_DIGITS;
    try {
      return await createRecord(buildCode(new Date(), digits));
    } catch (error) {
      if (attempt >= MAX_ATTEMPTS || !isCodeCollision(error)) throw error;
    }
  }
}
