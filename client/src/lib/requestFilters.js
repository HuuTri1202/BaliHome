/* =============================================================================
 * Lọc + tìm trong "Yêu cầu của tôi" (chạy trên trình duyệt: khách có tối đa 50 yêu cầu gần nhất).
 * Nhóm trạng thái theo cách khách nghĩ: còn đang làm / đã xong / đã huỷ.
 * ========================================================================== */
export const REQUEST_GROUPS = [
  { key: 'tat-ca', label: 'Tất cả', statuses: null },
  { key: 'dang-xu-ly', label: 'Đang xử lý', statuses: ['NEW', 'CONTACTED', 'IN_PROGRESS'] },
  { key: 'hoan-thanh', label: 'Hoàn thành', statuses: ['DONE'] },
  { key: 'da-huy', label: 'Đã huỷ', statuses: ['CANCELLED'] },
];
export const DEFAULT_GROUP = REQUEST_GROUPS[0].key;

/** Bỏ dấu tiếng Việt + chữ thường: "Thiết kế" → "thiet ke"; khách gõ có dấu hay không đều tìm được */
export const foldText = (text) =>
  String(text ?? '')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();

const groupOf = (key) => REQUEST_GROUPS.find((group) => group.key === key) ?? REQUEST_GROUPS[0];

const searchableText = (request) => foldText([request.code, request.needLabel, request.company, request.message].filter(Boolean).join(' '));

/** Số yêu cầu trong từng nhóm (hiện trên nút lọc) */
export function countByGroup(requests) {
  return Object.fromEntries(
    REQUEST_GROUPS.map(({ key, statuses }) => [key, statuses ? requests.filter((r) => statuses.includes(r.status)).length : requests.length])
  );
}

/**
 * @param {Array<{ code: string, status: string, needLabel?: string, company?: string, message?: string }>} requests
 * @param {{ group?: string, query?: string }} filters
 */
export function filterRequests(requests, { group = DEFAULT_GROUP, query = '' } = {}) {
  const { statuses } = groupOf(group);
  const words = foldText(query).split(/\s+/).filter(Boolean);
  return requests.filter((request) => {
    if (statuses && !statuses.includes(request.status)) return false;
    if (words.length === 0) return true;
    const text = searchableText(request);
    return words.every((word) => text.includes(word));
  });
}
