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
**对应文件**: `scripts/init_db.sql`, `backend/database.sql`

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

---

## Prompt #9 - 学习计划功能开发

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 学习计划管理功能
**对应文件**: `backend/app/routes/plans.py`, `frontend/app/plans/plans-page.jsx`

**Prompt**:
> 开发学习计划功能，支持每日计划和每周计划。后端需要完整的 CRUD API，前端需要计划列表展示、创建/编辑弹窗、完成状态切换、统计展示。

**AI 输出摘要**:
生成了完整的计划管理功能，后端包含 5 个 API 接口（列表、详情、创建、更新、删除），前端包含计划卡片展示、日期选择、统计卡片等功能。

---

## Prompt #10 - 学习统计页面

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 学习统计与数据可视化
**对应文件**: `frontend/app/stats/page.jsx`, `frontend/components/Charts.jsx`

**Prompt**:
> 开发学习统计页面，使用 ECharts 展示多种图表：柱状图展示各学科笔记数量、折线图展示任务完成趋势、饼图展示任务优先级分布。还要支持雷达图、散点图、漏斗图等多种图表类型。

**AI 输出摘要**:
生成了统计页面和图表组件，包含多种图表类型的实现，支持响应式布局和动态数据渲染。

---

## Prompt #11 - AI 智能助手页面

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: AI 对话助手
**对应文件**: `frontend/app/ai/page.jsx`

**Prompt**:
> 开发 AI 智能助手页面，支持用户与 AI 对话。功能包括：消息列表展示、输入框、发送按钮、打字动画效果、Markdown 格式解析、代码高亮、消息复制功能、图片上传支持、键盘快捷键（Ctrl+Enter 发送、Escape 取消、Ctrl+C 清空）。

**AI 输出摘要**:
生成了完整的 AI 助手页面，包含消息渲染、打字效果、代码高亮、图片上传、键盘快捷键等功能。

---

## Prompt #12 - 响应式布局优化

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 移动端适配
**对应文件**: `frontend/app/layout.jsx`, `frontend/app/ai/page.jsx`

**Prompt**:
> 优化项目的响应式布局，支持移动端适配。侧边栏在移动端变成抽屉菜单，主内容区自适应布局，AI助手页面在移动端变成单列布局。

**AI 输出摘要**:
优化了布局组件，添加了移动端抽屉菜单和自适应断点配置。

---

## Prompt #13 - 认证状态管理

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 全局认证状态管理
**对应文件**: `frontend/lib/auth-context.jsx`, `frontend/lib/require-auth.jsx`

**Prompt**:
> 创建全局认证状态管理，使用 React Context。包含 AuthContext 提供登录状态、登录/登出方法，以及 RequireAuth 路由守卫组件，保护需要认证的页面。

**AI 输出摘要**:
生成了完整的认证状态管理方案，包括 AuthContext 和 RequireAuth 组件。

---

## Prompt #14 - SQLite 备选数据库

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 数据库容错机制
**对应文件**: `backend/app/routes/plans.py`, `backend/app/routes/notes.py`, `backend/app/routes/tasks.py`

**Prompt**:
> 当前项目使用 Supabase 数据库，但可能出现表不存在的情况。请为 plans、notes、tasks 三个路由添加 SQLite 备选数据库支持，当 Supabase 表不存在时自动切换到本地 SQLite 数据库。

**AI 输出摘要**:
为三个路由添加了 SQLite 备选方案，当 Supabase 连接失败或表不存在时，自动切换到本地 `plans.db` 数据库。

---

## Prompt #15 - 性能优化

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 前端性能优化
**对应文件**: `frontend/app/notes/notes-page.jsx`, `frontend/app/tasks/tasks-page.jsx`, `frontend/components/Charts.jsx`

**Prompt**:
> 对前端应用进行性能优化：1. 使用 React.memo 包装 NoteCard、TaskCard 等组件；2. 为搜索功能添加防抖处理；3. 优化 ECharts 图表更新逻辑；4. 替换原生 img 标签为 Next.js Image 组件。

**AI 输出摘要**:
完成了多项性能优化，包括组件记忆化、搜索防抖、图表更新优化、图片组件替换。

---

## Prompt #16 - 错误修复与调试

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: Bug 修复
**对应文件**: `frontend/lib/api.js`, `frontend/components/Reminder.jsx`

**Prompt**:
> 修复以下问题：1. fetch API 的 cache 参数错误（cache: false 应改为 cache: 'no-store'）；2. Reminder 组件在未登录状态下也发起 API 请求导致获取提醒失败；3. API 请求路径不一致问题。

**AI 输出摘要**:
修复了多个错误，包括 cache 参数、认证状态检查、API 路径统一等问题。

---

## Prompt #17 - API 调用统一

**时间**: 2026-07-12
**工具**: Claude / Cursor
**对应功能**: 代码重构
**对应文件**: `frontend/app/notes/notes-page.jsx`, `frontend/app/tasks/tasks-page.jsx`, `frontend/app/plans/plans-page.jsx`

**Prompt**:
> 当前三个页面各自定义了独立的 API 对象，存在代码冗余。请将它们统一为使用集中式的 api.js 文件。

**AI 输出摘要**:
移除了三个页面中的独立 API 定义，统一使用 `import api from '../../lib/api'`。

---

## AI 辅助编程总结

### 使用统计
- 总 Prompt 数: 17
- 涉及文件数: 30+
- 生成代码行数: 5000+

### 主要贡献
1. **快速原型开发**: AI 帮助快速构建了完整的项目架构和基础功能
2. **代码质量保障**: AI 提供了最佳实践和规范代码
3. **问题快速定位**: 在调试阶段，AI 帮助快速定位和修复了多个 bug
4. **功能扩展**: AI 帮助快速实现了学习计划、统计图表、AI 助手等新功能
5. **性能优化**: AI 提供了多种性能优化方案和实现

### 经验教训
1. **明确需求**: 提供更详细的需求描述可以获得更好的结果
2. **代码审查**: 对 AI 生成的代码需要进行审查和测试
3. **上下文管理**: 保持对话上下文的连贯性有助于获得更好的结果
4. **逐步迭代**: 复杂功能需要分步骤实现，每一步进行验证