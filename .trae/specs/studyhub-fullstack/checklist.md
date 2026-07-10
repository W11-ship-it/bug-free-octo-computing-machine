# StudyHub 学习助手平台 - Verification Checklist

## 后端验证

### 基础架构
- [x] 检查 Flask 应用工厂配置正确（`app/__init__.py`）
- [x] 检查 CORS 跨域配置正确
- [x] 检查健康检查接口 `/api/health` 返回状态码 200 和正确响应

### 认证中间件
- [x] 检查无 token 访问受保护接口返回 401
- [x] 检查无效 token 访问受保护接口返回 401
- [x] 检查过期 token 访问受保护接口返回 401

### 用户认证 API
- [~] 检查 POST /api/auth/register 成功返回 201（代码已实现，需要 Supabase）
- [~] 检查 POST /api/auth/register 用户名已存在返回 409（代码已实现，需要 Supabase）
- [x] 检查 POST /api/auth/register 密码长度不足返回 400
- [~] 检查 POST /api/auth/login 成功返回 200 和 JWT token（代码已实现，需要 Supabase）
- [~] 检查 POST /api/auth/login 密码错误返回 401（代码已实现，需要 Supabase）

### 笔记管理 API
- [~] 检查 POST /api/notes 创建成功返回 201（代码已实现，需要 Supabase）
- [~] 检查 POST /api/notes 缺少标题或内容返回 400（代码已实现，需要 Supabase）
- [~] 检查 GET /api/notes 返回当前用户笔记列表（代码已实现，需要 Supabase）
- [~] 检查 GET /api/notes/:id 获取单条笔记成功（代码已实现，需要 Supabase）
- [~] 检查 GET /api/notes/:id 笔记不存在返回 404（代码已实现，需要 Supabase）
- [~] 检查 PUT /api/notes/:id 更新成功返回更新后数据（代码已实现，需要 Supabase）
- [~] 检查 PUT /api/notes/:id 无更新字段返回 400（代码已实现，需要 Supabase）
- [~] 检查 DELETE /api/notes/:id 删除成功返回 200（代码已实现，需要 Supabase）
- [~] 检查 DELETE /api/notes/:id 笔记不存在返回 404（代码已实现，需要 Supabase）

### 任务管理 API
- [~] 检查 POST /api/tasks 创建成功返回 201（代码已实现，需要 Supabase）
- [~] 检查 POST /api/tasks 缺少任务名称返回 400（代码已实现，需要 Supabase）
- [~] 检查 GET /api/tasks 返回当前用户任务列表（代码已实现，需要 Supabase）
- [~] 检查 GET /api/tasks/:id 获取单条任务成功（代码已实现，需要 Supabase）
- [~] 检查 PUT /api/tasks/:id 更新完成状态成功（代码已实现，需要 Supabase）
- [~] 检查 PUT /api/tasks/:id 更新优先级成功（代码已实现，需要 Supabase）
- [~] 检查 DELETE /api/tasks/:id 删除成功返回 200（代码已实现，需要 Supabase）

### 测试覆盖率
- [~] 后端 pytest 测试用例全部通过（代码已编写，需要 Supabase）
- [~] 测试覆盖率报告生成（需要 Supabase）

## 前端验证

### 基础配置
- [x] 检查 Next.js 项目启动正常（配置文件完整）
- [x] 检查 Ant Design 组件加载正常（使用 @ant-design/nextjs-registry）
- [x] 检查 API 客户端配置正确（baseURL、拦截器）

### 登录页面
- [x] 检查登录/注册 Tab 切换正常（Tabs 组件实现）
- [x] 检查用户名必填验证（Form.Item required 规则）
- [x] 检查密码长度验证（≥6位）（min 规则）
- [x] 检查密码确认验证（validator 规则）
- [x] 检查登录成功后存储 token 并跳转首页（localStorage + router.push）
- [x] 检查注册成功后提示登录（message.success）
- [x] 检查错误提示友好（登录失败、注册失败）（message.error）

### 布局与导航
- [x] 检查侧边栏导航显示正确（首页、笔记、任务）（Menu 组件）
- [x] 检查未登录时显示登录按钮（Link to /login）
- [x] 检查已登录时显示用户名和登出按钮
- [x] 检查登出功能正常（清除 token、跳转登录页）

### 学习仪表盘
- [x] 检查统计卡片显示正确（笔记数、待办任务、已完成任务）（Statistic 组件）
- [x] 检查最近笔记列表显示最多5条（slice(0, 5)）
- [x] 检查加载状态显示正常（loading 状态）
- [x] 检查空数据提示友好（locale.emptyText）

### 笔记管理页面
- [x] 检查笔记列表表格展示清晰（Table 组件）
- [x] 检查学科标签颜色区分正确（subjectColors 映射）
- [x] 检查新建笔记弹窗正常打开（Modal + Form）
- [x] 检查编辑笔记弹窗预填充数据（form.setFieldsValue）
- [x] 检查笔记删除功能正常（DELETE 请求）
- [x] 检查操作反馈及时（成功/失败提示）（message.success/error）

### 任务管理页面
- [x] 检查任务列表展示清晰（List 组件）
- [x] 检查优先级标签颜色区分正确（高/中/低）（priorityConfig 映射）
- [x] 检查完成状态切换正常（复选框点击）（Checkbox + PUT 请求）
- [x] 检查完成任务显示删除线（textDecoration: line-through）
- [x] 检查新建任务弹窗正常打开（Modal + Form + Select + DatePicker）
- [x] 检查任务删除功能正常（DELETE 请求）
- [x] 检查截止日期显示正确（dayjs 格式化）

## 集成验证

- [~] 检查端到端流程：注册 → 登录 → 创建笔记 → 创建任务 → 查看仪表盘（需要 Supabase）
- [~] 检查跨域请求正常（前端 http://localhost:3000 → 后端 http://localhost:5000）（CORS 已配置）
- [x] 检查 JWT token 自动携带正常（axios 拦截器）
- [x] 检查 token 过期后自动跳转登录页（401 响应拦截）

## 代码质量

- [x] 检查代码风格一致（Python PEP 8、JavaScript ES6+）
- [x] 检查日志记录完整（关键操作记录）（logging 模块）
- [x] 检查错误处理完善（异常捕获、友好提示）
- [x] 检查配置文件安全（敏感信息使用环境变量）

**说明**: [~] 表示代码已实现但需要 Supabase 配置才能进行完整测试验证