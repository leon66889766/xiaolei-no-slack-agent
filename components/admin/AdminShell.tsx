'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutGrid,
  FolderTree,
  Tags,
  LogOut,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import { useAuth } from '@/hooks/useAuth';

/** 导航项配置 */
const NAV_ITEMS = [
  { href: '/admin', label: '资源管理', icon: LayoutGrid },
  { href: '/admin/categories', label: '分类管理', icon: FolderTree },
  { href: '/admin/tags', label: '标签管理', icon: Tags },
];

interface AdminShellProps {
  children: React.ReactNode;
}

/**
 * 后台外壳组件
 * 包含侧边栏 + 顶栏
 */
export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const { session, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* 侧边栏 */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-60 flex-col border-r bg-card md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">小雷没摸鱼</span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              管理后台
            </span>
          </div>
        </div>

        {/* 导航 */}
        <nav className="flex-1 space-y-1 p-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* 底部操作 */}
        <div className="border-t p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              返回前台
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start text-destructive hover:text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            退出登录
          </Button>
        </div>
      </aside>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col md:pl-60">
        {/* 顶栏 */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-xl md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold">管理后台</span>
          </div>

          {/* 导航（移动端） */}
          <nav className="flex gap-1 md:hidden">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:block">
            <span className="text-sm text-muted-foreground">
              管理员：<span className="font-medium text-foreground">{session?.username || 'admin'}</span>
            </span>
          </div>

          {/* 移动端退出 */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-destructive"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </header>

        {/* 页面内容 */}
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
