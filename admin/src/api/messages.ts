import { get, put } from './client';
import type { ContactMessage, MessageStatus, ListData } from '../types';

export function getMessages(params?: Record<string, unknown>) {
  return get<ListData<ContactMessage>>('/admin/messages', { params });
}

export function updateMessage(id: number, data: { status?: MessageStatus; [k: string]: unknown }) {
  return put<ContactMessage>(`/admin/messages/${id}/status`, data);
}
