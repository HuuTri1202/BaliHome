// Nhu cầu khách chọn trong form liên hệ. ⚠ Giữ đồng bộ với server/src/validators/contact.schema.js
export const NEEDS = [
  { value: 'products', label: 'Mua sản phẩm' },
  { value: 'installation', label: 'Lắp đặt' },
  { value: 'maintenance', label: 'Bảo trì, sửa chữa' },
  { value: 'other', label: 'Tư vấn khác' },
];
export const needLabel = (v) => NEEDS.find((n) => n.value === v)?.label ?? v;

export const STATUS_LABEL = {
  NEW: 'Đã nhận',
  CONTACTED: 'Đã liên hệ',
  DONE: 'Hoàn tất',
};
