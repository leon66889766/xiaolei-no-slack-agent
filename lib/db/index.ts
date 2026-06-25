import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { DB_PATH } from '@/lib/config';
import { initSchema } from '@/lib/db/schema';
import path from 'path';
import fs from 'fs';

// 使用 globalThis 防 Next.js dev 模式热重载创建多个 DB 实例
const globalForDb = globalThis as unknown as { __dbInstance?: DatabaseType };

let dbInstance: DatabaseType | null = globalForDb.__dbInstance ?? null;

/**
 * 获取 SQLite 数据库单例
 * - 首次调用时创建连接并初始化 schema
 * - 开启 WAL 模式与外键约束
 * - 确保 data 目录存在
 */
export function getDb(): DatabaseType {
  if (dbInstance) return dbInstance;

  // 确保 data 目录存在
  const dbDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  dbInstance = new Database(DB_PATH);

  // 强制使用 UTF-8 编码，避免 Windows 下中文字符乱码
  dbInstance.pragma('encoding = "UTF-8"');

  // 开启 WAL 模式提升并发性能
  dbInstance.pragma('journal_mode = WAL');
  // 开启外键约束
  dbInstance.pragma('foreign_keys = ON');
  // 优化性能
  dbInstance.pragma('synchronous = NORMAL');

  // 初始化 schema
  initSchema(dbInstance);

  // 缓存到 globalThis
  globalForDb.__dbInstance = dbInstance;

  return dbInstance;
}

/**
 * 关闭数据库连接（主要用于测试和脚本）
 */
export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 执行原始 SQL（便捷方法）
 */
export function exec(sql: string): void {
  getDb().exec(sql);
}

/**
 * 准备 SQL 语句（便捷方法）
 */
export function prepare(sql: string): ReturnType<DatabaseType['prepare']> {
  return getDb().prepare(sql);
}

export type { DatabaseType };
