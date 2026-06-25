import { NextRequest, NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/repositories/categoryRepository';
import type { ApiResponse, Category, CategoryUpdateData } from '@/lib/types';

/**
 * 管理端分类更新 + 删除
 * PATCH  /api/admin/categories/:id
 * DELETE /api/admin/categories/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body: CategoryUpdateData = await request.json();
    const { name, description } = body;

    // 检查分类是否存在
    const existing = categoryRepository.findById(params.id);
    if (!existing) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 404, data: null, message: '分类不存在' },
        { status: 404 }
      );
    }

    // 检查重名（排除自身）
    if (name && name.trim() !== existing.name) {
      const duplicate = categoryRepository.findByName(name.trim());
      if (duplicate) {
        return NextResponse.json<ApiResponse<null>>(
          { code: 409, data: null, message: '分类名称已存在' },
          { status: 409 }
        );
      }
    }

    const category = categoryRepository.update(params.id, {
      name: name?.trim(),
      description: description?.trim(),
    });

    if (!category) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 500, data: null, message: '更新失败' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<Category>>({
      code: 0,
      data: category,
      message: '更新成功',
    });
  } catch (error) {
    console.error('[Admin Category PATCH] Error:', error);
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
    const success = categoryRepository.delete(params.id);

    if (!success) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 404, data: null, message: '分类不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      code: 0,
      data: null,
      message: '删除成功',
    });
  } catch (error) {
    console.error('[Admin Category DELETE] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
