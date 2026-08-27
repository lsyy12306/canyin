import { get, put } from './client';
import type { SiteConfig } from '../types';

/** GET /api/admin/configs -> SiteConfig[]（可带 ?group= 过滤） */
export function getConfigs(group?: string) {
  return get<SiteConfig[]>('/admin/configs', group ? { params: { group } } : undefined);
}

/** PUT /api/admin/configs/{key} -> 修改 config_value */
export function updateConfig(key: string, value: string) {
  return put<SiteConfig>(`/admin/configs/${key}`, { config_value: value });
}
