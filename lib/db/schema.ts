import type { Database as DatabaseType } from 'better-sqlite3';

/**
 * 数据库建表 SQL
 * 对应架构文档 3.1 节
 */
const SCHEMA_SQL = `
-- 资源主表
CREATE TABLE IF NOT EXISTS resources (
  id             TEXT PRIMARY KEY,
  title          TEXT NOT NULL,
  description    TEXT DEFAULT '',
  type           TEXT NOT NULL CHECK(type IN ('image','video','document','link')),
  file_path      TEXT,
  file_url       TEXT NOT NULL,
  file_size      INTEGER,
  file_format    TEXT,
  thumbnail_path TEXT,
  category_id    TEXT REFERENCES categories(id) ON DELETE SET NULL,
  view_count     INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at     TEXT NOT NULL,
  updated_at     TEXT NOT NULL
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  created_at  TEXT NOT NULL
);

-- 标签表
CREATE TABLE IF NOT EXISTS tags (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);

-- 资源-标签 多对多关联表
CREATE TABLE IF NOT EXISTS resource_tags (
  resource_id TEXT NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  tag_id      TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (resource_id, tag_id)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_resources_type     ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category_id);
CREATE INDEX IF NOT EXISTS idx_resources_created  ON resources(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_resource_tags_tag  ON resource_tags(tag_id);
`;

/**
 * 初始化数据库 schema
 * 幂等执行，重复调用不会报错
 * @param db better-sqlite3 数据库实例
 */
export function initSchema(db: DatabaseType): void {
  db.exec(SCHEMA_SQL);
}

/**
 * 获取表的行数
 */
export function getTableCount(db: DatabaseType, tableName: string): number {
  const result = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as {
    count: number;
  };
  return result.count;
}
