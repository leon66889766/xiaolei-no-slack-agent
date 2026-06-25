'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginApi, logout as logoutApi, getMe } from '@/lib/api/auth';
import type { AuthSession } from '@/lib/types';

/**
 * 管理员认证 Hook
 * - 登录/登出
 * - 会话状态
 * - 鉴权守卫
 */
export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  /**
   * 初始化：检查登录状态
   */
  useEffect(() => {
    checkSession();
  }, []);

  /**
   * 检查会话
   */
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const me = await getMe();
      setSession(me);
    } catch {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 登录
   */
  const login = useCallback(async (username: string, password: string) => {
    const result = await loginApi({ username, password });
    setSession(result);
    return result;
  }, []);

  /**
   * 登出
   */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      setSession(null);
      router.push('/admin/login');
    }
  }, [router]);

  /**
   * 是否已登录
   */
  const isAuthenticated = session !== null;

  return {
    session,
    isLoading,
    isAuthenticated,
    login,
    logout,
    checkSession,
  };
}
