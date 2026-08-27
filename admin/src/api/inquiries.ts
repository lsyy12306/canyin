import { get, put } from './client';
import type { FranchiseInquiry, InquiryStatus, ListData } from '../types';

export function getInquiries(params?: Record<string, unknown>) {
  return get<ListData<FranchiseInquiry>>('/admin/inquiries', { params });
}

export function updateInquiry(id: number, data: { status?: InquiryStatus; [k: string]: unknown }) {
  return put<FranchiseInquiry>(`/admin/inquiries/${id}/status`, data);
}
