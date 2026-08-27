import { post } from './client';
import type { DishReservationCreate } from '../types';

// POST /api/dish-reservations —— 提交提前预约菜品
export function createReservation(payload: DishReservationCreate) {
  return post<{ id: number }>('/dish-reservations', payload);
}
