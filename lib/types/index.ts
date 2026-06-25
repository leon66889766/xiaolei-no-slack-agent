/**
 * 全局 TypeScript 类型定义
 * 对应架构文档 3.2 节
 */

/** 资源类型 */
export type ResourceType = 'image' | 'video' | 'document' | 'link';

/** 分类 */
export interface Category {
  id: string;
  name: string;
  description: string | null;
  resourceCount: number;
  createdAt: string;
}

/** 标签 */
export interface Tag {
  id: string;
  name: string;
  resourceCount: number;
  createdAt: string;
}

/** 资源 */
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  filePath: string | null;
  fileUrl: string;
  fileSize: number | null;
  fileFormat: string | null;
  thumbnailPath: string | null;
  categoryId: string | null;
  category: Category | null;
  tags: Tag[];
  viewCount: number;
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 对话消息 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  resources?: Resource[];
  timestamp: string;
}

/** 对话请求 */
export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/** 对话响应 */
export interface ChatResponse {
  reply: string;
  resources: Resource[];
}

/** 分页结果 */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

/** 统一 API 响应 */
export interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

/** 登录请求 */
export interface LoginRequest {
  username: string;
  password: string;
}

/** 认证会话 */
export interface AuthSession {
  username: string;
  role: 'admin';
}

/** 资源查询参数 */
export interface ResourceQuery {
  keyword?: string;
  type?: ResourceType;
  categoryId?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

/** 资源创建数据 */
export interface ResourceCreateData {
  title: string;
  description: string;
  type: ResourceType;
  filePath: string | null;
  fileUrl: string;
  fileSize: number | null;
  fileFormat: string | null;
  thumbnailPath: string | null;
  categoryId: string | null;
  tagIds: string[];
}

/** 资源更新数据 */
export interface ResourceUpdateData {
  title?: string;
  description?: string;
  categoryId?: string | null;
  tagIds?: string[];
}

/** 分类创建数据 */
export interface CategoryCreateData {
  name: string;
  description?: string;
}

/** 分类更新数据 */
export interface CategoryUpdateData {
  name?: string;
  description?: string;
}

/** 标签创建数据 */
export interface TagCreateData {
  name: string;
}

/** 文件元信息 */
export interface FileMeta {
  filePath: string;
  fileUrl: string;
  fileSize: number;
  fileFormat: string;
  thumbnailPath: string | null;
  type: ResourceType;
}

/** 搜索结果 */
export interface SearchResult {
  resource: Resource;
  score: number;
}
