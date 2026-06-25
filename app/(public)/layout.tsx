import { ReactNode } from 'react';
import { Navbar } from '@/components/shared/Navbar';

/**
 * 前台布局
 * 包含顶部导航栏
 */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-mesh">
      <Navbar />
      <main className="relative">{children}</main>
    </div>
  );
}
