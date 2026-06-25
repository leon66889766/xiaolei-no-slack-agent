import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/index';

/** 默认分类种子数据 */
const DEFAULT_CATEGORIES = [
  { name: '图片', description: '图片资源' },
  { name: '视频', description: '视频资源' },
  { name: '文档', description: '文档资源' },
  { name: '链接', description: '外部链接资源' },
];

/**
 * 插入默认分类种子数据
 * 幂等：已存在的分类不会重复插入
 */
export function seedCategories(): void {
  const db = getDb();
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO categories (id, name, description, created_at)
    VALUES (?, ?, ?, ?)
  `);

  for (const cat of DEFAULT_CATEGORIES) {
    stmt.run(nanoid(), cat.name, cat.description, now);
  }
}

/**
 * 检查是否已有种子数据
 */
export function isSeeded(): boolean {
  const db = getDb();
  const result = db.prepare('SELECT COUNT(*) as count FROM categories').get() as {
    count: number;
  };
  return result.count > 0;
}

/**
 * 执行完整的种子初始化
 */
export function runSeed(): void {
  seedCategories();
  console.log('[Seed] 默认分类已插入');
}
