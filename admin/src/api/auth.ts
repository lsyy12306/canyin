import { post } from './client';
import type { LoginResponse } from '../types';

/** POST /api/admin/login  {username,password} -> {access_token} */
export function login(username: string, password: string) {
  return post<LoginResponse>('/admin/login', { username, password });
}

/** POST /api/admin/refresh -> 刷新后的 {access_token} */
export function refreshToken() {
  return post<LoginResponse>('/admin/refresh', {});
}
