/**
 * Màu khách chọn cho logo trên Header.
 * needsOutline: trắng và đen có thể trùng màu nền Header, cần viền mảnh để logo không biến mất.
 */
export const LOGO_COLORS = [
  { id: 'white', name: 'Trắng', value: '#ffffff', needsOutline: true },
  { id: 'black', name: 'Đen', value: '#0f172a', needsOutline: true }, // slate-900
  { id: 'blue', name: 'Xanh dương', value: '#1e5bd8', needsOutline: false },
  { id: 'orange', name: 'Cam', value: '#f97316', needsOutline: false },
  { id: 'red', name: 'Đỏ', value: '#e5232d', needsOutline: false },
];
