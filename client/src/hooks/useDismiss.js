import { useEffect } from 'react';

/**
 * Đóng một bảng bật ra (menu, dropdown) khi nhấn Esc (trả focus về nút mở) hoặc bấm ra ngoài vùng `rootRef`.
 * @param {boolean} isOpen
 * @param {(open: boolean) => void} setIsOpen setter của useState (ổn định giữa các lần render)
 * @param {React.RefObject<HTMLElement>} rootRef vùng tính là "bên trong" (nút + bảng)
 * @param {React.RefObject<HTMLElement>} triggerRef nút mở, nhận lại focus khi nhấn Esc
 */
export function useDismiss(isOpen, setIsOpen, rootRef, triggerRef) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen, setIsOpen, rootRef, triggerRef]);
}
