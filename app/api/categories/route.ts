import { NextResponse } from 'next/server';
import { categoryRepository } from '@/lib/repositories/categoryRepository';
import type { ApiResponse, Category } from '@/lib/types';

/**
 * 公共分类列表 API
 * GET /api/categories
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
    console.error('[Categories API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
