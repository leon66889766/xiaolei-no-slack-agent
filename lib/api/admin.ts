import { apiFetch, apiUpload } from '@/lib/api/client';
import type {
  Category,
  CategoryCreateData,
  CategoryUpdateData,
  Paginated,
  Resource,
  ResourceQuery,
  Tag,
  TagCreateData,
} from '@/lib/types';

/**
 * 管理端接口客户端
 */

// ============ 资源管理 ============

/**
 * 管理端资源列表
 */
export async function getAdminResources(
  query: ResourceQuery = {}
): Promise<Paginated<Resource>> {
  const params = new URLSearchParams();
  if (query.keyword) params.set('keyword', query.keyword);
  if (query.type) params.set('type', query.type);
  if (query.categoryId) params.set('categoryId', query.categoryId);
  if (query.tag) params.set('tag', query.tag);
  if (query.page) params.set('page', String(query.page));
  if (query.limit) params.set('limit', String(query.limit));

  const queryString = params.toString();
  const url = `/api/admin/resources${queryString ? '?' + queryString : ''}`;
  return apiFetch<Paginated<Resource>>(url);
}

/**
 * 上传文件资源
 */
export async function uploadResource(
  file: File,
  title: string,
  description: string,
  categoryId: string | null,
  tags: string[]
): Promise<Resource> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('description', description);
  if (categoryId) formData.append('categoryId', categoryId);
  formData.append('tags', JSON.stringify(tags));

  return apiUpload<Resource>('/api/admin/resources', formData);
}

/**
 * 添加链接资源
 */
export async function addLinkResource(
  url: string,
  title: string,
  description: string,
  categoryId: string | null,
  tags: string[]
): Promise<Resource> {
  return apiFetch<Resource>('/api/admin/resources', {
    method: 'POST',
    body: JSON.stringify({ url, title, description, categoryId, tags }),
  });
}

/**
 * 更新资源
 */
export async function updateResource(
  id: string,
  data: {
    title?: string;
    description?: string;
    categoryId?: string | null;
    tags?: string[];
  }
): Promise<Resource> {
  return apiFetch<Resource>(`/api/admin/resources/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * 删除资源
 */
export async function deleteResource(id: string): Promise<void> {
  await apiFetch<null>(`/api/admin/resources/${id}`, {
    method: 'DELETE',
  });
}

// ============ 分类管理 ============

/**
 * 管理端分类列表
 */
export async function getAdminCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/api/admin/categories');
}

/**
 * 创建分类
 */
export async function createCategory(data: CategoryCreateData): Promise<Category> {
  return apiFetch<Category>('/api/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 更新分类
 */
export async function updateCategory(
  id: string,
  data: CategoryUpdateData
): Promise<Category> {
  return apiFetch<Category>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * 删除分类
 */
export async function deleteCategory(id: string): Promise<void> {
  await apiFetch<null>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

// ============ 标签管理 ============

/**
 * 管理端标签列表
 */
export async function getAdminTags(): Promise<Tag[]> {
  return apiFetch<Tag[]>('/api/admin/tags');
}

/**
 * 创建标签
 */
export async function createTag(data: TagCreateData): Promise<Tag> {
  return apiFetch<Tag>('/api/admin/tags', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 删除标签
 */
export async function deleteTag(id: string): Promise<void> {
  await apiFetch<null>(`/api/admin/tags/${id}`, {
    method: 'DELETE',
  });
}
