// 通用工具函数

/** 价格：后端 price 为分，优先使用 price_text，否则格式化 */
export function formatPrice(price?: number, priceText?: string): string {
  if (priceText) return priceText;
  if (price === undefined || price === null) return '';
  return `¥${(price / 100).toFixed(price % 100 === 0 ? 0 : 2)}`;
}

/** 日期：2026-08-20 -> 2026年08月20日（简洁展示保留原格式亦可） */
export function formatDate(date?: string | null): string {
  if (!date) return '';
  return date.slice(0, 10);
}

/** 根据标签文案选择徽标配色（对应 UI/UX §4.5） */
export function badgeClass(tag: string): string {
  if (/(招牌|每日|现做|健康)/.test(tag)) return 'badge-fresh';
  if (/(热销|素菜|点心)/.test(tag)) return 'badge-amber';
  return 'badge-brand';
}

/** 岗位类型中文 */
export function jobTypeLabel(type?: string): string {
  switch (type) {
    case 'full_time':
      return '全职';
    case 'part_time':
      return '兼职';
    case 'intern':
      return '实习';
    default:
      return type || '';
  }
}

/** 拼接完整图片地址（后端返回相对路径时补全 baseURL） */
export function resolveImage(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http') || url.startsWith('data:')) return url;
  const base = import.meta.env.VITE_API_BASE || '/api';
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
}
