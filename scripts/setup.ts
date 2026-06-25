/**
 * 一键初始化脚本
 * - 创建上传目录
 * - 初始化数据库 schema
 * - 插入种子数据
 *
 * 运行: npm run setup
 */
import { getDb } from '@/lib/db/index';
import { initSchema } from '@/lib/db/schema';
import { runSeed, isSeeded } from '@/lib/db/seed';
import { fileService } from '@/lib/services/fileService';
import fs from 'fs';
import path from 'path';

function main() {
  console.log('========================================');
  console.log('  小雷没摸鱼 Agent — 初始化脚本');
  console.log('========================================\n');

  // 1. 创建上传目录
  console.log('[1/3] 创建上传目录...');
  fileService.ensureUploadDirs();
  console.log('  ✓ 上传目录已就绪: public/uploads/{image,video,document}\n');

  // 2. 初始化数据库 schema
  console.log('[2/3] 初始化数据库 schema...');
  const db = getDb();
  initSchema(db);
  console.log('  ✓ 数据库 schema 已就绪: data/app.db\n');

  // 3. 插入种子数据
  console.log('[3/3] 检查并插入种子数据...');
  if (isSeeded()) {
    console.log('  ⚠ 数据库已有种子数据，跳过\n');
  } else {
    runSeed();
    console.log();
  }

  console.log('========================================');
  console.log('  ✓ 初始化完成！');
  console.log('========================================');
  console.log('\n默认管理员账号:');
  console.log('  用户名: admin');
  console.log('  密码:   admin123');
  console.log('\n启动开发服务器: npm run dev');
  console.log('访问地址: http://localhost:3000');
  console.log('后台管理: http://localhost:3000/admin\n');
}

main();
