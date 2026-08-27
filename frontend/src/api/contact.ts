import { post } from './client';
import type { ContactMessagePayload } from '../types';

// POST /api/contact/messages
export function sendMessage(payload: ContactMessagePayload): Promise<{ id: number }> {
  return post<{ id: number }>('/contact/messages', payload);
}
