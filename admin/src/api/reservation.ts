import { get, put, del } from './client';
import type { DishReservation, ListData, ReservationStatus } from '../types';

/** GET /api/admin/dish-reservations */
export function getReservations(params?: Record<string, unknown>) {
  return get<ListData<DishReservation>>('/admin/dish-reservations', { params });
}

/** PUT /api/admin/dish-reservations/{id}/status */
export function updateReservationStatus(id: number, status: ReservationStatus) {
  return put<DishReservation>(`/admin/dish-reservations/${id}/status`, { status });
}

/** DELETE /api/admin/dish-reservations/{id} */
export function deleteReservation(id: number) {
  return del<void>(`/admin/dish-reservations/${id}`);
}
