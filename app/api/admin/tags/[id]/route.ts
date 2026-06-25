import { NextRequest, NextResponse } from 'next/server';
import { tagRepository } from '@/lib/repositories/tagRepository';
import type { ApiResponse } from '@/lib/types';

/**
 * 管理端标签删除
 * DELETE /api/admin/tags/:id
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = tagRepository.delete(params.id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 404, data: null, message: '标签不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      code: 0,
      data: null,
      message: '删除成功',
    });
  } catch (error) {
    console.error('[Admin Tag DELETE] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
