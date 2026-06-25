'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUGGESTIONS = [
  { icon: '🖼️', text: '给我一张科技感的背景图' },
  { icon: '📹', text: '有哪些视频资源？' },
  { icon: '📄', text: '帮我找项目文档' },
  { icon: '🔗', text: '有什么有用的链接资源？' },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void;
}

/**
 * 空状态欢迎引导区
 */
export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-12 text-center animate-fade-in">
      {/* Logo 动画 */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-brand shadow-xl shadow-primary/30 animate-pulse-glow">
        <Sparkles className="h-10 w-10 text-white" />
      </div>

      <h2 className="mb-2 text-2xl font-bold">
        <span className="gradient-text">小雷没摸鱼</span> Agent
      </h2>
      <p className="mb-8 max-w-md text-sm text-muted-foreground">
        用自然语言对话，快速检索你的图片、视频、文档和链接资源。
        试试以下对话，或者直接输入你的需求。
      </p>

      {/* 建议对话 */}
      <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
        {SUGGESTIONS.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            className="h-auto justify-start px-4 py-3 text-left text-sm"
            onClick={() => onSuggestionClick(suggestion.text)}
          >
            <span className="mr-2 text-lg">{suggestion.icon}</span>
            {suggestion.text}
          </Button>
        ))}
      </div>
    </div>
  );
}
