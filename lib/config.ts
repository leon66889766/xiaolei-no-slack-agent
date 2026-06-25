/**
 * 环境变量读取与校验
 * 统一管理所有配置项，缺失时提供默认值（开发环境友好）
 */

/** 管理员用户名 */
export const ADMIN_USERNAME: string = process.env.ADMIN_USERNAME || 'admin';

/** 管理员密码 */
export const ADMIN_PASSWORD: string = process.env.ADMIN_PASSWORD || 'admin123';

/** JWT 签名密钥 */
export const JWT_SECRET: string =
  process.env.JWT_SECRET || 'xiaolei-no-slack-agent-jwt-secret-key-2024-very-long';

/** JWT 有效期（秒），默认 7 天 */
export const JWT_EXPIRES_IN: number = 7 * 24 * 60 * 60;

/** 数据库文件路径 */
export const DB_PATH: string = process.env.DB_PATH || 'data/app.db';

/** 上传文件根目录（相对于项目根的 public 目录） */
export const UPLOAD_BASE_DIR: string = 'public/uploads';

/** 上传文件 URL 前缀 */
export const UPLOAD_URL_PREFIX: string = '/uploads';

/** Cookie 名称 */
export const COOKIE_NAME: string = 'admin_token';

/** 单文件上传大小上限（字节），默认 100MB */
export const MAX_FILE_SIZE: number = 100 * 1024 * 1024;

/**
 * 校验环境变量是否满足最低要求
 * 在生产环境中 JWT_SECRET 必须被设置
 */
export function validateConfig(): void {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      throw new Error(
        'JWT_SECRET 必须在环境变量中设置且长度 ≥32 字符（生产环境）'
      );
    }
    if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin123') {
      console.warn(
        '[安全警告] 生产环境正在使用默认密码 admin123，请通过 ADMIN_PASSWORD 环境变量修改'
      );
    }
  }
}

/** 应用配置对象 */
export const appConfig = {
  adminUsername: ADMIN_USERNAME,
  adminPassword: ADMIN_PASSWORD,
  jwtSecret: JWT_SECRET,
  jwtExpiresIn: JWT_EXPIRES_IN,
  dbPath: DB_PATH,
  uploadBaseDir: UPLOAD_BASE_DIR,
  uploadUrlPrefix: UPLOAD_URL_PREFIX,
  cookieName: COOKIE_NAME,
  maxFileSize: MAX_FILE_SIZE,
} as const;
