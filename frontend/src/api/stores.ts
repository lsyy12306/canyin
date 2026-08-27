import { get } from './client';
import type { Store, ListResponse } from '../types';

// 兼容后端返回数组或 { total, items } 两种形态
export function getStores(): Promise<Store[]> {
  return get<Store[] | ListResponse<Store>>('/stores').then((d) =>
    Array.isArray(d) ? d : (d as ListResponse<Store>).items ?? [],
  );
}

export function getStore(slug: string): Promise<Store> {
  return get<Store>(`/stores/${slug}`);
}
