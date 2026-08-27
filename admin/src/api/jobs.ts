import { get, post, put, del } from './client';
import type { Job, ListData } from '../types';

export function getJobs(params?: Record<string, unknown>) {
  return get<ListData<Job>>('/admin/jobs', { params });
}

export function createJob(data: Partial<Job>) {
  return post<Job>('/admin/jobs', data);
}

export function updateJob(id: number, data: Partial<Job>) {
  return put<Job>(`/admin/jobs/${id}`, data);
}

export function deleteJob(id: number) {
  return del<void>(`/admin/jobs/${id}`);
}
