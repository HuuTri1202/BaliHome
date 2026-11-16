import { useState } from 'react';
import { mapDirectionsUrl, mapEmbedUrl } from '../data/siteContact.js';
import { ArrowUpRightIcon, MapPinIcon } from './ui/icons.jsx';

/**
 * Bản đồ Google Maps của văn phòng. Khung bản đồ chỉ tải khi khách cuộn gần tới (loading="lazy")
 * → không làm chậm phần đầu trang. Kèm link "Chỉ đường" mở Google Maps (app trên điện thoại).
 * @param {{ address: string, className?: string }} props
 */
export default function OfficeMap({ address, className = '' }) {
  const [isLoaded, setIsLoaded] = useState(false);
  if (!address) return null;
  return (
    <div className={`grid gap-3 ${className}`}>
      <div className="relative overflow-hidden rounded-3xl bg-ground-2 ring-1 ring-ink/10">
        {!isLoaded && (
          <div className="absolute inset-0 grid place-items-center text-ink-2" aria-hidden="true">
            <MapPinIcon className="h-8 w-8 animate-pulse" />
          </div>
        )}
        <iframe
          title={`Bản đồ: ${address}`}
          src={mapEmbedUrl(address)}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsLoaded(true)}
          className="relative block aspect-[16/10] w-full border-0 sm:aspect-[16/9]"
        />
      </div>
      <a
        href={mapDirectionsUrl(address)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 justify-self-start text-[15px] font-semibold text-action underline-offset-4 hover:underline"
      >
        Chỉ đường trên Google Maps <ArrowUpRightIcon className="h-4 w-4" />
      </a>
    </div>
  );
}
