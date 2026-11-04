import { useCallback, useEffect, useRef, useState } from 'react';
import { uploadsApi } from '../lib/api.js';

export const ACCEPT = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.ai,.psd,.png,.jpg,.jpeg,.webp,.gif,.svg,.mp4,.mov';
const DEFAULT_MAX_BYTES = 10 * 1024 * 1024;
const DEFAULT_MAX_FILES = 5;

/** Tải 1 file lên Cloudinary bằng chữ ký server cấp; báo tiến trình 0–100 */
function uploadOne(file, sig, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('api_key', sig.apiKey);
    form.append('timestamp', String(sig.timestamp));
    form.append('signature', sig.signature);
    form.append('folder', sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', sig.uploadUrl);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let body = null;
      try { body = JSON.parse(xhr.responseText); } catch { /* bỏ qua */ }
      if (xhr.status >= 200 && xhr.status < 300 && body?.secure_url) {
        resolve({ url: body.secure_url, publicId: body.public_id, fileName: file.name, bytes: body.bytes ?? file.size, format: body.format ?? file.name.split('.').pop() });
      } else {
        reject(new Error(body?.error?.message ? `Không tải được: ${body.error.message}` : 'Không tải được tệp, vui lòng thử lại.'));
      }
    };
    xhr.onerror = () => reject(new Error('Mất kết nối khi tải tệp.'));
    xhr.send(form);
  });
}

/**
 * Quản lý danh sách tệp đính kèm của form.
 * items: [{ key, name, size, progress, status: 'uploading'|'done'|'error', error?, result? }]
 */
export function useUploads(initial = []) {
  const [enabled, setEnabled] = useState(null); // null = đang kiểm tra
  const [items, setItems] = useState(() => initial.map((r) => ({ key: r.publicId, name: r.fileName, size: r.bytes, progress: 100, status: 'done', result: r })));
  const [error, setError] = useState('');
  const limits = useRef({ maxBytes: DEFAULT_MAX_BYTES, maxFiles: DEFAULT_MAX_FILES });

  useEffect(() => {
    uploadsApi.config().then((c) => setEnabled(Boolean(c.enabled))).catch(() => setEnabled(false));
  }, []);

  const patch = (key, p) => setItems((list) => list.map((it) => (it.key === key ? { ...it, ...p } : it)));

  const addFiles = useCallback(async (fileList) => {
    setError('');
    const files = Array.from(fileList);
    const { maxBytes, maxFiles } = limits.current;
    let room = maxFiles - items.filter((i) => i.status !== 'error').length;
    for (const file of files) {
      if (room <= 0) { setError(`Tối đa ${maxFiles} tệp.`); break; }
      if (file.size > maxBytes) { setError(`“${file.name}” vượt quá ${Math.round(maxBytes / 1048576)} MB.`); continue; }
      room -= 1;
      const key = `${file.name}-${file.size}-${crypto.randomUUID()}`;
      setItems((list) => [...list, { key, name: file.name, size: file.size, progress: 0, status: 'uploading' }]);
      try {
        const sig = await uploadsApi.sign();
        limits.current = { maxBytes: sig.maxBytes ?? maxBytes, maxFiles: sig.maxFiles ?? maxFiles };
        const result = await uploadOne(file, sig, (progress) => patch(key, { progress }));
        patch(key, { status: 'done', progress: 100, result });
      } catch (err) {
        patch(key, { status: 'error', error: err.message });
      }
    }
  }, [items]);

  const remove = (key) => setItems((list) => list.filter((it) => it.key !== key));

  return {
    enabled,
    items,
    error,
    addFiles,
    remove,
    uploading: items.some((i) => i.status === 'uploading'),
    results: items.filter((i) => i.status === 'done').map((i) => i.result),
  };
}
