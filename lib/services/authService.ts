import { cookies } from 'next/headers';
import { jwtUtils } from '@/lib/services/jwtUtils';
import { JWT_EXPIRES_IN, COOKIE_NAME } from '@/lib/config';
import type { AuthSession } from '@/lib/types';

/**
 * 认证服务
 * 提供登录校验、JWT 签发/验证、会话读取
 * 用于 API Route Handlers（Node.js runtime）
 *
 * 注意：middleware 中请使用 jwtUtils（不含 next/headers 依赖）
 */
export const authService = {
  /**
   * 登录校验
   * @param username 用户名
   * @param password 密码
   * @returns JWT token（成功）或 null（失败）
   */
  async login(username: string, password: string): Promise<string | null> {
    return jwtUtils.login(username, password);
  },

  /**
   * 验证 JWT token
   */
  async verifyToken(token: string): Promise<AuthSession | null> {
    return jwtUtils.verifyToken(token);
  },

  /**
   * 从请求 Cookie 中读取会话
   * @returns AuthSession（有效）或 null（未登录/无效）
   */
  async getSession(): Promise<AuthSession | null> {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return this.verifyToken(token);
  },

  /**
   * 从原始 Cookie 字符串中读取会话（用于 middleware）
   */
  async getSessionFromCookieHeader(cookieHeader: string | null): Promise<AuthSession | null> {
    return jwtUtils.getSessionFromCookieHeader(cookieHeader);
  },

  /**
   * 获取 Cookie 配置
   */
  getCookieConfig() {
    return {
      name: COOKIE_NAME,
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: JWT_EXPIRES_IN,
    };
  },
};
