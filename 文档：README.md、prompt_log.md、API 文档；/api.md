# StudyHub API 接口文档

## 基础信息

- **Base URL**: `http://localhost:5000` (开发环境)
- **认证方式**: JWT Bearer Token
- **数据格式**: JSON
- **备选数据库**: SQLite (`plans.db`) - 当 Supabase 连接失败时自动切换

## 认证接口

### 注册

```
POST /api/auth/register
```

**请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

**响应**:
```json
{
  "message": "注册成功",
  "user_id": 1
}
```

### 登录

```
POST /api/auth/login
```

**请求体**:
```json
{
  "username": "testuser",
  "password": "123456"
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "username": "testuser"
}
```

---

## 笔记接口

> 以下接口均需在请求头中携带 `Authorization: Bearer <token>`

### 获取笔记列表

```
GET /api/notes
```

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "React Hooks 学习笔记",
      "content": "useState 用于状态管理...",
      "subject": "编程",
      "created_at": "2026-07-10T10:00:00Z",
      "updated_at": "2026-07-10T10:00:00Z"
    }
  ]
}
```

### 获取单条笔记

```
GET /api/notes/:id
```

**响应**:
```json
{
  "data": {
    "id": 1,
    "title": "React Hooks 学习笔记",
    "content": "useState 用于状态管理...",
    "subject": "编程",
    "created_at": "2026-07-10T10:00:00Z",
    "updated_at": "2026-07-10T10:00:00Z"
  }
}
```

### 创建笔记

```
POST /api/notes
```

**请求体**:
```json
{
  "title": "React Hooks 学习笔记",
  "content": "useState 用于状态管理...",
  "subject": "编程"
}
```

**响应** (201):
```json
{
  "message": "创建成功",
  "data": { "id": 1, "title": "React Hooks 学习笔记", "..." : "..." }
}
```

### 更新笔记

```
PUT /api/notes/:id
```

**请求体** (部分更新):
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容"
}
```

### 删除笔记

```
DELETE /api/notes/:id
```

**响应**:
```json
{
  "message": "删除成功"
}
```

---

## 任务接口

> 以下接口均需在请求头中携带 `Authorization: Bearer <token>`

### 获取任务列表

```
GET /api/tasks
```

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "完成 Next.js 页面开发",
      "priority": "high",
      "due_date": "2026-07-15",
      "completed": false,
      "category": "学习",
      "reminder": "1day",
      "created_at": "2026-07-10T10:00:00Z",
      "updated_at": "2026-07-10T10:00:00Z"
    }
  ]
}
```

### 获取单条任务

```
GET /api/tasks/:id
```

### 创建任务

```
POST /api/tasks
```

**请求体**:
```json
{
  "title": "完成 Next.js 页面开发",
  "priority": "high",
  "due_date": "2026-07-15",
  "category": "学习",
  "reminder": "1day"
}
```

**字段说明**:
- `priority`: `"high"` | `"medium"` | `"low"`，默认 `"medium"`
- `due_date`: 可选，格式 `"YYYY-MM-DD"`
- `category`: 可选，任务分类
- `reminder`: 可选，重复提醒设置 (`"1day"` | `"1week"` | `"1month"`)

### 更新任务

```
PUT /api/tasks/:id
```

**请求体** (部分更新):
```json
{
  "completed": true,
  "priority": "medium"
}
```

### 删除任务

```
DELETE /api/tasks/:id
```

---

## 计划接口

> 以下接口均需在请求头中携带 `Authorization: Bearer <token>`

### 获取计划列表

```
GET /api/plans
```

**响应**:
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "学习数学第三章",
      "type": "daily",
      "subject": "数学",
      "duration": 60,
      "time": "09:00",
      "date": "2026-07-15",
      "days": ["Monday", "Wednesday", "Friday"],
      "reminder": "15",
      "completed": false,
      "created_at": "2026-07-10T10:00:00Z",
      "updated_at": "2026-07-10T10:00:00Z"
    }
  ]
}
```

### 获取单条计划

```
GET /api/plans/:id
```

### 创建计划

```
POST /api/plans
```

**请求体**:
```json
{
  "title": "学习数学第三章",
  "type": "daily",
  "subject": "数学",
  "duration": 60,
  "time": "09:00",
  "date": "2026-07-15",
  "days": [],
  "reminder": "15",
  "completed": false
}
```

**字段说明**:
- `type`: `"daily"` | `"weekly"`，默认 `"daily"`
- `subject`: 学科（数学、英语、编程等）
- `duration`: 时长（分钟），默认 60
- `time`: 可选，格式 `"HH:mm"`
- `date`: 每日计划必填，格式 `"YYYY-MM-DD"`
- `days`: 每周计划必填，数组格式，可选值: `["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]`
- `reminder`: 可选，提前提醒分钟数 (`"5"` | `"15"` | `"30"` | `"60"`)

### 更新计划

```
PUT /api/plans/:id
```

**请求体** (部分更新):
```json
{
  "completed": true,
  "duration": 90
}
```

### 删除计划

```
DELETE /api/plans/:id
```

---

## 健康检查

```
GET /api/health
```

**响应**:
```json
{
  "status": "ok",
  "message": "StudyHub API is running"
}
```

---

## 错误响应格式

所有错误响应统一格式：

```json
{
  "error": "错误描述信息"
}
```

**常见状态码**:
- `400` - 请求参数错误
- `401` - 未认证或令牌过期
- `404` - 资源不存在
- `409` - 资源冲突（如用户名已存在）
- `500` - 服务器内部错误

---

## 数据库备选机制

当 Supabase 数据库连接失败或表不存在时，系统会自动切换到本地 SQLite 数据库 (`plans.db`)。切换过程对用户透明，API 接口保持不变。

### 支持的表

| 表名 | 说明 |
|------|------|
| `notes` | 学习笔记 |
| `tasks` | 学习任务 |
| `plans` | 学习计划 |

### SQLite 表结构

SQLite 表结构与 Supabase PostgreSQL 表结构保持一致，确保数据兼容。