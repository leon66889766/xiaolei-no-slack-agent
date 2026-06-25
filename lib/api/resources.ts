import { apiFetch } from '@/lib/api/client';
import type { Paginated, Resource, ResourceQuery, Category, Tag } from '@/lib/types';

/**
 * 公共资源接口客户端
 */

/**
 * 获取资源列表
 */
export async function getResources(query: ResourceQuery = {}): Promise<Paginated<Resource>> {
  const params = new URLSearchParams();
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.type) params.set('type', query.type);
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.tag) params.set('tag', query.tag);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const queryString = params.toString();
  const url = `/api/resources${queryString ? '?' + queryString : ''}`;
  return apiFetch<Paginated<Resource>>(url);
}

/**
 * 获取资源详情
 */
export async function getResourceById(id: string): Promise<Resource> {
  return apiFetch<Resource>(`/api/resources/${id}`);
}

/**
 * 获取资源下载 URL
 */
export function getDownloadUrl(id: string): string {
  return `/api/resources/${id}/download`;
}

/**
 * 获取分类列表
 */
export async function getCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/categories');
}

/**
 * 获取标签列表
 */
export async function getTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/api/tags');
}
