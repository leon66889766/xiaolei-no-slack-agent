import { NextRequest, NextResponse } from 'next/server';
import { resourceService } from '@/lib/services/resourceService';
import type { ApiResponse, ChatResponse } from '@/lib/types';

/**
 * 对话检索 API
 * POST /api/chat
 * Body: { message: string, history?: ChatMessage[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: string = body.message;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json<ApiResponse<null>>(
        { code: 400, data: null, message: '消息内容不能为空' },
        { status: 400 }
      );
    }

    // 搜索资源
    const results = resourceService.searchResources(message.trim(), 10);
    const resources = results.map((r) => r.resource);

    // 组装友好回复文案
    let reply: string;
    if (resources.length === 0) {
      reply = '未找到相关资源，试试更具体的描述？比如「科技感背景图」「项目文档」等关键词。';
    } else if (resources.length === 1) {
      reply = `找到了 1 个相关资源「${resources[0].title}」，你可以预览或下载它。`;
    } else {
      reply = `找到了 ${resources.length} 个相关资源，按相关度排序如下。你可以点击预览或下载。`;
    }

    const response: ChatResponse = { reply, resources };

    return NextResponse.json<ApiResponse<ChatResponse>>({
      code: 0,
      data: response,
      message: 'success',
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { code: 500, data: null, message: '服务器内部错误' },
      { status: 500 }
    );
  }
}
