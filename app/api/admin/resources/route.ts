import { NextRequest, NextResponse } from 'next/server';
import { resourceRepository } from '@/lib/repositories/resourceRepository';
import { resourceService } from '@/lib/services/resourceService';
import { MAX_FILE_SIZE } from '@/lib/config';
import type {
  ApiResponse,
  Paginated,
  Resource,
  ResourceQuery,
} from '@/lib/types';

/**
 * 管理端资源列表 + 创建/上传
 * GET  /api/admin/resources — 列表查询
 * POST /api/admin/resources — 上传文件 or 添加链接
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
    console.error('[Admin Resources GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    // multipart 文件上传
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json<ApiResponse<null>>(
          { code: 400, data: null, message: '请选择要上传的文件' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json<ApiResponse<null>>(
          { code: 400, data: null, message: '文件大小超过限制（100MB）' },
          { status: 400 }
        );
      }

      const title = (formData.get('title') as string) || file.name;
      const description = (formData.get('description') as string) || '';
      const categoryId = (formData.get('categoryId') as string) || null;
      const tagsStr = (formData.get('tags') as string) || '[]';
      const tagNames: string[] = JSON.parse(tagsStr);

      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const resource = resourceService.uploadResource(
        fileBuffer,
        file.name,
        file.type,
        title,
        description,
        categoryId,
        tagNames
      );

      return NextResponse.json<ApiResponse<Resource>>(
        { code: 0, data: resource, message: '上传成功' },
        { status: 201 }
      );
    }

    // JSON 链接创建
    const body = await request.json();
    const { url, title, description, categoryId, tags } = body as {
      url: string;
      title: string;
      description?: string;
      categoryId?: string;
      tags?: string[];
    };

    if (!url || !title) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 400, data: null, message: '链接 URL 和标题不能为空' },
        { status: 400 }
      );
    }

    const resource = resourceService.addLink(
      url,
      title,
      description || '',
      categoryId || null,
      tags || []
    );

    return NextResponse.json<ApiResponse<Resource>>(
      { code: 0, data: resource, message: '添加成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Resources POST] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
