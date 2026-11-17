import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon } from '../ui/icons.jsx';
import { serviceSearchPath } from '../../lib/serviceSearch.js';

const SUGGESTIONS = ['Logo', 'Website', 'In danh thiếp', 'Quảng cáo'];

/** Ô kính "Bạn cần gì?": gõ vài chữ → mở đúng trang dịch vụ (không khớp thì mở danh sách dịch vụ) */
export default function HeroSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate(serviceSearchPath(query));
  };

  return (
    <div className="glass-card rounded-[1.75rem] p-2.5 sm:p-3">
      <form onSubmit={handleSubmit} role="search" className="flex items-center gap-2 rounded-[1.25rem] bg-white/[0.06] py-1.5 pl-5 pr-1.5 ring-1 ring-white/10 focus-within:ring-violet-300/60">
        <SearchIcon className="h-5 w-5 shrink-0 text-ink-2" />
        <label htmlFor="hero-search" className="sr-only">Bạn cần dịch vụ gì?</label>
        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Bạn cần gì? Vd: logo, website…"
          className="min-w-0 flex-1 bg-transparent py-2 text-[15px] text-white outline-none placeholder:text-ink-2"
        />
        <button type="submit" className="h-11 shrink-0 rounded-full bg-white px-5 text-sm font-semibold text-[#160f33] transition-colors hover:bg-violet-100">
          Tìm
        </button>
      </form>
      <ul className="mt-2.5 flex flex-wrap items-center gap-2 px-2 pb-0.5 text-[13px]" aria-label="Gợi ý tìm nhanh">
        {SUGGESTIONS.map((label) => (
          <li key={label}>
            <button
              type="button"
              onClick={() => navigate(serviceSearchPath(label))}
              className="rounded-full bg-white/[0.07] px-3 py-1.5 text-ink-2 ring-1 ring-white/10 transition-colors hover:bg-white/15 hover:text-white"
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
