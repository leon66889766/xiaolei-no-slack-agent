# 小雷没摸鱼 Agent — 全栈对话式资源管理平台

> 用自然语言对话检索和管理你的图片、视频、文档资源，自研 TF-IDF 检索引擎，无需外部 LLM。

## ✨ 功能特性

- 🤖 **对话式检索**：用自然语言描述需求，AI 自动匹配相关资源
- 📁 **多格式支持**：图片、视频、文档、外部链接统一管理
- 🔍 **自研搜索引擎**：字符 bigram 分词 + TF-IDF + 余弦相似度 + 标签加权
- 🎨 **精美 UI**：科技蓝紫渐变主题，响应式适配移动端
- 🔐 **后台管理**：JWT 认证，资源上传/链接/分类/标签管理
- 🚀 **一键部署**：Docker 容器化，支持持久卷

## 🛠 技术栈

| 维度 | 技术 |
|------|------|
| 框架 | Next.js 14 (App Router) + TypeScript |
| 数据库 | SQLite (better-sqlite3) |
| UI | Tailwind CSS + shadcn/ui (Radix UI) |
| 检索 | 自研 TF-IDF + 余弦相似度 |
| 认证 | JWT (jose) + httpOnly Cookie |
| 部署 | Docker + Next.js Standalone |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 本地开发

```bash
# 1. 安装依赖
npm install

# 2. 初始化数据库（建表 + 种子数据 + 创建上传目录）
npm run setup

# 3. 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用。

### 环境变量

复制 `.env.example` 为 `.env` 并修改：

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=your-secret-key-at-least-32-chars
```

## 📖 使用指南

### 前台（免登录）

1. 访问首页，在对话框输入需求（如"给我一张科技感的背景图"）
2. AI 返回匹配的资源卡片网格
3. 点击卡片预览，或下载资源

### 后台管理

1. 访问 /admin/login，使用管理员账号登录
2. 默认账号：`admin` / 密码：`admin123`
3. 资源管理：上传文件、添加链接、搜索、删除
4. 分类管理：创建/删除分类
5. 标签管理：创建/删除标签

### 数据打通

后台上传的资源，前台立即可以检索到（搜索索引在写操作后自动失效重建）。

## 🌐 GitHub + Railway 公网部署

> 推荐方案：代码托管在 GitHub，通过 GitHub Actions 自动部署到 Railway（支持 Docker + 持久卷）。

### 1. 推送到 GitHub

```bash
# 在 GitHub 上创建新仓库（不要初始化 README，本地已有）
# 例如：https://github.com/YOUR_USERNAME/xiaolei-no-slack-agent

git remote add origin https://github.com/YOUR_USERNAME/xiaolei-no-slack-agent.git
git branch -M main
git push -u origin main
```

### 2. 部署到 Railway

**方式 A：Railway CLI 自动部署（推荐）**

1. 注册/登录 [Railway](https://railway.app)
2. 生成 Token：`Account Settings -> API Tokens -> New Token`
3. 在 GitHub 仓库设置中添加 Secret：
   - `Settings -> Secrets and variables -> Actions -> New repository secret`
   - Name: `RAILWAY_TOKEN`
   - Value: 你的 Railway Token
4. 推送任意 commit 到 `main` 分支，GitHub Actions 会自动部署

**方式 B：Railway 面板手动部署**

1. 登录 Railway，点击 `New Project`
2. 选择 `Deploy from GitHub repo`
3. 选择你的仓库，Railway 会自动识别 `Dockerfile`
4. 添加环境变量：
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
5. 添加 Volumes：
   - `/app/data`（数据库）
   - `/app/public/uploads`（上传文件）
6. 生成域名，即可公网访问

### 3. 重要说明

- **必须配置持久卷**：SQLite 数据库和上传文件都依赖持久化存储，否则每次重新部署数据会丢失
- **JWT_SECRET**：生产环境必须设置为一个随机的、长度 ≥ 32 的字符串
- **管理员账号密码**：生产环境务必修改默认值

## 🔄 Render 部署（备选）

如果 Railway 不可用，也可以部署到 [Render](https://render.com)：

1. 登录 Render，新建 `Web Service`
2. 选择 `Build and deploy from a Git repository`
3. 选择你的 GitHub 仓库
4. 配置：
   - Runtime: `Docker`
   - Root Directory: `/`
   - Docker Command: 留空（使用 Dockerfile 的 CMD）
5. 添加环境变量 `ADMIN_USERNAME`、`ADMIN_PASSWORD`、`JWT_SECRET`
6. 添加 Disks：
   - `/app/data`（建议 1GB）
   - `/app/public/uploads`（建议 5GB）
7. 创建服务，Render 会自动构建并部署

## 🐳 Docker 本地/服务器部署

### 构建镜像

```bash
docker build -t xiaolei-agent .
```

### 运行容器

```bash
docker run -d \
  --name xiaolei-agent \
  -p 3000:3000 \
  -v xiaolei-data:/app/data \
  -v xiaolei-uploads:/app/public/uploads \
  -e ADMIN_USERNAME=admin \
  -e ADMIN_PASSWORD=your-password \
  -e JWT_SECRET=your-secret-key-at-least-32-chars \
  xiaolei-agent
```

### 持久卷说明

| 挂载路径 | 用途 |
|---------|------|
| `/app/data` | SQLite 数据库文件 |
| `/app/public/uploads` | 上传的文件 |

## 📂 项目结构

```
├── app/                    # Next.js App Router
│   ├── (public)/           # 前台路由组
│   ├── admin/              # 后台路由
│   ├── api/                # API 路由
│   ├── layout.tsx          # 根布局
│   ├── globals.css         # 全局样式
│   └── providers.tsx       # Provider
├── components/             # React 组件
│   ├── ui/                 # shadcn/ui 基础组件
│   ├── shared/             # 共享组件
│   ├── chat/               # 对话组件
│   └── admin/              # 后台组件
├── hooks/                  # 自定义 Hooks
├── lib/                    # 核心库
│   ├── api/                # API 客户端
│   ├── config.ts           # 环境变量
│   ├── db/                 # 数据库层
│   ├── repositories/       # 数据访问层
│   ├── services/           # 业务服务层
│   ├── types/              # 类型定义
│   └── utils/              # 工具函数
├── middleware.ts           # JWT 鉴权中间件
├── scripts/setup.ts        # 初始化脚本
├── Dockerfile              # Docker 构建
└── package.json
```

## 🔧 检索引擎原理

1. **分词**：中文字符 bigram 切分 + 英文按词切分
2. **索引**：TF-IDF 权重计算，构建文档向量
3. **检索**：查询向量化 → 余弦相似度 → 标签精确匹配加权 → 排序
4. **缓存**：内存缓存索引，写操作后 invalidate，下次搜索重建

## 📝 License

MIT
