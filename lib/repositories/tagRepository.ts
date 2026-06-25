import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/index';
import type { Tag, TagCreateData } from '@/lib/types';

/** 数据库行类型 */
interface TagRow {
  id: string;
  name: string;
  created_at: string;
}

interface TagWithCountRow extends TagRow {
  resource_count: number;
}

/**
 * 将数据库行映射为 Tag 对象
 */
function mapRow(row: TagWithCountRow): Tag {
  return {
    id: row.id,
    name: row.name,
    resourceCount: row.resource_count ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * 标签 Repository
 * 提供标签的 CRUD 和资源标签关联管理
 */
export const tagRepository = {
  /**
   * 查询全部标签（含资源计数）
   */
  findAll(): Tag[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT t.*, COUNT(rt.resource_id) as resource_count
      FROM tags t
      LEFT JOIN resource_tags rt ON rt.tag_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at ASC
    `).all() as TagWithCountRow[];
    return rows.map(mapRow);
  },

  /**
   * 按 ID 查询标签
   */
  findById(id: string): Tag | null {
    const db = getDb();
    const row = db.prepare(`
      SELECT t.*, COUNT(rt.resource_id) as resource_count
      FROM tags t
      LEFT JOIN resource_tags rt ON rt.tag_id = t.id
      WHERE t.id = ?
      GROUP BY t.id
    `).get(id) as TagWithCountRow | undefined;
    return row ? mapRow(row) : null;
  },

  /**
   * 按名称查询标签
   */
  findByName(name: string): Tag | null {
    const db = getDb();
    const row = db.prepare(`
      SELECT t.*, COUNT(rt.resource_id) as resource_count
      FROM tags t
      LEFT JOIN resource_tags rt ON rt.tag_id = t.id
      WHERE t.name = ?
      GROUP BY t.id
    `).get(name) as TagWithCountRow | undefined;
    return row ? mapRow(row) : null;
  },

  /**
   * 查询资源关联的全部标签
   */
  findByResourceId(resourceId: string): Tag[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT t.id, t.name, t.created_at, 0 as resource_count
      FROM tags t
      INNER JOIN resource_tags rt ON rt.tag_id = t.id
      WHERE rt.resource_id = ?
      ORDER BY t.name ASC
    `).all(resourceId) as TagRow[];
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      resourceCount: 0,
      createdAt: row.created_at,
    }));
  },

  /**
   * 创建标签
   */
  create(data: TagCreateData): Tag {
    const db = getDb();
    const id = nanoid();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO tags (id, name, created_at)
      VALUES (?, ?, ?)
    `).run(id, data.name, now);

    return {
      id,
      name: data.name,
      resourceCount: 0,
      createdAt: now,
    };
  },

  /**
   * 创建标签（如不存在），返回标签对象
   */
  findOrCreate(name: string): Tag {
    const existing = this.findByName(name);
    if (existing) return existing;
    return this.create({ name });
  },

  /**
   * 删除标签
   * 关联的 resource_tags 会级联删除
   */
  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM tags WHERE id = ?').run(id);
    return result.changes > 0;
  },

  /**
   * 同步资源的标签关联
   * 先删除旧关联，再插入新关联
   * @param resourceId 资源 ID
   * @param tagIds 标签 ID 数组
   */
  syncForResource(resourceId: string, tagIds: string[]): void {
    const db = getDb();

    const sync = db.transaction(() => {
      // 删除旧关联
      db.prepare('DELETE FROM resource_tags WHERE resource_id = ?').run(resourceId);

      // 插入新关联
      const stmt = db.prepare(`
        INSERT INTO resource_tags (resource_id, tag_id)
        VALUES (?, ?)
      `);
      for (const tagId of tagIds) {
        stmt.run(resourceId, tagId);
      }
    });

    sync();
  },
};
