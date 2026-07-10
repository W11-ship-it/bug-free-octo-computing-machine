# AI Prompt 使用日志

> 本文件记录开发过程中使用 AI 辅助编程的关键 Prompt 和输出结果，
> 每条记录标注对应的功能模块和文件，便于代码审查时对照。

---

## Prompt #1 - 项目初始化

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 项目架构搭建
**对应文件**: `frontend/package.json`, `backend/app/__init__.py`

**Prompt**:
> 帮我创建一个全栈Web项目的目录结构，前端用 Next.js + Ant Design，后端用 Flask + Supabase。项目名叫 StudyHub，包含学习笔记管理和任务管理两个功能模块。

**AI 输出摘要**:
生成了完整的项目目录结构，包括 frontend/ 和 backend/ 目录，前端使用 App Router，后端使用 Blueprint 路由组织方式。

---

## Prompt #2 - 数据库设计

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 数据库表结构设计
**对应文件**: `scripts/init_db.sql`

**Prompt**:
> 为学习工具平台设计数据库表结构，需要用户表、笔记表、任务表。使用 PostgreSQL，包含适当的索引和自动更新时间的触发器。

**AI 输出摘要**:
生成了三张表的 DDL 语句，包含外键约束、索引、自动更新 updated_at 的触发器函数，以及 RLS 安全策略的启用语句。

---

## Prompt #3 - 后端 API 开发

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 用户认证 API
**对应文件**: `backend/app/routes/auth.py`

**Prompt**:
> 用 Flask 写用户注册和登录的 API，使用 Supabase 做数据库，JWT 做认证。注册时要检查用户名是否重复，登录成功返回 JWT token。

**AI 输出摘要**:
生成了 `/api/auth/register` 和 `/api/auth/login` 两个接口，包含输入校验、密码哈希、JWT 生成等完整逻辑。

---

## Prompt #4 - 笔记 CRUD

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 学习笔记管理 API
**对应文件**: `backend/app/routes/notes.py`

**Prompt**:
> 为笔记功能写完整的 CRUD API，包括列表、详情、创建、更新、删除。每个接口需要验证用户身份，只能操作自己的数据。

**AI 输出摘要**:
生成了 5 个 RESTful API 接口，每个接口都有 `@token_required` 装饰器验证 JWT，并通过 `user_id` 过滤确保数据隔离。

---

## Prompt #5 - 任务 CRUD

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 学习任务管理 API
**对应文件**: `backend/app/routes/tasks.py`

**Prompt**:
> 写任务管理的 CRUD API，任务有优先级(high/medium/low)、截止日期、完成状态。更新接口支持部分更新。

**AI 输出摘要**:
生成了完整的任务 CRUD 接口，支持优先级验证和部分字段更新，包含完成状态切换功能。

---

## Prompt #6 - 前端页面开发

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 前端所有页面
**对应文件**: `frontend/app/page.jsx`, `frontend/app/notes/page.jsx`, `frontend/app/tasks/page.jsx`, `frontend/app/login/page.jsx`

**Prompt**:
> 用 Next.js App Router + Ant Design 开发学习笔记和任务管理的前端页面。包括仪表盘、笔记列表（增删改）、任务列表（创建、完成切换、删除）、登录注册页面。

**AI 输出摘要**:
生成了 4 个页面组件：仪表盘（统计卡片+最近笔记）、笔记管理（表格+弹窗表单）、任务管理（列表+复选框切换）、登录注册（Tab切换表单）。

---

## Prompt #7 - API 封装与拦截器

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 前端 API 请求层
**对应文件**: `frontend/lib/api.js`

**Prompt**:
> 用 axios 封装 API 请求，自动在请求头加 JWT token，响应拦截器处理 401 自动跳转登录页。

**AI 输出摘要**:
创建了 axios 实例，包含请求拦截器（附加 Authorization header）和响应拦截器（401 自动跳转登录页）。

---

## Prompt #8 - CI/CD 配置

**时间**: 2026-07-10
**工具**: Claude / Cursor
**对应功能**: 自动化部署
**对应文件**: `.github/workflows/ci.yml`

**Prompt**:
> 写一个 GitHub Actions 的 CI/CD workflow，对前端做 lint 和 build 检查，对后端做 pytest 测试，push 到 main 分支时自动部署前端到 Vercel。

**AI 输出摘要**:
生成了包含 test、lint、deploy 三个 job 的 workflow，使用 Node.js 和 Python 环境，Vercel 部署使用官方 action。
