import { useId, useRef, useState } from 'react';
import { ACCEPT, useUploads } from '../../hooks/useUploads.js';
import { ArrowUpIcon, PaperclipIcon, CloseIcon } from '../ui/icons.jsx';

const MAX_LENGTH = 2000;
const MAX_TEXTAREA_PX = 160;

/** Ô nhập tự giãn theo nội dung, tối đa MAX_TEXTAREA_PX */
const autoResize = (textarea) => {
  textarea.style.height = 'auto';
  textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_PX)}px`;
};

function UploadChips({ uploads }) {
  if (!uploads.items.length && !uploads.error) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {uploads.items.map((item) => (
        <span key={item.key} className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1.5 text-sm ${item.status === 'error' ? 'bg-[color-mix(in_srgb,var(--signal)_14%,var(--ground))] text-signal' : 'bg-ground-3'}`}>
          <span className="truncate">{item.name}</span>
          {item.status === 'uploading' && <span className="tabular-nums text-ink-2">{item.progress}%</span>}
          {item.status === 'error' && <span>{item.error}</span>}
          <button type="button" onClick={() => uploads.remove(item.key)} aria-label={`Bỏ tệp ${item.name}`} className="grid h-5 w-5 place-items-center rounded-full hover:bg-line">
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      {uploads.error && <span className="text-sm text-signal">{uploads.error}</span>}
    </div>
  );
}

/**
 * Thanh nhập tin: Enter để gửi, Shift+Enter xuống dòng.
 * Không gửi khi đang gõ bộ gõ tiếng Việt (Telex/VNI đang ghép chữ) để không gửi nhầm chữ dở.
 * @param {{ onSend: (body: string, attachments: object[]) => void }} props
 */
export default function ChatComposer({ onSend }) {
  const [text, setText] = useState('');
  const uploads = useUploads();
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const inputId = useId();

  const canSend = (text.trim() || uploads.results.length) && !uploads.uploading;

  const submit = () => {
    if (!canSend) return;
    onSend(text.trim(), uploads.results);
    setText('');
    uploads.clear();
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const onKeyDown = (event) => {
    const isComposing = event.nativeEvent.isComposing || event.keyCode === 229;
    if (event.key !== 'Enter' || event.shiftKey || isComposing) return;
    event.preventDefault();
    submit();
  };

  const attachTitle = uploads.enabled === false ? 'Tải tệp đang tạm tắt' : 'Đính kèm tệp hoặc hình ảnh';

  return (
    <form onSubmit={(event) => { event.preventDefault(); submit(); }} className="mt-4 border-t border-ink/10 pt-4">
      <UploadChips uploads={uploads} />
      <div className="flex items-end gap-2 rounded-3xl border border-field-line bg-field p-1.5 focus-within:border-action focus-within:ring-2 focus-within:ring-action">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={!uploads.enabled}
          aria-label={attachTitle}
          title={attachTitle}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-ground-3 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <PaperclipIcon className="h-5 w-5" />
        </button>
        <input ref={fileInputRef} type="file" multiple accept={ACCEPT} className="hidden" onChange={(event) => { uploads.addFiles(event.target.files); event.target.value = ''; }} />
        <label htmlFor={inputId} className="sr-only">Nhập tin nhắn</label>
        <textarea
          ref={textareaRef}
          id={inputId}
          rows={1}
          maxLength={MAX_LENGTH}
          value={text}
          onChange={(event) => { setText(event.target.value); autoResize(event.target); }}
          onKeyDown={onKeyDown}
          placeholder="Nhập tin nhắn…"
          className="max-h-40 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-[15px] text-ink outline-none placeholder:text-ink-2"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Gửi tin nhắn"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-action text-on-action transition-[transform,opacity] hover:bg-action-hover active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUpIcon className="h-5 w-5" />
        </button>
      </div>
      <p className="mt-1.5 hidden px-2 text-xs text-ink-2 sm:block">Enter để gửi · Shift + Enter để xuống dòng</p>
    </form>
  );
}
