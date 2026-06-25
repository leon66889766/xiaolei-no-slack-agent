import { NextResponse } from 'next/server';
import { authService } from '@/lib/services/authService';
import type { ApiResponse, AuthSession } from '@/lib/types';

/**
 * 当前会话 API
 * GET /api/auth/me
 */
export async function GET() {
  try {
    const session = await authService.getSession();

    if (!session) {
      return NextResponse.json<ApiResponse<AuthSession | null>>({
        code: 0,
        data: null,
        message: '未登录',
      });
    }

    return NextResponse.json<ApiResponse<AuthSession>>({
      code: 0,
      data: session,
      message: 'success',
    });
  } catch (error) {
    console.error('[Me API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
