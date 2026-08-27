// 与后端 schema / 接口响应字段严格对齐

export interface DishCategory {
  id: number;
  key: string;
  name: string;
  color?: string;
  sort_order?: number;
}

export interface DishOut {
  id: number;
  name: string;
  slug: string;
  category: string;
  category_name: string;
  category_color?: string;
  price: number;
  price_text: string;
  description: string | null;
  image_url: string | null;
  tags: string[];
  is_recommended: boolean;
}

export interface Store {
  id: number;
  city: string;
  name: string;
  slug: string;
  highlight: string | null;
  image_url: string | null;
  is_active: boolean;
}

export interface NewsOut {
  id: number;
  type: 'corporate' | 'industry';
  title: string;
  slug: string;
  summary: string | null;
  cover_image: string | null;
  published_at: string | null;
  is_published: boolean;
  content: string | null;
}

export interface Job {
  id: number;
  title: string;
  department: string | null;
  location: string | null;
  type: string;
  description: string | null;
  requirements: string | null;
  is_active: boolean;
}

export type NewsType = 'corporate' | 'industry';

export interface ListResponse<T> {
  total: number;
  items: T[];
}

// GET /api/public/configs 返回 config_key -> config_value 的映射
export type ConfigMap = Record<string, string>;

// 加盟政策 / 合规信息（GET /api/franchise/info）
export interface FranchiseInfo {
  risk_tip?: string;
  franchise_license?: string;
  [key: string]: unknown;
}

// 写接口提交类型
export interface FranchiseInquiryPayload {
  name: string;
  phone: string;
  city?: string;
  budget_range?: string;
  message?: string;
}

export interface JobApplicationPayload {
  name: string;
  phone: string;
  email?: string;
  message?: string;
}

export interface ContactMessagePayload {
  name: string;
  contact: string;
  msg_type: 'franchise' | 'job' | 'cooperation' | 'other';
  content: string;
}

// --------------------------------------------------------------------------- //
// 提前预约菜品
// --------------------------------------------------------------------------- //
export interface ReservationItemIn {
  dish_id: number;
  quantity: number;
  note?: string;
}

export interface DishReservationCreate {
  store_id: number;
  name: string;
  phone: string;
  reserve_date: string; // YYYY-MM-DD
  reserve_time?: string; // HH:MM
  guests: number;
  note?: string;
  items: ReservationItemIn[];
}

export interface ReservationItemOut {
  id: number;
  dish_id: number;
  quantity: number;
  note: string;
  dish_name: string;
}

export interface DishReservation {
  id: number;
  store_id: number;
  store_name: string;
  name: string;
  phone: string;
  reserve_date: string;
  reserve_time: string;
  guests: number;
  note: string;
  status: 'pending' | 'confirmed' | 'done' | 'cancelled';
  ip_address?: string;
  created_at?: string | null;
  items: ReservationItemOut[];
}
