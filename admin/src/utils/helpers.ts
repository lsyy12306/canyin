import type { Paginated } from '../types';

/** 兼容后端列表 data 为数组或 {total,items} 两种形态 */
export function normalizeList<T>(data: T[] | Paginated<T> | undefined | null): T[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.items ?? [];
}

/** 价格（分）格式化为 ¥xx.xx */
export function formatPrice(fen: number | undefined | null): string {
  if (fen == null) return '-';
  return `¥${(fen / 100).toFixed(2)}`;
}

/** YYYY-MM-DDTHH:mm / 时间戳 -> YYYY-MM-DD */
export function formatDate(value?: string | null): string {
  if (!value) return '-';
  return value.slice(0, 10);
}

/** 完整日期时间展示 */
export function formatDateTime(value?: string | null): string {
  if (!value) return '-';
  return value.slice(0, 19).replace('T', ' ');
}
