import useSWR from 'swr';
import { getJobs } from '../api/jobs';
import type { Job } from '../types';

export function useJobs() {
  const { data, error, isLoading } = useSWR<Job[]>('/jobs', () => getJobs());
  return { jobs: data ?? [], error, isLoading };
}
