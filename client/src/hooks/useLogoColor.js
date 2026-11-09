import { useSyncExternalStore } from 'react';
import { LOGO_COLORS } from '../data/logoColors.js';

/* =============================================================================
 * Màu logo Header dùng chung: Header và thanh chọn màu nằm ở hai nhánh khác nhau của cây React.
 * Chỉ component đọc màu mới render lại khi đổi màu, và màu có sẵn ngay từ lần vẽ đầu (không nháy).
 * null = logo nguyên bản.
 * ========================================================================== */
const STORAGE_KEY = 'bh-logo-color';
const listeners = new Set();

const isKnownColor = (id) => LOGO_COLORS.some((color) => color.id === id);

function readStoredColorId() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return isKnownColor(id) ? id : null;
  } catch {
    return null; // trình duyệt chặn localStorage: dùng logo nguyên bản
  }
}

function persistColorId(id) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Không lưu được thì màu vẫn đổi trong lần truy cập này
  }
}

let selectedId = readStoredColorId();

function applyColorId(id) {
  selectedId = id;
  listeners.forEach((notify) => notify());
}

// Tab khác của cùng trình duyệt đổi màu → tab này đổi theo
function onStorageChange(event) {
  if (event.key === STORAGE_KEY) applyColorId(readStoredColorId());
}

function subscribe(notify) {
  if (listeners.size === 0) window.addEventListener('storage', onStorageChange);
  listeners.add(notify);
  return () => {
    listeners.delete(notify);
    if (listeners.size === 0) window.removeEventListener('storage', onStorageChange);
  };
}

/** Chọn màu; chọn lại đúng màu đang dùng thì trở về logo nguyên bản */
function toggleLogoColor(id) {
  const nextId = id === selectedId ? null : id;
  persistColorId(nextId);
  applyColorId(nextId);
}

/** @returns {{ color: typeof LOGO_COLORS[number] | null, toggleColor: (id: string) => void }} */
export function useLogoColor() {
  const id = useSyncExternalStore(subscribe, () => selectedId);
  return { color: LOGO_COLORS.find((c) => c.id === id) ?? null, toggleColor: toggleLogoColor };
}
