/* =============================================================================
 * Gọi lại tự động với thời gian chờ tăng theo hàm mũ (exponential backoff).
 * Không phụ thuộc trình duyệt hay React → kiểm thử được bằng `node --test`.
 * ========================================================================== */

const MAX_JITTER_MS = 250;

export class TimeoutError extends Error {
  constructor(timeoutMs) {
    super(`Hết thời gian chờ sau ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Lỗi có khả năng tự hết nếu thử lại: mất mạng (0), timeout, 408, 429, 5xx.
 * Lỗi 4xx còn lại là lỗi chắc chắn → thử lại cũng vô ích.
 * @param {{ status?: number }} error
 */
export function isTransientError(error) {
  if (error instanceof TimeoutError) return true;
  const status = error?.status;
  return status === 0 || status === 408 || status === 429 || status >= 500;
}

/**
 * Thời gian chờ trước lần thử lại thứ `retryIndex` (đếm từ 0): 1s, 2s, 4s…
 * Cộng thêm một khoảng ngẫu nhiên để nhiều trình duyệt không cùng dội vào server đang khởi động.
 */
export function backoffDelay(retryIndex, baseDelayMs, random = Math.random) {
  return baseDelayMs * 2 ** retryIndex + random() * MAX_JITTER_MS;
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** Chạy `task` một lần; quá `timeoutMs` thì huỷ request và ném TimeoutError */
async function runWithTimeout(task, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await task(controller.signal);
  } catch (error) {
    throw controller.signal.aborted ? new TimeoutError(timeoutMs) : error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Chạy `task`, lỗi tạm thời thì thử lại tối đa `retries` lần rồi mới ném lỗi cuối cùng.
 * @template T
 * @param {(signal: AbortSignal) => Promise<T>} task
 * @param {{ retries?: number, baseDelayMs?: number, timeoutMs?: number,
 *           shouldRetry?: (error: unknown) => boolean, sleep?: (ms: number) => Promise<void> }} [options]
 * @returns {Promise<T>}
 */
export async function withRetry(task, options = {}) {
  const { retries = 3, baseDelayMs = 1000, timeoutMs = 10_000, shouldRetry = isTransientError, sleep = wait } = options;

  for (let retryIndex = 0; ; retryIndex += 1) {
    try {
      return await runWithTimeout(task, timeoutMs);
    } catch (error) {
      if (retryIndex >= retries || !shouldRetry(error)) throw error;
      await sleep(backoffDelay(retryIndex, baseDelayMs));
    }
  }
}
