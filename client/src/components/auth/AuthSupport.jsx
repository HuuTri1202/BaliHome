import { CONTACT, CONTACT_ICONS, SOCIAL_LINKS, toTelHref } from '../../data/siteContact.js';

export const ZALO_URL = SOCIAL_LINKS.find(({ label }) => label === 'Zalo')?.href ?? null;

/** Lối tắt khi khách không vào được tài khoản: nhắn Zalo hoặc gọi hotline. Thiếu thông tin nào thì ẩn mục đó. */
export default function AuthSupport() {
  const { hotline } = CONTACT;
  if (!ZALO_URL && !hotline) return null;
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ground-2 px-4 py-3 ring-1 ring-ink/5">
      {ZALO_URL && <img src={CONTACT_ICONS.zalo} alt="" width="36" height="36" className="h-9 w-9 shrink-0 rounded-[28%]" />}
      <p className="min-w-0 text-sm leading-snug text-ink-2">
        Không vào được tài khoản?{' '}
        {ZALO_URL && (
          <a href={ZALO_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-action underline-offset-4 hover:underline">
            Nhắn Zalo cho Bali Home
          </a>
        )}
        {ZALO_URL && hotline && ' hoặc gọi '}
        {!ZALO_URL && hotline && 'Gọi '}
        {hotline && (
          <a href={toTelHref(hotline)} className="whitespace-nowrap font-semibold text-ink underline-offset-4 hover:underline">
            {hotline}
          </a>
        )}
      </p>
    </div>
  );
}
