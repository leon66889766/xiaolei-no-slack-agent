import { NextResponse } from 'next/server';
import { tagRepository } from '@/lib/repositories/tagRepository';
import type { ApiResponse, Tag } from '@/lib/types';

/**
 * 公共标签列表 API
 * GET /api/tags
 */
export async function GET() {
  try {
    const tags = tagRepository.findAll();

    return NextResponse.json<ApiResponse<Tag[]>>({
      code: 0,
      data: tags,
      message: 'success',
    });
  } catch (error) {
    console.error('[Tags API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
