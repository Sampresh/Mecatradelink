export function paginate({ page = 1, limit = 12 }) {
  const take = Math.min(Math.max(Number(limit) || 12, 1), 100);
  const current = Math.max(Number(page) || 1, 1);
  return { take, skip: (current - 1) * take, page: current };
}

export const pageMeta = ({ page, take }, total) => ({
  page,
  limit: take,
  total,
  totalPages: Math.max(Math.ceil(total / take), 1),
});
