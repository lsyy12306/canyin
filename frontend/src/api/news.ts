import { get } from './client';
import type { ListResponse, NewsOut, NewsType } from '../types';

export function getNews(params?: { type?: NewsType; limit?: number }): Promise<ListResponse<NewsOut>> {
  return get<ListResponse<NewsOut>>('/news', params);
}

export function getNewsDetail(slug: string): Promise<NewsOut> {
  return get<NewsOut>(`/news/${slug}`);
}
