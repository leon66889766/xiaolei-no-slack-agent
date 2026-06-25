import { NextRequest, NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/repositories/categoryRepository';
import type { ApiResponse, Category, CategoryCreateData } from '@/lib/types';

/**
 * 管理端分类列表 + 创建
 * GET  /api/admin/categories
 * POST /api/admin/categories
 */
export async function GET() {
  try {
    const categories = categoryRepository.findAll();

    return NextResponse.json<ApiResponse<Category[]>>({
      code: 0,
      data: categories,
      message: 'success',
    });
  } catch (error) {
    console.error('[Admin Categories GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CategoryCreateData = await request.json();
    const { name, description } = body;

    if (!name || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 400, data: null, message: '分类名称不能为空' },
        { status: 400 }
      );
    }

    // 检查重名
    const existing = categoryRepository.findByName(name.trim());
    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 409, data: null, message: '分类名称已存在' },
        { status: 409 }
      );
    }

    const category = categoryRepository.create({
      name: name.trim(),
      description: description?.trim(),
    });

    return NextResponse.json<ApiResponse<Category>>(
      { code: 0, data: category, message: '创建成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Categories POST] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
