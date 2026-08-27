import { get, post, put, del } from './client';
import type { Store, ListData } from '../types';

export function getStores(params?: Record<string, unknown>) {
  return get<ListData<Store>>('/admin/stores', { params });
}

export function createStore(data: Partial<Store>) {
  return post<Store>('/admin/stores', data);
}

export function updateStore(id: number, data: Partial<Store>) {
  return put<Store>(`/admin/stores/${id}`, data);
}

export function deleteStore(id: number) {
  return del<void>(`/admin/stores/${id}`);
}
