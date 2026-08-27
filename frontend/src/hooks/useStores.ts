import useSWR from 'swr';
import { getStores } from '../api/stores';
import type { Store } from '../types';

export function useStores() {
  const { data, error, isLoading } = useSWR<Store[]>('/stores', () => getStores());
  return { stores: data ?? [], error, isLoading };
}
