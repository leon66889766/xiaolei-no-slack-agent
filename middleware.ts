import { NextRequest, NextResponse } from 'next/server';
import { jwtUtils } from '@/lib/services/jwtUtils';

/**
 * 中间件：拦截 /admin/* 和 /api/admin/* 做 JWT 校验
 * - 页面访问未登录 → 重定向到 /admin/login
 * - API 访问未登录 → 返回 401 JSON
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 判断是否为 API 请求
  const isAdminApi = pathname.startsWith('/api/admin');
  const isAdminPage = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login');

  if (!isAdminApi && !isAdminPage) {
    return NextResponse.next();
  }

  // 从 Cookie 读取 JWT
  const cookieHeader = request.headers.get('cookie');
  const session = await jwtUtils.getSessionFromCookieHeader(cookieHeader);

  if (!session) {
    if (isAdminApi) {
      // API 返回 401
      return NextResponse.json(
        { code: 401, data: null, message: '未登录或登录已过期' },
        { status: 401 }
      );
    }
    // 页面重定向到登录页
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

/**
 * 中间件匹配配置
 * - /admin/:path* → 所有 /admin 路径（含 /admin 本身）
 * - /api/admin/:path* → 所有管理端 API
 * 登录页 /admin/login 在函数内部排除
 */
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
