import { fmtBytes } from '../../data/requests.js';
import { ArrowUpRightIcon } from '../ui/icons.jsx';

/** Danh sách tệp đính kèm (mở ở tab mới) */
export default function Attachments({ files = [] }) {
  if (!files.length) return <p className="text-ink-2">Không có tệp đính kèm.</p>;
  return (
    <ul className="grid gap-2">
      {files.map((f) => (
        <li key={f.id ?? f.url}>
          <a
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-2xl bg-ground px-4 py-3 transition-colors hover:bg-ground-3"
          >
            <span className="min-w-0">
              <span className="block truncate font-semibold">{f.fileName}</span>
              <span className="text-sm text-ink-2">{(f.format || '').toUpperCase()} · {fmtBytes(f.bytes)}</span>
            </span>
            <ArrowUpRightIcon className="h-5 w-5 shrink-0" />
          </a>
        </li>
      ))}
    </ul>
  );
}
