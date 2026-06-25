import { apiFetch } from '@/lib/api/client';
import type { AuthSession, LoginRequest } from '@/lib/types';

/**
 * 认证接口客户端
 */

/**
 * 登录
 */
export async function login(data: LoginRequest): Promise<AuthSession> {
  return apiFetch<AuthSession>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  await apiFetch<null>('/api/auth/logout', {
    method: 'POST',
  });
}

/**
 * 获取当前会话
 */
export async function getMe(): Promise<AuthSession | null> {
  try {
    return await apiFetch<AuthSession | null>('/api/auth/me');
  } catch {
    return null;
  }
}
