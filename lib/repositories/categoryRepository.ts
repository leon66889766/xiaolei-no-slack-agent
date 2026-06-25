import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/index';
import type {
  Category,
  CategoryCreateData,
  CategoryUpdateData,
} from '@/lib/types';

/** 数据库行类型 */
interface CategoryRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface CategoryWithCountRow extends CategoryRow {
  resource_count: number;
}

/**
 * 将数据库行映射为 Category 对象
 */
function mapRow(row: CategoryWithCountRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    resourceCount: row.resource_count ?? 0,
    createdAt: row.created_at,
  };
}

/**
 * 分类 Repository
 * 提供分类的 CRUD 操作
 */
export const categoryRepository = {
  /**
   * 查询全部分类（含资源计数）
   */
  findAll(): Category[] {
    const db = getDb();
    const rows = db.prepare(`
      SELECT c.*, COUNT(r.id) as resource_count
      FROM categories c
      LEFT JOIN resources r ON r.category_id = c.id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `).all() as CategoryWithCountRow[];
    return rows.map(mapRow);
  },

  /**
   * 按 ID 查询分类
   */
  findById(id: string): Category | null {
    const db = getDb();
    const row = db.prepare(`
      SELECT c.*, COUNT(r.id) as resource_count
      FROM categories c
      LEFT JOIN resources r ON r.category_id = c.id
      WHERE c.id = ?
      GROUP BY c.id
    `).get(id) as CategoryWithCountRow | undefined;
    return row ? mapRow(row) : null;
  },

  /**
   * 按名称查询分类
   */
  findByName(name: string): Category | null {
    const db = getDb();
    const row = db.prepare(`
      SELECT c.*, COUNT(r.id) as resource_count
      FROM categories c
      LEFT JOIN resources r ON r.category_id = c.id
      WHERE c.name = ?
      GROUP BY c.id
    `).get(name) as CategoryWithCountRow | undefined;
    return row ? mapRow(row) : null;
  },

  /**
   * 创建分类
   */
  create(data: CategoryCreateData): Category {
    const db = getDb();
    const id = nanoid();
    const now = new Date().toISOString();
    const description = data.description ?? '';

    db.prepare(`
      INSERT INTO categories (id, name, description, created_at)
      VALUES (?, ?, ?, ?)
    `).run(id, data.name, description, now);

    return {
      id,
      name: data.name,
      description,
      resourceCount: 0,
      createdAt: now,
    };
  },

  /**
   * 更新分类
   */
  update(id: string, data: CategoryUpdateData): Category | null {
    const db = getDb();
    const existing = this.findById(id);
    if (!existing) return null;

    const now = new Date().toISOString();
    const name = data.name ?? existing.name;
    const description = data.description ?? existing.description;

    db.prepare(`
      UPDATE categories SET name = ?, description = ?, created_at = created_at
      WHERE id = ?
    `).run(name, description, id);

    return this.findById(id);
  },

  /**
   * 删除分类
   * 关联资源的外键设为 NULL（ON DELETE SET NULL）
   */
  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return result.changes > 0;
  },
};
