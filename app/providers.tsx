'use client';

import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { ReactNode } from 'react';

/**
 * 全局 Provider
 * - ThemeProvider: 深浅色主题切换
 * - Toaster: sonner Toast 通知
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            borderRadius: '0.75rem',
          },
        }}
      />
    </ThemeProvider>
  );
}
