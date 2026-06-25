import { NextRequest, NextResponse } from 'next/server';
import { tagRepository } from '@/lib/repositories/tagRepository';
import type { ApiResponse, Tag, TagCreateData } from '@/lib/types';

/**
 * 管理端标签列表 + 创建
 * GET  /api/admin/tags
 * POST /api/admin/tags
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
    console.error('[Admin Tags GET] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TagCreateData = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 400, data: null, message: '标签名称不能为空' },
        { status: 400 }
      );
    }

    // 检查重名
    const existing = tagRepository.findByName(name.trim());
    if (existing) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 409, data: null, message: '标签名称已存在' },
        { status: 409 }
      );
    }

    const tag = tagRepository.create({ name: name.trim() });

    return NextResponse.json<ApiResponse<Tag>>(
      { code: 0, data: tag, message: '创建成功' },
      { status: 201 }
    );
  } catch (error) {
    console.error('[Admin Tags POST] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
