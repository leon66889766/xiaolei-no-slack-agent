import type { ApiResponse } from '@/lib/types';

/**
 * 统一 fetch 封装
 * - 自动解析 ApiResponse envelope
 * - 非 0 code 抛错
 * - 401 触发登出跳转
 */

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

interface FetchOptions extends RequestInit {
  /** 是否解析 JSON（默认 true） */
  json?: boolean;
}

/**
 * 发送 API 请求并解析统一响应格式
 */
export async function apiFetch<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { json = true, headers, ...rest } = options;

  const response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(json ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
  });

  // 401 处理：跳转登录页
  if (response.status === 401) {
    // 如果不在登录页，重定向到登录页
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login';
    }
    throw new ApiError(401, '未登录或登录已过期');
  }

  if (!json) {
    return response as unknown as T;
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 0) {
    throw new ApiError(result.code, result.message || '请求失败');
  }

  return result.data as T;
}

/**
 * 发送 multipart 表单请求
 */
export async function apiUpload<T>(url: string, formData: FormData): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    throw new ApiError(401, '未登录或登录已过期');
  }

  const result: ApiResponse<T> = await response.json();

  if (result.code !== 0) {
    throw new ApiError(result.code, result.message || '上传失败');
  }

  return result.data as T;
}
