'use client';

import { Download, ExternalLink, X, Eye, Calendar } from 'lucide-react';
import type { Resource } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  formatFileSize,
  formatDate,
  typeLabel,
} from '@/lib/utils/format';

interface ResourcePreviewModalProps {
  resource: Resource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * 资源预览模态框
 * 按类型渲染：图片放大、视频播放、文档/PDF iframe、链接摘要卡
 */
export function ResourcePreviewModal({
  resource,
  open,
  onOpenChange,
}: ResourcePreviewModalProps) {
  if (!resource) return null;

  const handleDownload = () => {
    window.open(`/api/resources/${resource.id}/download`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="border-b p-4">
          <div className="flex items-start justify-between gap-2 pr-8">
            <div>
              <DialogTitle className="text-lg">{resource.title}</DialogTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {resource.description}
              </p>
            </div>
            <Badge variant="soft">{typeLabel(resource.type)}</Badge>
          </div>
        </DialogHeader>

        {/* 预览内容 */}
        <div className="max-h-[55vh] overflow-auto bg-muted/20">
          {resource.type === 'image' && resource.filePath && (
            <div className="flex items-center justify-center p-4">
              <img
                src={resource.fileUrl}
                alt={resource.title}
                className="max-h-[50vh] max-w-full rounded-lg object-contain"
              />
            </div>
          )}

          {resource.type === 'video' && resource.filePath && (
            <div className="flex items-center justify-center p-4">
              <video
                src={resource.fileUrl}
                controls
                className="max-h-[50vh] max-w-full rounded-lg"
              >
                您的浏览器不支持视频播放。
              </video>
            </div>
          )}

          {resource.type === 'document' && resource.filePath && (
            <div className="h-[55vh] w-full">
              {resource.fileFormat === 'pdf' ? (
                <iframe
                  src={resource.fileUrl}
                  className="h-full w-full"
                  title={resource.title}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Eye className="h-12 w-12" />
                  <p>该文档格式不支持在线预览</p>
                  <p className="text-sm">请下载后查看</p>
                </div>
              )}
            </div>
          )}

          {resource.type === 'link' && (
            <div className="flex items-center justify-center p-8">
              <div className="w-full max-w-md rounded-lg border bg-card p-6 text-center">
                <ExternalLink className="mx-auto mb-3 h-12 w-12 text-green-500" />
                <h3 className="mb-2 font-semibold">{resource.title}</h3>
                <p className="mb-4 break-all text-sm text-muted-foreground">
                  {resource.fileUrl}
                </p>
                <Button asChild>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    打开链接
                  </a>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* 底部信息栏 */}
        <div className="border-t p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {resource.fileSize && (
                <span>大小: {formatFileSize(resource.fileSize)}</span>
              )}
              {resource.fileFormat && <span>格式: {resource.fileFormat}</span>}
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(resource.createdAt)}
              </span>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-2">
              {resource.type !== 'link' && (
                <Button size="sm" onClick={handleDownload}>
                  <Download className="mr-1.5 h-4 w-4" />
                  下载
                </Button>
              )}
              {resource.type === 'link' && (
                <Button size="sm" asChild>
                  <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-1.5 h-4 w-4" />
                    打开
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* 标签 */}
          {resource.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {resource.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary" className="text-xs">
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
