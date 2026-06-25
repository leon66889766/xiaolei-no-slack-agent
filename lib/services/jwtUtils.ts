import { SignJWT, jwtVerify } from 'jose';
import { JWT_SECRET, JWT_EXPIRES_IN, COOKIE_NAME, ADMIN_USERNAME, ADMIN_PASSWORD } from '@/lib/config';
import type { AuthSession } from '@/lib/types';

/** JWT payload */
interface JwtPayload {
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

/** 编码后的 JWT 密钥 */
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * 恒定时间字符串比较
 * 防止时序攻击
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * JWT 工具（不含 next/headers 依赖，可在 middleware/Edge 中使用）
 */
export const jwtUtils = {
  /**
   * 登录校验
   */
  async login(username: string, password: string): Promise<string | null> {
    const usernameMatch = timingSafeEqual(username, ADMIN_USERNAME);
    const passwordMatch = timingSafeEqual(password, ADMIN_PASSWORD);

    if (!usernameMatch || !passwordMatch) {
      return null;
    }

    const token = await new SignJWT({ username, role: 'admin' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(`${JWT_EXPIRES_IN}s`)
      .sign(secretKey);

    return token;
  },

  /**
   * 验证 JWT token
   */
  async verifyToken(token: string): Promise<AuthSession | null> {
    try {
      const { payload } = await jwtVerify(token, secretKey);
      const jwtPayload = payload as unknown as JwtPayload;
      if (jwtPayload.role !== 'admin') return null;
      return {
        username: jwtPayload.username,
        role: 'admin',
      };
    } catch {
      return null;
    }
  },

  /**
   * 从原始 Cookie 字符串中读取会话（用于 middleware）
   */
  async getSessionFromCookieHeader(cookieHeader: string | null): Promise<AuthSession | null> {
    if (!cookieHeader) return null;

    const cookies = cookieHeader.split(';').reduce<Record<string, string>>((acc, c) => {
      const [key, ...valParts] = c.trim().split('=');
      if (key) {
        acc[key.trim()] = valParts.join('=').trim();
      }
      return acc;
    }, {});

    const token = cookies[COOKIE_NAME];
    if (!token) return null;
    return this.verifyToken(token);
  },
};

export { COOKIE_NAME, JWT_EXPIRES_IN };
