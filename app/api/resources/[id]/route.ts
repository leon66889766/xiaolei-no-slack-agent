import { NextRequest, NextResponse } from 'next/server';
import { resourceRepository } from '@/lib/repositories/resourceRepository';
import type { ApiResponse, Resource } from '@/lib/types';

/**
 * 公共资源详情 API
 * GET /api/resources/:id
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resource = resourceRepository.findById(params.id);

    if (!resource) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 404, data: null, message: '资源不存在' },
        { status: 404 }
      );
    }

    // 自增浏览计数
    resourceRepository.incrementView(params.id);

    return NextResponse.json<ApiResponse<Resource>>({
      code: 0,
      data: resource,
      message: 'success',
    });
  } catch (error) {
    console.error('[Resource Detail API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
