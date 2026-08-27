import { get } from './client';
import type { DishCategory, DishOut, ListResponse } from '../types';

export function getDishCategories(): Promise<DishCategory[]> {
  return get<DishCategory[]>('/dish-categories');
}

export function getDishes(params?: {
  category?: string;
  is_recommended?: boolean;
  limit?: number;
}): Promise<ListResponse<DishOut>> {
  return get<ListResponse<DishOut>>('/dishes', params);
}

export function getDish(slug: string): Promise<DishOut> {
  return get<DishOut>(`/dishes/${slug}`);
}

// 预约表单：拉取全部菜品（用于勾选）
export function getAllDishes(): Promise<DishOut[]> {
  return get<ListResponse<DishOut>>('/dishes', { limit: 100, offset: 0 }).then(
    (d) => d.items ?? [],
  );
}
