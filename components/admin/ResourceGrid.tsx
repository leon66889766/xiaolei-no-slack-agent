'use client';

import { useState } from 'react';
import { Trash2, Eye, Download, ExternalLink, ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react';
import type { Resource } from '@/lib/types';
import { ResourceCard } from '@/components/shared/ResourceCard';
import { ResourcePreviewModal } from '@/components/shared/ResourcePreviewModal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface ResourceGridProps {
  resources: Resource[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  onDelete: (id: string) => Promise<void>;
}

/**
 * 后台资源网格 + 分页
 */
export function ResourceGrid({
  resources,
  isLoading,
  page,
  totalPages,
  onPageChange,
  onRefresh,
  onDelete,
}: ResourceGridProps) {
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (resource: Resource) => {
    if (!confirm(`确定要删除「${resource.title}」吗？此操作不可撤销。`)) return;
    setDeletingId(resource.id);
    try {
      await onDelete(resource.id);
      toast.success('删除成功');
      onRefresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = (resource: Resource) => {
    setPreviewResource(resource);
    setPreviewOpen(true);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <PackageOpen className="mb-4 h-16 w-16 text-muted-foreground/40" />
        <h3 className="mb-1 text-lg font-semibold">暂无资源</h3>
        <p className="text-sm text-muted-foreground">
          点击右上角「上传」或「添加链接」来创建第一个资源
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 资源网格 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {resources.map((resource) => (
          <div key={resource.id} className={deletingId === resource.id ? 'opacity-50' : ''}>
            <ResourceCard
              resource={resource}
              onPreview={handlePreview}
              onDelete={handleDelete}
              showAdminActions
            />
          </div>
        ))}
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="icon"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="icon"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* 预览弹窗 */}
      <ResourcePreviewModal
        resource={previewResource}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
