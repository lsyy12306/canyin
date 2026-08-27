import { get, post } from './client';
import type { FranchiseInquiryPayload, FranchiseInfo } from '../types';

export function getFranchiseInfo(): Promise<FranchiseInfo> {
  return get<FranchiseInfo>('/franchise/info');
}

// POST /api/franchise/inquiries
export function submitInquiry(payload: FranchiseInquiryPayload): Promise<{ id: number }> {
  return post<{ id: number }>('/franchise/inquiries', payload);
}
