import { useEffect, useId } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PortalLayout, { Panel } from '../../components/portal/PortalLayout.jsx';
import RequestList from '../../components/portal/RequestList.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { SearchIcon } from '../../components/ui/icons.jsx';
import { useMyRequests } from '../../hooks/useMyRequests.js';
import { DEFAULT_GROUP, REQUEST_GROUPS, countByGroup, filterRequests } from '../../lib/requestFilters.js';

const GROUP_PARAM = 'trang-thai';
const QUERY_PARAM = 'q';

const chipClass = (isActive) =>
  `inline-flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-semibold transition-colors ${
    isActive ? 'bg-ink text-ground' : 'bg-ground text-ink hover:bg-ground-3'
  }`;

/** Nút lọc theo nhóm trạng thái + ô tìm kiếm. Bộ lọc nằm trên URL → tải lại / chia sẻ link vẫn giữ. */
function RequestFilters({ counts, group, query, onGroupChange, onQueryChange }) {
  const searchId = useId();
  return (
    <div className="mb-6 grid gap-4 lg:flex lg:items-center lg:justify-between">
      <div role="group" aria-label="Lọc theo trạng thái" className="flex flex-wrap gap-2">
        {REQUEST_GROUPS.map(({ key, label }) => (
          <button key={key} type="button" onClick={() => onGroupChange(key)} aria-pressed={group === key} className={chipClass(group === key)}>
            {label}
            <span className={`rounded-full px-2 text-sm tabular-nums ${group === key ? 'bg-ground/20' : 'bg-ground-3'}`}>{counts[key]}</span>
          </button>
        ))}
      </div>
      <div className="relative lg:w-80">
        <label htmlFor={searchId} className="sr-only">Tìm yêu cầu</label>
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-2" />
        <input
          id={searchId}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Tìm mã BLH, dịch vụ, nội dung…"
          className="h-12 w-full rounded-full border border-field-line bg-field pl-12 pr-4 text-[15px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-ink-2 focus:border-action focus:ring-2 focus:ring-action"
        />
      </div>
    </div>
  );
}

/** /tai-khoan/yeu-cau — toàn bộ yêu cầu tài khoản đã gửi: lọc theo trạng thái, tìm theo mã / dịch vụ / nội dung */
export default function MyRequestsPage() {
  const data = useMyRequests();
  const [searchParams, setSearchParams] = useSearchParams();
  const group = REQUEST_GROUPS.some(({ key }) => key === searchParams.get(GROUP_PARAM)) ? searchParams.get(GROUP_PARAM) : DEFAULT_GROUP;
  const query = searchParams.get(QUERY_PARAM) ?? '';

  useEffect(() => { document.title = 'Yêu cầu của tôi — Bali Home'; }, []);

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(changes).forEach(([key, value]) => (value && value !== DEFAULT_GROUP ? next.set(key, value) : next.delete(key)));
    setSearchParams(next, { replace: true });
  };
  const clearFilters = () => setSearchParams({}, { replace: true });

  const items = data.status === 'ready' ? data.items : [];
  const visible = filterRequests(items, { group, query });
  const isFiltering = group !== DEFAULT_GROUP || query.trim() !== '';
  const hasNoMatch = data.status === 'ready' && items.length > 0 && visible.length === 0;

  return (
    <PortalLayout
      title="Yêu cầu của tôi"
      subtitle={data.status === 'ready' ? `${items.length} yêu cầu đã gửi` : undefined}
      actions={<Button as={Link} to="/bao-gia" bubble>Yêu cầu báo giá mới</Button>}
    >
      <Panel>
        {items.length > 0 && (
          <RequestFilters
            counts={countByGroup(items)}
            group={group}
            query={query}
            onGroupChange={(key) => updateParams({ [GROUP_PARAM]: key })}
            onQueryChange={(value) => updateParams({ [QUERY_PARAM]: value })}
          />
        )}
        {hasNoMatch ? (
          <div className="grid justify-items-start gap-3 rounded-2xl bg-ground p-6" role="status">
            <p>Không có yêu cầu nào khớp bộ lọc.</p>
            {isFiltering && <Button variant="soft" size="sm" onClick={clearFilters}>Xoá bộ lọc</Button>}
          </div>
        ) : (
          <RequestList data={data.status === 'ready' ? { ...data, items: visible } : data} />
        )}
        {isFiltering && !hasNoMatch && data.status === 'ready' && (
          <p className="mt-4 text-sm text-ink-2" role="status">Đang hiện {visible.length}/{items.length} yêu cầu.</p>
        )}
      </Panel>
    </PortalLayout>
  );
}
