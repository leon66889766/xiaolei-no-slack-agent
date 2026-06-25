'use client';

import { useState } from 'react';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Link as LinkIcon,
  Download,
  Eye,
  ExternalLink,
  MoreVertical,
  Trash2,
  Pencil,
} from 'lucide-react';
import type { Resource } from '@/lib/types';
import { cn } from '@/lib/utils/cn';
import {
  formatRelativeTime,
  typeLabel,
  typeColor,
} from '@/lib/utils/format';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/** 资源类型图标映射 */
const typeIconMap = {
  image: ImageIcon,
  video: Video,
  document: FileText,
  link: LinkIcon,
};

interface ResourceCardProps {
  resource: Resource;
  onPreview?: (resource: Resource) => void;
  onDownload?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  showAdminActions?: boolean;
}

/**
 * 通用资源卡片
 * 前台/后台复用
 */
export function ResourceCard({
  resource,
  onPreview,
  onDownload,
  onDelete,
  onEdit,
  showAdminActions = false,
}: ResourceCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const Icon = typeIconMap[resource.type];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(resource);
    } else {
      window.open(`/api/resources/${resource.id}/download`, '_blank');
    }
  };

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-lg hover:border-primary/30 cursor-pointer"
      onClick={() => onPreview?.(resource)}
    >
      {/* 缩略图区域 */}
      <div className="relative aspect-video overflow-hidden bg-muted/30">
        {resource.type === 'image' && resource.filePath ? (
          <img
            src={resource.fileUrl}
            alt={resource.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : resource.type === 'video' && resource.filePath ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <Video className="h-12 w-12 text-purple-500/60" />
          </div>
        ) : resource.type === 'link' ? (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-900/20 to-teal-900/20">
            <LinkIcon className="h-12 w-12 text-green-500/60" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-900/20 to-red-900/20">
            <FileText className="h-12 w-12 text-orange-500/60" />
          </div>
        )}

        {/* 类型标签 */}
        <div className="absolute left-2 top-2">
          <Badge
            variant="soft"
            className={cn('backdrop-blur-md', typeColor(resource.type))}
          >
            <Icon className="mr-1 h-3 w-3" />
            {typeLabel(resource.type)}
          </Badge>
        </div>

        {/* 管理操作菜单 */}
        {showAdminActions && (
          <div className="absolute right-2 top-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-background/80 backdrop-blur-md opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            {showMenu && (
              <div
                className="absolute right-0 top-10 z-10 w-32 rounded-lg border bg-popover p-1 shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(resource);
                    }}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    编辑
                  </button>
                )}
                {onDelete && (
                  <button
                    className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(resource);
                    }}
                  >
                    <Trash2 className="mr-2 h-3.5 w-3.5" />
                    删除
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 信息区域 */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-1 line-clamp-1 text-sm font-semibold">{resource.title}</h3>
        {resource.description && (
          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
            {resource.description}
          </p>
        )}

        {/* 标签 */}
        {resource.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {resource.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-[10px]">
                {tag.name}
              </Badge>
            ))}
            {resource.tags.length > 3 && (
              <Badge variant="outline" className="text-[10px]">
                +{resource.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* 底部信息 */}
        <div className="mt-auto flex items-center justify-between pt-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <Eye className="h-3 w-3" />
              {resource.viewCount}
            </span>
            <span className="flex items-center gap-0.5">
              <Download className="h-3 w-3" />
              {resource.downloadCount}
            </span>
          </div>
          <span>{formatRelativeTime(resource.createdAt)}</span>
        </div>
      </div>

      {/* 悬浮操作按钮 */}
      <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Button
          size="sm"
          variant="secondary"
          className="h-7 px-2 text-xs"
          onClick={handleDownload}
        >
          {resource.type === 'link' ? (
            <>
              <ExternalLink className="mr-1 h-3 w-3" />
              打开
            </>
          ) : (
            <>
              <Download className="mr-1 h-3 w-3" />
              下载
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
