# StudyHub - 学习助手平台

## 📋 项目简介

StudyHub 是一个基于 AI 辅助编程开发的全栈 Web 学习工具平台，提供学习笔记管理、学习任务管理、学习计划管理和 AI 智能助手等功能。项目采用前后端分离架构，前端使用 Next.js + Ant Design，后端使用 Python Flask + Supabase/ SQLite 双数据库支持。

## 🌐 线上部署访问

- **前端地址**: http://localhost:3001
- **后端地址**: http://localhost:5000
- **登录测试账号**: 
  - 用户名: `testuser`
  - 密码: `test123`

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 (React 18) | App Router，支持 SSR/SSG |
| UI 组件库 | Ant Design 5 | 企业级 React 组件库 |
| 图表库 | ECharts | 数据可视化 |
| 后端框架 | Flask 3.0 | 轻量级 Python Web 框架 |
| 数据库 | Supabase / SQLite | PostgreSQL + 本地备选数据库 |
| 认证 | JWT | Token 认证 |
| 版本控制 | Git + GitHub | 代码托管与协作 |
| 部署 | Vercel (前端) + 服务器 (后端) | 自动化部署 |

## 📁 项目结构

```
study-hub/
├── frontend/                 # Next.js 前端项目
│   ├── app/
│   │   ├── layout.jsx        # 根布局（侧边栏导航）
│   │   ├── page.jsx          # 仪表盘页面
│   │   ├── login/page.jsx    # 登录/注册页面
│   │   ├── notes/page.jsx    # 学习笔记管理
│   │   ├── tasks/page.jsx    # 学习任务管理
│   │   ├── plans/page.jsx    # 学习计划管理
│   │   ├── stats/page.jsx    # 学习统计页面
│   │   ├── ai/page.jsx       # AI 智能助手
│   │   └── settings/page.jsx # 个人设置
│   ├── components/           # 共享组件
│   │   ├── Charts.jsx        # 图表组件
│   │   ├── Grid.jsx          # 网格布局组件
│   │   ├── Reminder.jsx      # 提醒组件
│   │   ├── StatCard.jsx      # 统计卡片
│   │   └── StatsCard.jsx     # 统计卡片
│   ├── lib/
│   │   ├── api.js            # API 请求封装
│   │   ├── auth-context.jsx  # 认证状态管理
│   │   ├── require-auth.jsx  # 路由守卫
│   │   └── supabase.js       # Supabase 客户端
│   ├── package.json
│   └── next.config.js
├── backend/                  # Flask 后端项目
│   ├── app/
│   │   ├── __init__.py       # Flask 应用工厂
│   │   ├── routes/
│   │   │   ├── auth.py       # 认证路由（登录/注册）
│   │   │   ├── notes.py      # 笔记 CRUD 路由
│   │   │   ├── tasks.py      # 任务 CRUD 路由
│   │   │   └── plans.py      # 计划 CRUD 路由
│   │   ├── utils.py          # 工具函数
│   │   └── plans.db          # SQLite 备选数据库
│   ├── tests/                # 测试文件
│   ├── database.sql          # 数据库建表脚本
│   ├── init_db.py            # 数据库初始化脚本
│   ├── requirements.txt
│   └── run.py                # 启动入口
├── docs/
│   ├── api.md                # API 接口文档
│   └── screenshots/          # 截图目录（数据库、接口、AI Code Review）
├── scripts/
│   └── init_db.sql           # 数据库初始化脚本
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
├── .gitignore
├── PROMPT_LOG.md             # AI Prompt 使用日志
└── README.md                 # 项目说明文档
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- Git

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/study-hub.git
cd study-hub
```

### 2. 配置环境变量

#### 后端配置

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，填入 Supabase 配置：

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
```

#### 前端配置

```bash
cd ../frontend
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 3. 启动后端

```bash
cd backend
pip install -r requirements.txt
python run.py
```

后端默认运行在 http://localhost:5000

### 4. 启动前端

```bash
cd frontend
npm install
npm run dev -p 3001
```

前端默认运行在 http://localhost:3001

### 5. 运行测试

```bash
# 后端测试
cd backend
pytest tests/ -v

# 前端构建检查
cd frontend
npm run build
```

## ✨ 功能模块

### 用户认证
- 用户注册与登录
- JWT Token 认证
- 自动登录状态管理
- 路由守卫保护

### 学习笔记
- 创建、编辑、删除笔记
- 按学科分类管理
- 搜索过滤功能
- 表格/卡片视图切换
- 批量操作（导出、删除）

### 任务管理
- 创建学习任务，设置优先级
- 任务完成状态切换
- 截止日期管理
- 任务分类和提醒
- 批量完成和删除

### 学习计划
- 每日计划管理
- 每周计划管理
- 计划完成状态切换
- 计划统计展示

### AI 智能助手
- 智能问答功能
- Markdown 格式回复
- 代码高亮显示
- 消息复制功能
- 图片上传支持

### 学习统计
- 学习数据可视化
- 多图表类型展示（柱状图、折线图、饼图等）
- 雷达图、散点图、漏斗图

### 个人设置
- 用户信息展示
- 密码修改功能

## 📊 数据库表结构

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| username | VARCHAR(50) | 用户名（唯一） |
| password_hash | VARCHAR(255) | 密码哈希 |
| created_at | TIMESTAMPTZ | 创建时间 |

### notes 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| user_id | BIGINT | 用户ID（外键） |
| title | VARCHAR(200) | 标题 |
| content | TEXT | 内容 |
| subject | VARCHAR(50) | 学科 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### tasks 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| user_id | BIGINT | 用户ID（外键） |
| title | VARCHAR(200) | 标题 |
| priority | VARCHAR(10) | 优先级 |
| due_date | DATE | 截止日期 |
| completed | BOOLEAN | 完成状态 |
| category | VARCHAR(100) | 分类 |
| reminder | VARCHAR(20) | 提醒设置 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### plans 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | BIGSERIAL | 主键 |
| user_id | BIGINT | 用户ID（外键） |
| title | VARCHAR(255) | 标题 |
| type | VARCHAR(50) | 类型（daily/weekly） |
| subject | VARCHAR(100) | 学科 |
| duration | INTEGER | 时长（分钟） |
| time | TEXT | 时间 |
| date | TEXT | 日期 |
| days | TEXT | 重复日期（JSON数组） |
| reminder | VARCHAR(20) | 提醒设置 |
| completed | BOOLEAN | 完成状态 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

## 📝 开发日志

详见 [PROMPT_LOG.md](./PROMPT_LOG.md) 了解 AI 辅助编程的使用记录。

## 📖 API 文档

详见 [docs/api.md](./docs/api.md) 了解所有 API 接口的详细说明。

## 📸 截图目录

截图文件存放在 [docs/screenshots/](./docs/screenshots/) 目录，包含：
- 数据库表结构截图
- API 接口测试截图
- AI Code Review 截图

## 📄 许可证

MIT License