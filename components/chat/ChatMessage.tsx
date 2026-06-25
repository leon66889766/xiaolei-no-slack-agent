'use client';

import { useState } from 'react';
import { Sparkles, User, Download, ExternalLink, Eye } from 'lucide-react';
import type { ChatMessage as ChatMessageType, Resource } from '@/lib/types';
import { ResourceCard } from '@/components/shared/ResourceCard';
import { ResourcePreviewModal } from '@/components/shared/ResourcePreviewModal';
import { cn } from '@/lib/utils/cn';

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * 对话气泡组件
 * 用户消息在右侧，AI 消息在左侧
 * AI 消息内嵌资源卡片网格
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const isUser = message.role === 'user';

  const handlePreview = (resource: Resource) => {
    setPreviewResource(resource);
    setPreviewOpen(true);
  };

  return (
    <div
      className={cn(
        'flex w-full gap-3 px-4 py-3 animate-slide-up',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* 头像 */}
      <div
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm',
          isUser
            ? 'bg-secondary text-secondary-foreground'
            : 'bg-gradient-brand shadow-primary/20'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5" />
        ) : (
          <Sparkles className="h-5 w-5 text-white" />
        )}
      </div>

      {/* 消息内容 */}
      <div
        className={cn(
          'flex max-w-[80%] flex-col gap-2',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* 文字气泡 */}
        <div
          className={cn(
            'rounded-2xl px-4 py-2.5 text-sm',
            isUser
              ? 'rounded-tr-sm bg-primary text-primary-foreground'
              : 'rounded-tl-sm bg-card border border-border/50'
          )}
        >
          {message.content}
        </div>

        {/* 资源卡片网格 */}
        {message.resources && message.resources.length > 0 && (
          <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {message.resources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onPreview={handlePreview}
              />
            ))}
          </div>
        )}
      </div>

      {/* 预览弹窗 */}
      <ResourcePreviewModal
        resource={previewResource}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
