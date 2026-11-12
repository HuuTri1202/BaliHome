import { ChatIcon, HomeIcon, KeyIcon, ShieldIcon, UserIcon } from '../components/ui/icons.jsx';

/** Các trang tài khoản, dùng chung cho menu avatar (Header), menu điện thoại và khung Cổng khách hàng */
export const ACCOUNT_LINKS = [
  { to: '/tai-khoan', label: 'Tổng quan', icon: HomeIcon, end: true },
  { to: '/tai-khoan/yeu-cau', label: 'Yêu cầu của tôi', icon: ChatIcon },
  { to: '/tai-khoan/ho-so', label: 'Hồ sơ', icon: UserIcon },
  { to: '/tai-khoan/bao-mat', label: 'Bảo mật & giao diện', icon: KeyIcon },
];

export const ADMIN_LINK = { to: '/quan-tri', label: 'Quản trị', icon: ShieldIcon };

/** Danh sách link theo vai trò */
export const accountLinksFor = (isAdmin) => (isAdmin ? [...ACCOUNT_LINKS, ADMIN_LINK] : ACCOUNT_LINKS);
