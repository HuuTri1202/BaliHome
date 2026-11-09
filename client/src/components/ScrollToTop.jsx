import { useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { smoothScrollIntoView } from '../lib/contactForm.js';

const HASH_TARGET_WAIT_MS = 3000;

/** URL do người dùng gõ có thể chứa % sai định dạng; không được để lỗi làm sập cả trang */
function decodeHashId(hash) {
  try {
    return decodeURIComponent(hash.slice(1));
  } catch {
    return hash.slice(1);
  }
}

// 'instant': html đang đặt scroll-behavior: smooth, không muốn thấy trang trôi khi chuyển trang
const scrollToPageTop = () => window.scrollTo({ top: 0, behavior: 'instant' });

/** Đợi phần tử xuất hiện (trang render sau khi tải) rồi cuộn tới; không có thì về đầu trang. Trả về hàm huỷ. */
function scrollToHashTarget(hash, onDone) {
  const id = decodeHashId(hash);
  const deadline = performance.now() + HASH_TARGET_WAIT_MS;
  let frame = requestAnimationFrame(function attempt() {
    const target = document.getElementById(id);
    if (!target && performance.now() < deadline) {
      frame = requestAnimationFrame(attempt);
      return;
    }
    if (target) smoothScrollIntoView(target);
    else scrollToPageTop();
    onDone();
  });
  return () => cancelAnimationFrame(frame);
}

/**
 * Điều khiển vị trí cuộn khi đổi URL:
 *  - URL có #hash → cuộn tới phần tử đó (kể cả khi mở thẳng link, lúc trình duyệt chưa thấy phần tử).
 *  - Sang trang khác → về đầu trang.
 *  - Back/Forward → để trình duyệt khôi phục vị trí cũ.
 */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();
  const navigationType = useNavigationType();
  const hasHandledFirstLoad = useRef(false);

  useLayoutEffect(() => {
    const isFirstLoad = !hasHandledFirstLoad.current;
    const isBackForward = navigationType === 'POP' && !isFirstLoad;

    if (hash && !isBackForward) {
      return scrollToHashTarget(hash, () => { hasHandledFirstLoad.current = true; });
    }
    hasHandledFirstLoad.current = true;
    if (navigationType === 'POP' || hash) return undefined;
    scrollToPageTop();
    return undefined;
  }, [pathname, hash]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
