import axios, { type AxiosRequestConfig, type AxiosError } from 'axios';
import { message } from 'antd';
import type { ApiResponse } from '../types';

/** localStorage 中保存 JWT 的键名 */
export const TOKEN_KEY = 'weihe_admin_token';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 15000,
});

// 请求拦截：附带 Bearer Token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截：解包 {code,message,data} 并统一错误提示
client.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse;
    if (body && typeof body.code === 'number' && body.code !== 200) {
      message.error(body.message || '请求失败');
      return Promise.reject(new Error(body.message || '请求失败'));
    }
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        // 鉴权失效：清除 token 并跳转登录
        localStorage.removeItem(TOKEN_KEY);
        message.error('登录已过期，请重新登录');
        window.location.assign('/login');
        return Promise.reject(error);
      }
      message.error(error.response.data?.message || `请求出错 (${status})`);
    } else {
      message.error('网络错误，请稍后重试');
    }
    return Promise.reject(error);
  }
);

async function unwrap<T>(p: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await p;
  return res.data.data;
}

export function get<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap<T>(client.get(url, config));
}
export function post<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return unwrap<T>(client.post(url, data, config));
}
export function put<T>(url: string, data?: unknown, config?: AxiosRequestConfig) {
  return unwrap<T>(client.put(url, data, config));
}
export function del<T>(url: string, config?: AxiosRequestConfig) {
  return unwrap<T>(client.delete(url, config));
}

export default client;
