'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { AdminShell } from '@/components/admin/AdminShell';
import { Loader2 } from 'lucide-react';

/**
 * 后台受保护布局
 * - 鉴权守卫：未登录重定向到 /admin/login
 * - 渲染 AdminShell（侧边栏 + 顶栏）
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated && pathname !== '/admin/login') {
        router.replace('/admin/login');
      } else {
        setChecked(true);
      }
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // 登录页不显示 AdminShell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // 加载中
  if (isLoading || (!checked && !isAuthenticated)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
