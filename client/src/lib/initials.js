/** "Nguyễn Văn An" → "VA" (2 chữ cái đầu của 2 từ cuối); không có tên → "BH" */
export const initials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(-2).map((w) => w[0]).join('').toUpperCase() || 'BH';
