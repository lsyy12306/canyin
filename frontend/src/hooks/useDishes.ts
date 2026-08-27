import useSWR from 'swr';
import { get } from '../api/client';
import { getDishCategories } from '../api/dishes';
import type { DishCategory, DishOut, ListResponse } from '../types';

// 菜品分类（用于筛选条）
export function useDishCategories() {
  const { data, error, isLoading } = useSWR<DishCategory[]>('/dish-categories', () =>
    getDishCategories(),
  );
  return { categories: data ?? [], error, isLoading };
}

// 菜品列表；category 变化时实时重新拉取（满足 AC-2）
export function useDishes(params?: { category?: string; is_recommended?: boolean }) {
  const key =
    params && (params.category || params.is_recommended)
      ? `/dishes?${new URLSearchParams(
          Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)]),
        ).toString()}`
      : '/dishes';

  const { data, error, isLoading } = useSWR<ListResponse<DishOut>>(
    key,
    () => get<ListResponse<DishOut>>(key),
    { keepPreviousData: true },
  );

  return {
    dishes: data?.items ?? [],
    total: data?.total ?? 0,
    error,
    isLoading,
  };
}
