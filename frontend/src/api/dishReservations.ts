import { post } from './client';
import type { DishReservationCreate } from '../types';

// 提交“提前预约菜品”请求（公共接口，无需登录；后端按 IP 限流 5/min）。
// 入参 payload 字段见 DishReservationCreate（store_id/name/phone/reserve_date/items 等）。
// 成功返回 { id }，失败由 ./client 拦截器统一 toast 提示。
export function createReservation(payload: DishReservationCreate) {
  return post<{ id: number }>('/dish-reservations', payload);
}
