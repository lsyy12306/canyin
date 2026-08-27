import { post } from './client';

export interface UploadResult {
  url: string;
}

/** POST /api/admin/uploads (multipart, 字段 file) -> { url } */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return post<UploadResult>('/admin/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
