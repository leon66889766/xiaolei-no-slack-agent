import { ResourceType } from '@/lib/types';

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 人类可读的文件大小字符串
 */
export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes === null || bytes === undefined) return '-';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  // 小于 1KB 时取整，否则保留 1 位小数
  if (unitIndex === 0) {
    return `${Math.round(size)} ${units[unitIndex]}`;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * 格式化日期
 * @param isoString ISO 8601 日期字符串
 * @returns 本地化的日期时间字符串
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '-';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

/**
 * 相对时间格式化
 * @param isoString ISO 8601 日期字符串
 * @returns 相对时间字符串（如"3 分钟前"）
 */
export function formatRelativeTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';

  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '-';

  const now = Date.now();
  const diff = now - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return '刚刚';
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 30) return `${days} 天前`;
  return formatDate(isoString);
}

/** 资源类型 → 图标名称映射（lucide-react） */
export const typeIconMap: Record<ResourceType, string> = {
  image: 'Image',
  video: 'Video',
  document: 'FileText',
  link: 'Link',
};

/** 资源类型 → 中文标签映射 */
export const typeLabelMap: Record<ResourceType, string> = {
  image: '图片',
  video: '视频',
  document: '文档',
  link: '链接',
};

/** 资源类型 → Tailwind 颜色类映射 */
export const typeColorMap: Record<ResourceType, string> = {
  image: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
  video: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30',
  document: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30',
  link: 'text-green-500 bg-green-50 dark:bg-green-950/30',
};

/**
 * 获取资源类型的中文标签
 */
export function typeLabel(type: ResourceType): string {
  return typeLabelMap[type] || type;
}

/**
 * 获取资源类型的图标名称
 */
export function typeIcon(type: ResourceType): string {
  return typeIconMap[type] || 'File';
}

/**
 * 获取资源类型的颜色类
 */
export function typeColor(type: ResourceType): string {
  return typeColorMap[type] || '';
}

/**
 * 截断文本
 * @param text 原始文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
