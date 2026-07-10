# StudyHub 学习助手平台 - Product Requirement Document

## Overview
- **Summary**: StudyHub 是一个基于 AI 辅助编程开发的全栈 Web 学习工具平台，提供学习笔记管理和学习任务管理功能。
- **Purpose**: 帮助学习者高效管理学习笔记和任务，提升学习效率。
- **Target Users**: 学生、自学者、编程爱好者等需要管理学习内容的用户。

## Goals
- 实现完整的用户注册与登录功能
- 提供学习笔记的 CRUD 管理（创建、读取、更新、删除）
- 提供学习任务的 CRUD 管理，支持优先级和截止日期
- 提供学习仪表盘，展示学习数据概览
- 实现前后端分离架构，支持独立部署

## Non-Goals (Out of Scope)
- 不包含 AI 智能辅助功能（如笔记自动生成、任务推荐）
- 不包含社交功能（如笔记分享、好友系统）
- 不包含移动端应用开发
- 不包含多语言国际化支持

## Background & Context
- 项目采用前后端分离架构
- 前端使用 Next.js 14 + Ant Design 5
- 后端使用 Python Flask 3.0 + Supabase（PostgreSQL）
- 认证方式：JWT Bearer Token
- 部署方案：Vercel（前端）+ 服务器（后端）

## Functional Requirements
- **FR-1**: 用户注册 - 支持用户名和密码注册，密码长度至少6位
- **FR-2**: 用户登录 - 支持用户名密码登录，返回 JWT token
- **FR-3**: 笔记列表 - 获取当前用户的所有笔记，按时间倒序排列
- **FR-4**: 创建笔记 - 创建新笔记，包含标题、内容、学科字段
- **FR-5**: 更新笔记 - 修改已有笔记的标题、内容或学科
- **FR-6**: 删除笔记 - 删除指定笔记
- **FR-7**: 任务列表 - 获取当前用户的所有任务，按时间倒序排列
- **FR-8**: 创建任务 - 创建新任务，包含标题、优先级、截止日期
- **FR-9**: 更新任务 - 修改任务属性，支持完成状态切换
- **FR-10**: 删除任务 - 删除指定任务
- **FR-11**: 仪表盘 - 展示学习笔记数量、待办任务数、已完成任务数及最近笔记

## Non-Functional Requirements
- **NFR-1**: 安全性 - 使用 JWT 认证，密码哈希存储，API 接口需认证才能访问
- **NFR-2**: 可用性 - 前端响应式设计，支持常见浏览器
- **NFR-3**: 性能 - API 响应时间 < 200ms，页面加载 < 3s
- **NFR-4**: 可维护性 - 代码结构清晰，遵循模块化设计原则

## Constraints
- **Technical**: Next.js 14 App Router，Flask 3.0，Supabase PostgreSQL
- **Business**: 开源项目，MIT License
- **Dependencies**: Axios（HTTP 客户端），dayjs（日期处理），Ant Design（UI 组件）

## Assumptions
- 用户已在 Supabase 创建项目并配置数据库
- 用户已配置环境变量（Supabase URL、Key、JWT Secret）
- 前端运行在 http://localhost:3000，后端运行在 http://localhost:5000

## Acceptance Criteria

### AC-1: 用户注册功能
- **Given**: 系统正常运行，用户名未被注册
- **When**: 用户提交注册表单（用户名 + 密码 ≥ 6位）
- **Then**: 返回状态码 201，包含注册成功消息和用户ID
- **Verification**: `programmatic`

### AC-2: 用户登录功能
- **Given**: 用户已注册，提供正确的用户名和密码
- **When**: 用户提交登录表单
- **Then**: 返回状态码 200，包含 JWT token 和用户名
- **Verification**: `programmatic`

### AC-3: 笔记 CRUD 功能
- **Given**: 用户已登录并持有有效 token
- **When**: 用户执行创建/读取/更新/删除笔记操作
- **Then**: 操作成功，返回相应状态码和数据
- **Verification**: `programmatic`

### AC-4: 任务 CRUD 功能
- **Given**: 用户已登录并持有有效 token
- **When**: 用户执行创建/读取/更新/删除任务操作
- **Then**: 操作成功，返回相应状态码和数据
- **Verification**: `programmatic`

### AC-5: 仪表盘数据展示
- **Given**: 用户已登录
- **When**: 用户访问首页
- **Then**: 显示笔记统计、待办任务数、已完成任务数和最近5条笔记
- **Verification**: `human-judgment`

### AC-6: 认证保护
- **Given**: 用户未登录或 token 无效
- **When**: 用户访问需要认证的接口
- **Then**: 返回状态码 401，包含错误信息
- **Verification**: `programmatic`

### AC-7: 前端页面布局
- **Given**: 系统正常运行
- **When**: 用户访问各功能页面
- **Then**: 页面布局合理，侧边栏导航可用，响应式显示
- **Verification**: `human-judgment`

## Open Questions
- [ ] 是否需要添加密码找回功能？
- [ ] 是否需要添加笔记搜索功能？
- [ ] 是否需要添加任务分类功能？