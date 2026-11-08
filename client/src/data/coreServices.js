import { GlobeIcon, MegaphoneIcon, PenIcon, PrinterIcon } from '../components/ui/icons.jsx';

/**
 * 4 dịch vụ cốt lõi hiển thị ở Hero (badge) và khối Dịch vụ (card).
 * Tĩnh, không gọi API → trang chủ luôn đầy đủ kể cả khi server đang khởi động.
 * tone: màu phân loại theo dịch vụ, đo được từ 4.83:1 trở lên ở cả chế độ sáng và tối.
 */
export const CORE_SERVICES = [
  {
    slug: 'in-an',
    title: 'In ấn',
    badge: 'In ấn sắc nét',
    line: 'Đúng màu, giao tận nơi',
    Icon: PrinterIcon,
    tone: 'bg-[color-mix(in_srgb,#38bdf8_18%,var(--ground))] text-sky-700 dark:text-sky-300',
  },
  {
    slug: 'design',
    title: 'Design',
    badge: 'Thiết kế UI/UX',
    line: 'Thương hiệu nhất quán mọi kênh',
    Icon: PenIcon,
    tone: 'bg-[color-mix(in_srgb,#fb7185_18%,var(--ground))] text-rose-700 dark:text-rose-300',
  },
  {
    slug: 'web',
    title: 'Web',
    badge: 'Website chuyên nghiệp',
    line: 'Nhanh, chuẩn điện thoại',
    Icon: GlobeIcon,
    tone: 'bg-[color-mix(in_srgb,#34d399_18%,var(--ground))] text-emerald-700 dark:text-emerald-300',
  },
  {
    slug: 'marketing',
    title: 'Marketing',
    badge: 'Marketing',
    line: 'Chiến dịch đo được kết quả',
    Icon: MegaphoneIcon,
    tone: 'bg-[color-mix(in_srgb,#fbbf24_18%,var(--ground))] text-amber-800 dark:text-amber-300',
  },
];
