import { get } from './client';
import type { ConfigMap } from '../types';

interface RawConfig {
  key: string;
  value: string | null;
  group?: string;
}

// GET /api/public/configs?group=legal|contact
// 后端公共接口将 config_key/config_value 映射为 key/value（见后端 ConfigItem）。
// 此处按 key/value 归一化为 ConfigMap，兼容直接返回对象映射的形态。
export function getConfigs(group?: 'legal' | 'contact' | 'seo'): Promise<ConfigMap> {
  return get<ConfigMap | RawConfig[]>('/public/configs', group ? { group } : undefined).then(
    (data) => {
      if (Array.isArray(data)) {
        const map: ConfigMap = {};
        data.forEach((c) => {
          map[c.key] = c.value ?? '';
        });
        return map;
      }
      return data as ConfigMap;
    },
  );
}
