// 后端统一响应包络与业务实体类型定义（与后端 /api/admin/* 契约严格对齐）

export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/** 列表响应可能是数组，或为 { total, items } 分页结构 */
export interface Paginated<T> {
  total: number;
  items: T[];
}

export type ListData<T> = T[] | Paginated<T>;

/* ----------------------------- 菜品 ----------------------------- */

export interface DishCategory {
  id: number;
  key: string;
  name: string;
  color?: string;
  sort_order: number;
  created_at?: string;
}

export interface Dish {
  id: number;
  name: string;
  slug: string;
  category_id: number;
  price: number; // 单位：分
  description?: string;
  image_url?: string;
  tags: string[];
  is_recommended: boolean;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ----------------------------- 门店 ----------------------------- */

export interface Store {
  id: number;
  city: string;
  name: string;
  slug: string;
  highlight?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

/* ----------------------------- 新闻 ----------------------------- */

export type NewsType = 'corporate' | 'industry';

export interface News {
  id: number;
  type: NewsType;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  cover_image?: string;
  published_at?: string; // YYYY-MM-DD
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

/* ----------------------------- 岗位 ----------------------------- */

export type JobType = 'full_time' | 'part_time' | 'intern';

export interface Job {
  id: number;
  title: string;
  department?: string;
  location?: string;
  type: JobType;
  description?: string;
  requirements?: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
}

/* --------------------------- 加盟意向 --------------------------- */

export type InquiryStatus = 'pending' | 'contacted' | 'closed';

export interface FranchiseInquiry {
  id: number;
  name: string;
  phone: string;
  city?: string;
  budget_range?: string;
  message?: string;
  status: InquiryStatus;
  created_at?: string;
}

/* --------------------------- 简历投递 --------------------------- */

export type ApplicationStatus = 'pending' | 'reviewed' | 'rejected' | 'hired';

export interface JobApplication {
  id: number;
  job_id: number;
  name: string;
  phone: string;
  email?: string;
  resume_url?: string;
  message?: string;
  status: ApplicationStatus;
  created_at?: string;
}

/* --------------------------- 在线留言 --------------------------- */

export type MessageStatus = 'pending' | 'replied' | 'closed';
export type MessageType = 'franchise' | 'job' | 'cooperation' | 'other';

export interface ContactMessage {
  id: number;
  name: string;
  contact: string;
  msg_type: MessageType;
  content: string;
  status: MessageStatus;
  created_at?: string;
}

/* --------------------------- 站点配置 --------------------------- */

export interface SiteConfig {
  config_key: string;
  config_value: string;
  config_group?: string;
  description?: string;
  updated_at?: string;
}

/* --------------------------- 后台用户 --------------------------- */

export type UserRole = 'admin' | 'editor';

export interface User {
  id: number;
  username: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
}

/* ----------------------------- 鉴权 ----------------------------- */

export interface LoginResponse {
  access_token: string;
  token_type?: string;
  user?: User;
}

/* --------------------------- 提前预约菜品 --------------------------- */

export type ReservationStatus = 'pending' | 'confirmed' | 'done' | 'cancelled';

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
  reserve_time?: string;
  guests: number;
  note?: string;
  status: ReservationStatus;
  ip_address?: string;
  created_at?: string;
  items: ReservationItemOut[];
}
