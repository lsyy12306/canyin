import { get, post, put, del } from './client';
import type { News, ListData } from '../types';

export function getNews(params?: Record<string, unknown>) {
  return get<ListData<News>>('/admin/news', { params });
}

export function createNews(data: Partial<News>) {
  return post<News>('/admin/news', data);
}

export function updateNews(id: number, data: Partial<News>) {
  return put<News>(`/admin/news/${id}`, data);
}

export function deleteNews(id: number) {
  return del<void>(`/admin/news/${id}`);
}
