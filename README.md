# StudyHub - 学习助手平台

## 项目简介

StudyHub 是一个基于 AI 辅助编程开发的全栈 Web 学习工具平台，提供学习笔记管理和学习任务管理功能。项目采用前后端分离架构，前端使用 Next.js + Ant Design，后端使用 Python Flask + Supabase。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | Next.js 14 (React 18) | App Router，支持 SSR/SSG |
| UI 组件库 | Ant Design 5 | 企业级 React 组件库 |
| 后端框架 | Flask 3.0 | 轻量级 Python Web 框架 |
| 数据库/BaaS | Supabase | PostgreSQL + 认证 + 存储 |
| 版本控制 | Git + GitHub | 代码托管与协作 |
| 部署 | Vercel (前端) + 服务器 (后端) | 自动化部署 |

## 项目结构

```
study-hub/
├── frontend/                 # Next.js 前端项目
│   ├── app/
│   │   ├── layout.jsx        # 根布局（侧边栏导航）
│   │   ├── page.jsx          # 仪表盘页面
│   │   ├── login/page.jsx    # 登录/注册页面
│   │   ├── notes/page.jsx    # 学习笔记管理
│   │   └── tasks/page.jsx    # 学习任务管理
│   ├── components/           # 共享组件
│   ├── lib/
│   │   ├── api.js            # Axios API 客户端
│   │   └── supabase.js       # Supabase 客户端
│   ├── package.json
│   └── next.config.js
├── backend/                  # Flask 后端项目
│   ├── app/
│   │   ├── __init__.py       # Flask 应用工厂
│   │   ├── routes/
│   │   │   ├── auth.py       # 认证路由（登录/注册）
│   │   │   ├── notes.py      # 笔记 CRUD 路由
│   │   │   └── tasks.py      # 任务 CRUD 路由
│   │   └── utils.py          # 工具函数（Supabase客户端、JWT认证）
│   ├── tests/
│   │   └── test_api.py       # API 接口测试
│   ├── requirements.txt
│   ├── run.py                # 启动入口
│   └── .env.example
├── docs/
│   ├── api.md                # API 接口文档
│   └── screenshots/          # 截图目录（AI Code Review 截图等）
├── scripts/
│   └── init_db.sql           # 数据库初始化脚本
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
├── .gitignore
├── .env.example
├── PROMPT_LOG.md             # AI Prompt 使用日志
└── README.md                 # 项目说明文档
```

## 快速开始

### 环境要求

- Node.js 18+
- Python 3.10+
- Git

### 1. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/study-hub.git
cd study-hub
```

### 2. 配置 Supabase

1. 在 [supabase.com](https://supabase.com) 创建项目
2. 在 SQL Editor 中执行 `scripts/init_db.sql`
3. 在 Project Settings > API 中获取 URL 和 Key

### 3. 启动后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入 Supabase 配置
pip install -r requirements.txt
python run.py
```

后端默认运行在 http://localhost:5000

### 4. 启动前端

```bash
cd frontend
cp .env.local.example .env.local
# 编辑 .env.local 填入后端地址和 Supabase 配置
npm install
npm run dev
```

前端默认运行在 http://localhost:3000

### 5. 运行测试

```bash
# 后端测试
cd backend
pytest tests/ -v

# 前端测试
cd frontend
npm test
```

## 功能模块

### 用户认证
- 用户注册与登录
- JWT Token 认证
- 自动登录状态管理

### 学习笔记
- 创建、编辑、删除笔记
- 按学科分类管理
- 按时间排序展示

### 任务管理
- 创建学习任务，设置优先级
- 任务完成状态切换
- 截止日期管理

### 仪表盘
- 学习数据概览统计
- 最近笔记快速预览

## 开发日志

详见 [PROMPT_LOG.md](./PROMPT_LOG.md) 了解 AI 辅助编程的使用记录。

## API 文档

详见 [docs/api.md](./docs/api.md) 了解所有 API 接口的详细说明。

## 许可证

MIT License
