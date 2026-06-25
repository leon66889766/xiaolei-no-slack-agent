import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/index';
import { tagRepository } from '@/lib/repositories/tagRepository';
import { categoryRepository } from '@/lib/repositories/categoryRepository';
import type {
  Resource,
  ResourceQuery,
  ResourceCreateData,
  ResourceUpdateData,
  ResourceType,
} from '@/lib/types';

/** 数据库行类型 */
interface ResourceRow {
  id: string;
  title: string;
  description: string;
  type: string;
  file_path: string | null;
  file_url: string;
  file_size: number | null;
  file_format: string | null;
  thumbnail_path: string | null;
  category_id: string | null;
  view_count: number;
  download_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * 将数据库行映射为 Resource 对象（不含 tags/category，需单独填充）
 */
function mapRow(row: ResourceRow): Resource {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type as ResourceType,
    filePath: row.file_path,
    fileUrl: row.file_url,
    fileSize: row.file_size,
    fileFormat: row.file_format,
    thumbnailPath: row.thumbnail_path,
    categoryId: row.category_id,
    category: null,
    tags: [],
    viewCount: row.view_count,
    downloadCount: row.download_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * 填充 Resource 的 category 和 tags
 */
function enrichResource(resource: Resource): Resource {
  // 填充分类
  if (resource.categoryId) {
    resource.category = categoryRepository.findById(resource.categoryId);
  }
  // 填充标签
  resource.tags = tagRepository.findByResourceId(resource.id);
  return resource;
}

/**
 * 批量填充 Resource 的 category 和 tags
 */
function enrichResources(resources: Resource[]): Resource[] {
  return resources.map(enrichResource);
}

/**
 * 资源 Repository
 * 提供资源的 CRUD、多条件查询、关联查询
 */
export const resourceRepository = {
  /**
   * 多条件查询资源列表（带分页）
   * 支持 keyword / type / categoryId / tag 过滤
   */
  findAll(query: ResourceQuery = {}): { items: Resource[]; total: number } {
    const db = getDb();
    const {
      keyword,
      type,
      categoryId,
      tag,
      page = 1,
      limit = 20,
    } = query;

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (keyword) {
      conditions.push('(r.title LIKE ? OR r.description LIKE ?)');
      const kw = `%${keyword}%`;
      params.push(kw, kw);
    }

    if (type) {
      conditions.push('r.type = ?');
      params.push(type);
    }

    if (categoryId) {
      conditions.push('r.category_id = ?');
      params.push(categoryId);
    }

    if (tag) {
      conditions.push(
        `EXISTS (SELECT 1 FROM resource_tags rt JOIN tags t ON t.id = rt.tag_id WHERE rt.resource_id = r.id AND t.name = ?)`
      );
      params.push(tag);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const offset = (page - 1) * limit;

    // 查询总数
    const countSql = `SELECT COUNT(DISTINCT r.id) as total FROM resources r ${whereClause}`;
    const countResult = db.prepare(countSql).get(...params) as { total: number };
    const total = countResult.total;

    // 查询列表
    const listSql = `
      SELECT r.* FROM resources r
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const rows = db.prepare(listSql).all(...params, limit, offset) as ResourceRow[];

    const items = enrichResources(rows.map(mapRow));

    return { items, total };
  },

  /**
   * 查询全部资源（不分页，用于搜索索引构建）
   */
  findAllForIndex(): Resource[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT * FROM resources ORDER BY created_at DESC
    `).all() as ResourceRow[];
    return enrichResources(rows.map(mapRow));
  },

  /**
   * 按 ID 查询资源（含 category 和 tags）
   */
  findById(id: string): Resource | null {
    const db = getDb();
    const row = db.prepare('SELECT * FROM resources WHERE id = ?').get(id) as
      | ResourceRow
      | undefined;
    if (!row) return null;
    return enrichResource(mapRow(row));
  },

  /**
   * 按 ID 数组批量查询
   */
  findByIds(ids: string[]): Resource[] {
    if (ids.length === 0) return [];
    const db = getDb();
    const placeholders = ids.map(() => '?').join(',');
    const rows = db.prepare(
      `SELECT * FROM resources WHERE id IN (${placeholders})`
    ).all(...ids) as ResourceRow[];
    return enrichResources(rows.map(mapRow));
  },

  /**
   * 创建资源
   */
  create(data: ResourceCreateData): Resource {
    const db = getDb();
    const id = nanoid();
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO resources (
        id, title, description, type, file_path, file_url,
        file_size, file_format, thumbnail_path, category_id,
        view_count, download_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `);

    stmt.run(
      id,
      data.title,
      data.description,
      data.type,
      data.filePath,
      data.fileUrl,
      data.fileSize,
      data.fileFormat,
      data.thumbnailPath,
      data.categoryId,
      now,
      now
    );

    // 同步标签
    if (data.tagIds && data.tagIds.length > 0) {
      tagRepository.syncForResource(id, data.tagIds);
    }

    return this.findById(id)!;
  },

  /**
   * 更新资源
   */
  update(id: string, data: ResourceUpdateData): Resource | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const db = getDb();
    const now = new Date().toISOString();

    const title = data.title ?? existing.title;
    const description = data.description ?? existing.description;
    const categoryId = data.categoryId !== undefined ? data.categoryId : existing.categoryId;

    db.prepare(`
      UPDATE resources
      SET title = ?, description = ?, category_id = ?, updated_at = ?
      WHERE id = ?
    `).run(title, description, categoryId, now, id);

    // 同步标签
    if (data.tagIds !== undefined) {
      tagRepository.syncForResource(id, data.tagIds);
    }

    return this.findById(id);
  },

  /**
   * 删除资源
   * resource_tags 会级联删除
   */
  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM resources WHERE id = ?').run(id);
    return result.changes > 0;
  },

  /**
   * 自增下载计数
   */
  incrementDownload(id: string): void {
    const db = getDb();
    db.prepare('UPDATE resources SET download_count = download_count + 1 WHERE id = ?').run(id);
  },

  /**
   * 自增浏览计数
   */
  incrementView(id: string): void {
    const db = getDb();
    db.prepare('UPDATE resources SET view_count = view_count + 1 WHERE id = ?').run(id);
  },
};
