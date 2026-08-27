import useSWR from 'swr';
import { getNews } from '../api/news';
import type { ListResponse, NewsOut, NewsType } from '../types';

export function useNews(type?: NewsType) {
  const key = type ? `/news?type=${type}` : '/news';
  const { data, error, isLoading } = useSWR<ListResponse<NewsOut>>(key, () =>
    getNews(type ? { type } : undefined),
  );
  return { news: data?.items ?? [], total: data?.total ?? 0, error, isLoading };
}
