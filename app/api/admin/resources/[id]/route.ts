import { NextRequest, NextResponse } from 'next/server';
import { resourceService } from '@/lib/services/resourceService';
import { resourceRepository } from '@/lib/repositories/resourceRepository';
import type { ApiResponse, Resource } from '@/lib/types';

/**
 * 管理端资源更新 + 删除
 * PATCH  /api/admin/resources/:id — 更新资源
 * DELETE /api/admin/resources/:id — 删除资源（同时删文件）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { title, description, categoryId, tags } = body as {
      title?: string;
      description?: string;
      categoryId?: string | null;
      tags?: string[];
    };

    // 检查资源是否存在
    const existing = resourceRepository.findById(params.id);
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 404, data: null, message: '资源不存在' },
        { status: 404 }
      );
    }

    // 标签名转 ID（如果传入的是名称）
    let tagIds: string[] | undefined;
    if (tags !== undefined) {
      tagIds = tags;
    }

    const resource = resourceService.updateResource(params.id, {
      title,
      description,
      categoryId: categoryId !== undefined ? categoryId : undefined,
      tagIds,
    });

    if (!resource) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 500, data: null, message: '更新失败' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Resource>>({
      code: 0,
      data: resource,
      message: '更新成功',
    });
  } catch (error) {
    console.error('[Admin Resource PATCH] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = resourceService.deleteResource(params.id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 404, data: null, message: '资源不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      code: 0,
      data: null,
      message: '删除成功',
    });
  } catch (error) {
    console.error('[Admin Resource DELETE] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
