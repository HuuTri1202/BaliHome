import { useState } from 'react';
import { CheckIcon, CopyIcon } from '../ui/icons.jsx';

const COPIED_FEEDBACK_MS = 2000;

/** Thẻ hiện mã yêu cầu sau khi gửi thành công, có nút sao chép để đọc khi gọi hotline */
export default function RequestCode({ code }) {
  const [copyState, setCopyState] = useState('idle'); // idle | copied | failed

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), COPIED_FEEDBACK_MS);
    } catch {
      setCopyState('failed'); // trình duyệt chặn clipboard: mã vẫn hiện để khách tự ghi lại
    }
  };

  if (!code) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ground p-5">
      <p>
        <span className="block text-sm text-ink-2">Mã yêu cầu của bạn</span>
        <span className="font-display text-[1.75rem] leading-tight tabular-nums">{code}</span>
      </p>
      <button type="button" onClick={copy} className="inline-flex items-center gap-2 rounded-full bg-ground-3 px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-line">
        {copyState === 'copied' ? <CheckIcon className="h-4 w-4 text-success" /> : <CopyIcon className="h-4 w-4" />}
        <span aria-live="polite">{copyState === 'copied' ? 'Đã sao chép' : copyState === 'failed' ? 'Hãy ghi lại mã' : 'Sao chép'}</span>
      </button>
    </div>
  );
}
