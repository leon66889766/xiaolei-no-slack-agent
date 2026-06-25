import { apiFetch } from '@/lib/api/client';
import type { ChatRequest, ChatResponse } from '@/lib/types';

/**
 * 对话接口客户端
 */

/**
 * 发送对话消息
 */
export async function sendChatMessage(data: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
