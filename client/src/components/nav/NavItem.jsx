import { NavLink } from 'react-router-dom';

/**
 * Một mục điều hướng. Mục trỏ tới vị trí trong trang chủ (/#...) dùng thẻ <a> để trình duyệt tự cuộn.
 * @param {{ href: string, end?: boolean, className: (isActive: boolean) => string, children: React.ReactNode }} props
 */
export default function NavItem({ href, end, className, children }) {
  if (href.startsWith('/#')) return <a href={href} className={className(false)}>{children}</a>;
  return (
    <NavLink to={href} end={end} className={({ isActive }) => className(isActive)}>
      {children}
    </NavLink>
  );
}
