'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

/**
 * 底部输入框 + 发送按钮
 */
export function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * 自适应高度
   */
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, [value]);

  const handleSend = () => {
    if (!value.trim() || isLoading) return;
    onSend(value);
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container max-w-3xl px-4 py-4">
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的需求，按 Enter 发送，Shift+Enter 换行…"
              rows={1}
              disabled={disabled}
              className={cn(
                'w-full resize-none rounded-xl border border-border/60 bg-card px-4 py-3 pr-12 text-sm',
                'focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40',
                'placeholder:text-muted-foreground/60',
                'disabled:opacity-50'
              )}
            />
          </div>
          <Button
            size="icon"
            variant="gradient"
            className="h-11 w-11 shrink-0 rounded-xl"
            onClick={handleSend}
            disabled={!value.trim() || isLoading || disabled}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground/60">
          小雷没摸鱼 Agent · 基于 TF-IDF 智能检索引擎
        </p>
      </div>
    </div>
  );
}
