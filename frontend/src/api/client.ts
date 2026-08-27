import axios from 'axios';
import { showToast } from '../components/Toast';

const baseURL = import.meta.env.VITE_API_BASE || '/api';

const instance = axios.create({ baseURL });

// 统一解包后端包络 { code, message, data }
instance.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body && typeof body === 'object' && 'code' in body) {
      if (body.code === 200 || body.code === 0) {
        return body.data;
      }
      const msg = body.message || '请求失败';
      showToast('error', msg);
      return Promise.reject(new Error(msg));
    }
    return body;
  },
  (error) => {
    const msg =
      error?.response?.data?.message || error?.message || '网络错误，请稍后重试';
    showToast('error', msg);
    return Promise.reject(error);
  },
);

// 类型安全的 GET / POST，调用后直接得到 data（已被拦截器解包）
export async function get<T = unknown>(url: string, params?: Record<string, unknown>): Promise<T> {
  return instance.get(url, { params }) as unknown as Promise<T>;
}

export async function post<T = unknown>(url: string, payload?: unknown): Promise<T> {
  return instance.post(url, payload) as unknown as Promise<T>;
}

export default instance;
