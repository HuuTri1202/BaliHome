import { useState } from 'react';

const STORAGE_KEY = 'bh-logo-tone';
const TONES = ['white', 'dark'];

function readStoredTone() {
  try {
    const tone = localStorage.getItem(STORAGE_KEY);
    return TONES.includes(tone) ? tone : null;
  } catch {
    return null; // trình duyệt chặn localStorage: dùng màu mặc định theo giao diện
  }
}

/**
 * Màu chữ "BALI HOME" trên Header do khách chọn: 'white' | 'dark' | null (mặc định theo giao diện).
 * Lưu localStorage để giữ màu khi chuyển trang (Header được vẽ lại ở mỗi trang).
 */
export function useLogoTone() {
  const [tone, setTone] = useState(readStoredTone);

  const toggleTone = () => {
    const next = tone === 'white' ? 'dark' : 'white';
    setTone(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Không lưu được thì màu vẫn đổi trong trang hiện tại
    }
  };

  return { tone, toggleTone };
}
