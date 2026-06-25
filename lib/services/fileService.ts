import path from 'path';
import fs from 'fs';
import { nanoid } from 'nanoid';
import { UPLOAD_BASE_DIR, UPLOAD_URL_PREFIX } from '@/lib/config';
import type { FileMeta, ResourceType } from '@/lib/types';

/** MIME 类型 → ResourceType 映射 */
const MIME_TYPE_MAP: Record<string, ResourceType> = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'image/bmp': 'image',
  'image/tiff': 'image',
  'image/x-icon': 'image',
  'video/mp4': 'video',
  'video/webm': 'video',
  'video/ogg': 'video',
  'video/quicktime': 'video',
  'video/x-msvideo': 'video',
  'video/x-matroska': 'video',
  'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
  'text/markdown': 'document',
  'text/csv': 'document',
  'application/json': 'document',
  'application/zip': 'document',
  'application/x-rar-compressed': 'document',
  'application/x-7z-compressed': 'document',
};

/** 扩展名 → ResourceType 映射（备用） */
const EXTENSION_MAP: Record<string, ResourceType> = {
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  bmp: 'image',
  tiff: 'image',
  tif: 'image',
  ico: 'image',
  mp4: 'video',
  webm: 'video',
  ogg: 'video',
  mov: 'video',
  avi: 'video',
  mkv: 'video',
  flv: 'video',
  wmv: 'video',
  pdf: 'document',
  doc: 'document',
  docx: 'document',
  xls: 'document',
  xlsx: 'document',
  ppt: 'document',
  pptx: 'document',
  txt: 'document',
  md: 'document',
  csv: 'document',
  json: 'document',
  zip: 'document',
  rar: 'document',
  '7z': 'document',
  tar: 'document',
  gz: 'document',
};

/**
 * 文件服务
 * 负责文件保存/删除、类型识别
 */
export const fileService = {
  /**
   * 检测资源类型
   * @param mimetype MIME 类型
   * @param filename 文件名
   * @returns ResourceType
   */
  detectType(mimetype: string, filename: string): ResourceType {
    // 先按 MIME 类型判断
    if (mimetype && MIME_TYPE_MAP[mimetype]) {
      return MIME_TYPE_MAP[mimetype];
    }
    // 再按扩展名判断
    const ext = this.getExtension(filename);
    if (ext && EXTENSION_MAP[ext]) {
      return EXTENSION_MAP[ext];
    }
    // 默认为文档
    return 'document';
  },

  /**
   * 获取文件扩展名（小写，不含点）
   */
  getExtension(filename: string): string {
    const parts = filename.split('.');
    if (parts.length < 2) return '';
    return parts[parts.length - 1].toLowerCase();
  },

  /**
   * 保存文件到上传目录
   * @param fileBuffer 文件 Buffer
   * @param originalName 原始文件名
   * @param mimetype MIME 类型
   * @returns 文件元信息
   */
  saveFile(fileBuffer: Buffer, originalName: string, mimetype: string): FileMeta {
    const type = this.detectType(mimetype, originalName);
    const ext = this.getExtension(originalName);
    const fileName = `${nanoid()}${ext ? '.' + ext : ''}`;

    // 构建文件路径
    const typeDir = path.join(UPLOAD_BASE_DIR, type);
    const absoluteFilePath = path.join(typeDir, fileName);
    const relativeFilePath = `${UPLOAD_URL_PREFIX}/${type}/${fileName}`;

    // 确保目录存在
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(absoluteFilePath, fileBuffer);

    return {
      filePath: relativeFilePath,
      fileUrl: relativeFilePath,
      fileSize: fileBuffer.length,
      fileFormat: ext,
      thumbnailPath: null,
      type,
    };
  },

  /**
   * 删除文件
   * @param filePath 文件相对路径（如 /uploads/image/xxx.png）
   */
  deleteFile(filePath: string | null): void {
    if (!filePath) return;

    // 将 URL 路径转为文件系统路径
    const absolutePath = this.getAbsolutePath(filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  },

  /**
   * 将相对 URL 路径转为绝对文件系统路径
   * @param relPath 相对路径（如 /uploads/image/xxx.png）
   * @returns 绝对路径
   */
  getAbsolutePath(relPath: string): string {
    // 移除 /uploads 前缀，映射到 public/uploads
    if (relPath.startsWith(UPLOAD_URL_PREFIX)) {
      const subPath = relPath.slice(UPLOAD_URL_PREFIX.length);
      return path.join(UPLOAD_BASE_DIR, subPath);
    }
    return relPath;
  },

  /**
   * 确保上传目录存在
   */
  ensureUploadDirs(): void {
    const types: ResourceType[] = ['image', 'video', 'document'];
    for (const type of types) {
      const dir = path.join(UPLOAD_BASE_DIR, type);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    }
  },
};
