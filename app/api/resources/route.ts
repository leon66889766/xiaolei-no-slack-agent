import { NextRequest, NextResponse } from 'next/server';
import { resourceRepository } from '@/lib/repositories/resourceRepository';
import type { ApiResponse, Paginated, Resource, ResourceQuery } from '@/lib/types';

/**
 * 公共资源列表 API
 * GET /api/resources?type=&categoryId=&tag=&keyword=&page=&limit=
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const query: ResourceQuery = {
      keyword: searchParams.get('keyword') || undefined,
      type: (searchParams.get('type') as Resource['type']) || undefined,
      categoryId: searchParams.get('categoryId') || undefined,
      tag: searchParams.get('tag') || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 20,
    };

    const { items, total } = resourceRepository.findAll(query);

    const result: Paginated<Resource> = {
      items,
      total,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    return NextResponse.json<ApiResponse<Paginated<Resource>>>({
      code: 0,
      data: result,
      message: 'success',
    });
  } catch (error) {
    console.error('[Resources API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
