import { get, put } from './client';
import type { JobApplication, ApplicationStatus, ListData } from '../types';

export function getApplications(params?: Record<string, unknown>) {
  return get<ListData<JobApplication>>('/admin/applications', { params });
}

export function updateApplication(id: number, data: { status?: ApplicationStatus; [k: string]: unknown }) {
  return put<JobApplication>(`/admin/applications/${id}/status`, data);
}
