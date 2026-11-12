import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { mode: 'login', to: '/dang-nhap', label: 'Đăng nhập', shortLabel: 'Đăng nhập' },
  { mode: 'register', to: '/dang-ky', label: 'Đăng ký tài khoản mới', shortLabel: 'Đăng ký' },
];

/**
 * Chuyển giữa Đăng nhập / Đăng ký. Mỗi tab là một đường dẫn thật (/dang-nhap, /dang-ky)
 * → chia sẻ link, nút Back và tải lại trang đều đúng tab. Giữ location.state để sau khi
 * đăng nhập vẫn quay về trang khách đang muốn vào.
 * @param {{ mode: 'login'|'register' }} props
 */
export default function AuthTabs({ mode }) {
  const location = useLocation();
  const activeIndex = TABS.findIndex((tab) => tab.mode === mode);
  return (
    <nav aria-label="Đăng nhập hoặc đăng ký" className="relative grid grid-cols-2 rounded-full bg-ground-2 p-1 ring-1 ring-ink/5">
      {/* Nền trắng trượt theo tab đang chọn */}
      <span
        aria-hidden="true"
        className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-ground shadow-sm ring-1 ring-ink/5 transition-transform duration-300 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />
      {TABS.map((tab) => {
        const isActive = tab.mode === mode;
        return (
          <Link
            key={tab.mode}
            to={tab.to}
            replace
            state={location.state}
            aria-current={isActive ? 'page' : undefined}
            className={`relative z-10 flex h-11 items-center justify-center rounded-full px-3 text-[15px] font-semibold transition-colors ${isActive ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
          >
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
