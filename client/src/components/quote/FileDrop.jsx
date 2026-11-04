import { useId, useState } from 'react';
import { ACCEPT } from '../../hooks/useUploads.js';
import { fmtBytes } from '../../data/requests.js';
import { AlertIcon, CheckIcon } from '../ui/icons.jsx';
import { Spinner } from '../ui/Button.jsx';

/** Vùng kéo-thả / chọn tệp + danh sách tệp kèm tiến trình. Hoạt động bằng bàn phím (label → input). */
export default function FileDrop({ uploads }) {
  const id = useId();
  const [over, setOver] = useState(false);
  const { enabled, items, error, addFiles, remove } = uploads;

  if (enabled === null) return <div className="h-40 animate-pulse rounded-3xl bg-ground" aria-hidden="true" />;
  if (!enabled) {
    return (
      <div className="rounded-3xl bg-ground p-6 text-ink">
        <p className="font-semibold">Tính năng tải tệp đang tạm tắt</p>
        <p className="mt-1 text-ink-2">Bạn có thể dán đường link (Google Drive, Dropbox…) vào phần mô tả ở bước trước, hoặc gửi tệp khi Bali Home liên hệ.</p>
      </div>
    );
  }

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-action ${
          over ? 'border-action bg-[color-mix(in_srgb,var(--action)_8%,var(--ground))]' : 'border-line bg-ground hover:border-ink-2/50'
        }`}
      >
        <span className="font-display text-2xl">Kéo thả tệp vào đây</span>
        <span className="text-ink-2">hoặc <span className="font-semibold text-action underline underline-offset-4">chọn từ máy</span></span>
        <span className="text-sm text-ink-2">PDF, Word, Excel, ảnh, AI, PSD, ZIP… · tối đa 5 tệp, mỗi tệp 10 MB</span>
        <input id={id} type="file" multiple accept={ACCEPT} className="sr-only" onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }} />
      </label>

      {error && (
        <p role="alert" className="mt-3 flex items-center gap-1.5 text-sm font-medium text-signal"><AlertIcon className="h-4 w-4" /> {error}</p>
      )}

      {items.length > 0 && (
        <ul className="mt-4 grid gap-2" aria-live="polite">
          {items.map((it) => (
            <li key={it.key} className="flex items-center gap-3 rounded-2xl bg-ground px-4 py-3">
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${it.status === 'done' ? 'bg-success text-white' : it.status === 'error' ? 'bg-signal text-white' : 'bg-ground-3 text-action'}`}>
                {it.status === 'done' ? <CheckIcon className="h-4 w-4" /> : it.status === 'error' ? <AlertIcon className="h-4 w-4" /> : <Spinner className="h-4 w-4" />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{it.name}</span>
                {it.status === 'uploading' ? (
                  <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-ground-3" role="progressbar" aria-valuenow={it.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Đang tải ${it.name}`}>
                    <span className="block h-full rounded-full bg-action transition-all" style={{ width: `${it.progress}%` }} />
                  </span>
                ) : (
                  <span className={`text-sm ${it.status === 'error' ? 'text-signal' : 'text-ink-2'}`}>{it.status === 'error' ? it.error : fmtBytes(it.size)}</span>
                )}
              </span>
              {it.status !== 'uploading' && (
                <button type="button" onClick={() => remove(it.key)} className="rounded-full px-3 py-1.5 text-sm font-semibold text-ink-2 hover:bg-ground-3 hover:text-ink" aria-label={`Bỏ tệp ${it.name}`}>
                  Bỏ
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
