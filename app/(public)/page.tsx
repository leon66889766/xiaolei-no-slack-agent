'use client';

import { useRef, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { ChatInput } from '@/components/chat/ChatInput';
import { WelcomeScreen } from '@/components/chat/WelcomeScreen';

/**
 * 前台对话主页
 * 科技蓝紫渐变背景 + 居中对话区 + 底部输入栏
 */
export default function PublicPage() {
  const { messages, isLoading, sendMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      {/* 对话区域 */}
      <div className="chat-container flex-1 overflow-y-auto">
        {!hasMessages ? (
          <div className="flex h-full items-center justify-center">
            <WelcomeScreen onSuggestionClick={sendMessage} />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl py-4">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {/* 加载中指示器 */}
            {isLoading && (
              <div className="flex items-center gap-3 px-4 py-3 animate-fade-in">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-brand shadow-primary/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-border/50 bg-card px-4 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    正在检索资源…
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* 输入栏 */}
      <ChatInput onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
}
