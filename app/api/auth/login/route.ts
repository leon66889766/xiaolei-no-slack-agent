import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import type { ApiResponse, AuthSession, LoginRequest } from '@/lib/types';

/**
 * 登录 API
 * POST /api/auth/login
 * Body: { username, password }
 */
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 400, data: null, message: '用户名和密码不能为空' },
        { status: 400 }
      );
    }

    const token = await authService.login(username, password);

    if (!token) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 401, data: null, message: '账号或密码错误' },
        { status: 401 }
      );
    }

    // 下发 httpOnly Cookie
    const cookieConfig = authService.getCookieConfig();
    const response = NextResponse.json<ApiResponse<AuthSession>>({
      code: 0,
      data: { username, role: 'admin' },
      message: '登录成功',
    });

    response.cookies.set({
      name: cookieConfig.name,
      value: token,
      httpOnly: cookieConfig.httpOnly,
      sameSite: cookieConfig.sameSite,
      secure: cookieConfig.secure,
      path: cookieConfig.path,
      maxAge: cookieConfig.maxAge,
    });

    return response;
  } catch (error) {
    console.error('[Login API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
