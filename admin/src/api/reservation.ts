import { get, put, del } from './client';
import type { DishReservation, ListData, ReservationStatus } from '../types';

// 后台预约管理相关接口封装（统一走 ./client，带 JWT 鉴权与错误拦截）。
/** GET /api/admin/dish-reservations —— 预约列表，可传 { status } 过滤 */
export function getReservations(params?: Record<string, unknown>) {
  return get<ListData<DishReservation>>('/admin/dish-reservations', { params });
}

/** PUT /api/admin/dish-reservations/{id}/status —— 流转状态 */
export function updateReservationStatus(id: number, status: ReservationStatus) {
  return put<DishReservation>(`/admin/dish-reservations/${id}/status`, { status });
}

/** DELETE /api/admin/dish-reservations/{id} —— 删除（级联明细） */
export function deleteReservation(id: number) {
  return del<void>(`/admin/dish-reservations/${id}`);
}
