'use client';

import Link from 'next/link';
import { Sparkles, Github, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

/**
 * 前台顶部导航栏
 */
export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand shadow-md shadow-primary/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight">小雷没摸鱼</span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              AI 资源助手
            </span>
          </div>
        </Link>

        {/* 操作区 */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <Settings className="mr-1.5 h-4 w-4" />
              管理后台
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
