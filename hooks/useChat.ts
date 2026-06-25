'use client';

import { useState, useCallback, useRef } from 'react';
import { sendChatMessage } from '@/lib/api/chat';
import type { ChatMessage } from '@/lib/types';

/**
 * 对话状态管理 Hook
 * - 消息列表
 * - 发送消息
 * - 加载态
 * - 清空
 */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * 发送消息
   */
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage({ message: text.trim() });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.reply,
        resources: response.resources,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '发送失败，请重试';
      setError(errorMsg);

      // 添加错误提示消息
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: `抱歉，出现了错误：${errorMsg}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  /**
   * 清空对话
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}
