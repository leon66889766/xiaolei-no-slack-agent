import { resourceRepository } from '@/lib/repositories/resourceRepository';
import { tagRepository } from '@/lib/repositories/tagRepository';
import { searchService } from '@/lib/services/searchService';
import { fileService } from '@/lib/services/fileService';
import type {
  Resource,
  ResourceCreateData,
  ResourceUpdateData,
  ResourceType,
  SearchResult,
} from '@/lib/types';

/**
 * 资源服务
 * 编排上传/链接/删除/更新/搜索
 * 写操作后自动失效搜索索引
 */
export const resourceService = {
  /**
   * 上传文件资源
   * @param fileBuffer 文件 Buffer
   * @param originalName 原始文件名
   * @param mimetype MIME 类型
   * @param title 资源标题
   * @param description 描述
   * @param categoryId 分类 ID
   * @param tagNames 标签名数组（自动创建不存在的标签）
   * @returns 创建的 Resource
   */
  uploadResource(
    fileBuffer: Buffer,
    originalName: string,
    mimetype: string,
    title: string,
    description: string,
    categoryId: string | null,
    tagNames: string[]
  ): Resource {
    // 保存文件
    const fileMeta = fileService.saveFile(fileBuffer, originalName, mimetype);

    // 处理标签（创建不存在的）
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const trimmed = tagName.trim();
      if (trimmed) {
        const tag = tagRepository.findOrCreate(trimmed);
        tagIds.push(tag.id);
      }
    }

    // 创建资源记录
    const createData: ResourceCreateData = {
      title,
      description,
      type: fileMeta.type,
      filePath: fileMeta.filePath,
      fileUrl: fileMeta.fileUrl,
      fileSize: fileMeta.fileSize,
      fileFormat: fileMeta.fileFormat,
      thumbnailPath: fileMeta.thumbnailPath,
      categoryId,
      tagIds,
    };

    const resource = resourceRepository.create(createData);

    // 失效搜索索引
    searchService.invalidate();

    return resource;
  },

  /**
   * 添加链接资源
   * @param url 链接 URL
   * @param title 资源标题
   * @param description 描述
   * @param categoryId 分类 ID
   * @param tagNames 标签名数组
   * @returns 创建的 Resource
   */
  addLink(
    url: string,
    title: string,
    description: string,
    categoryId: string | null,
    tagNames: string[]
  ): Resource {
    // 处理标签
    const tagIds: string[] = [];
    for (const tagName of tagNames) {
      const trimmed = tagName.trim();
      if (trimmed) {
        const tag = tagRepository.findOrCreate(trimmed);
        tagIds.push(tag.id);
      }
    }

    const createData: ResourceCreateData = {
      title,
      description,
      type: 'link' as ResourceType,
      filePath: null,
      fileUrl: url,
      fileSize: null,
      fileFormat: null,
      thumbnailPath: null,
      categoryId,
      tagIds,
    };

    const resource = resourceRepository.create(createData);

    // 失效搜索索引
    searchService.invalidate();

    return resource;
  },

  /**
   * 更新资源
   */
  updateResource(id: string, data: ResourceUpdateData): Resource | null {
    // 处理标签名转 ID
    let updateData: ResourceUpdateData = { ...data };

    if (data.tagIds !== undefined) {
      // 如果传入的是标签名而非 ID，自动转换
      // 此处假设传入的已经是标签 ID 数组
      updateData.tagIds = data.tagIds;
    }

    const resource = resourceRepository.update(id, updateData);
    if (resource) {
      searchService.invalidate();
    }
    return resource;
  },

  /**
   * 更新资源（支持标签名）
   * @param id 资源 ID
   * @param data 更新数据
   * @param tagNames 标签名数组（可选，自动创建/查找）
   */
  updateResourceWithTags(
    id: string,
    data: Omit<ResourceUpdateData, 'tagIds'>,
    tagNames?: string[]
  ): Resource | null {
    const updateData: ResourceUpdateData = { ...data };

    if (tagNames !== undefined) {
      const tagIds: string[] = [];
      for (const tagName of tagNames) {
        const trimmed = tagName.trim();
        if (trimmed) {
          const tag = tagRepository.findOrCreate(trimmed);
          tagIds.push(tag.id);
        }
      }
      updateData.tagIds = tagIds;
    }

    const resource = resourceRepository.update(id, updateData);
    if (resource) {
      searchService.invalidate();
    }
    return resource;
  },

  /**
   * 删除资源
   * 同时删除关联文件
   */
  deleteResource(id: string): boolean {
    const resource = resourceRepository.findById(id);
    if (!resource) return false;

    // 删除文件（link 类型无文件）
    if (resource.filePath) {
      fileService.deleteFile(resource.filePath);
    }

    const result = resourceRepository.delete(id);
    if (result) {
      searchService.invalidate();
    }
    return result;
  },

  /**
   * 搜索资源
   * @param query 查询文本
   * @param limit 返回上限
   * @returns 搜索结果数组
   */
  searchResources(query: string, limit: number = 10): SearchResult[] {
    return searchService.search(query, limit);
  },

  /**
   * 获取资源详情并自增浏览计数
   */
  getResource(id: string): Resource | null {
    const resource = resourceRepository.findById(id);
    if (resource) {
      resourceRepository.incrementView(id);
    }
    return resource;
  },

  /**
   * 自增下载计数
   */
  incrementDownload(id: string): void {
    resourceRepository.incrementDownload(id);
  },
};
