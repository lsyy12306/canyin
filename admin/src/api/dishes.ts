import { get, post, put, del } from './client';
import type { Dish, DishCategory, ListData } from '../types';

export function getDishes(params?: Record<string, unknown>) {
  return get<ListData<Dish>>('/admin/dishes', { params });
}

export function createDish(data: Partial<Dish>) {
  return post<Dish>('/admin/dishes', data);
}

export function updateDish(id: number, data: Partial<Dish>) {
  return put<Dish>(`/admin/dishes/${id}`, data);
}

export function deleteDish(id: number) {
  return del<void>(`/admin/dishes/${id}`);
}

/** GET /api/dish-categories -> [{id,key,name,...}] 供菜品表单选择分类 */
export function getDishCategories() {
  return get<DishCategory[]>('/dish-categories');
}
