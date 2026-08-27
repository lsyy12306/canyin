import { get, post } from './client';
import type { Job, JobApplicationPayload } from '../types';

export function getJobs(): Promise<Job[]> {
  return get<Job[] | Job[]>('/jobs').then((d) => (Array.isArray(d) ? d : []));
}

// POST /api/jobs/{id}/applications
export function applyJob(id: number, payload: JobApplicationPayload): Promise<{ id: number }> {
  return post<{ id: number }>(`/jobs/${id}/applications`, payload);
}
