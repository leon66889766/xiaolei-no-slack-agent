import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import type { ApiResponse } from '@/lib/types';

/**
 * 登出 API
 * POST /api/auth/logout
 * 清除 httpOnly Cookie
 */
export async function POST() {
  try {
    const cookieConfig = authService.getCookieConfig();
    const response = NextResponse.json<ApiResponse<null>>({
      code: 0,
      data: null,
      message: '已退出登录',
    });

    response.cookies.set({
      name: cookieConfig.name,
      value: '',
      httpOnly: cookieConfig.httpOnly,
      sameSite: cookieConfig.sameSite,
      secure: cookieConfig.secure,
      path: cookieConfig.path,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('[Logout API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
