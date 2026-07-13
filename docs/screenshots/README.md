# 截图包目录说明

本目录存放项目相关的截图文件，用于代码审查和项目展示。

## 目录结构

```
screenshots/
├── database/           # 数据库相关截图
│   ├── users_table.png       # 用户表结构截图
│   ├── notes_table.png       # 笔记表结构截图
│   ├── tasks_table.png       # 任务表结构截图
│   ├── plans_table.png       # 计划表结构截图
│   └── supabase_dashboard.png # Supabase 控制台截图
├── api/                # API 接口测试截图
│   ├── auth_register.png     # 注册接口测试
│   ├── auth_login.png        # 登录接口测试
│   ├── notes_crud.png        # 笔记CRUD测试
│   ├── tasks_crud.png        # 任务CRUD测试
│   ├── plans_crud.png        # 计划CRUD测试
│   └── health_check.png      # 健康检查接口
├── ai_code_review/     # AI Code Review 截图
│   ├── prompt_analysis.png   # Prompt 分析截图
│   ├── code_review_1.png     # 代码审查截图1
│   ├── code_review_2.png     # 代码审查截图2
│   └── optimization_suggestions.png # 优化建议截图
└── frontend/           # 前端界面截图
    ├── dashboard.png         # 仪表盘页面
    ├── notes_page.png        # 笔记管理页面
    ├── tasks_page.png        # 任务管理页面
    ├── plans_page.png        # 学习计划页面
    ├── stats_page.png        # 学习统计页面
    ├── ai_assistant.png      # AI 智能助手页面
    ├── login_page.png        # 登录页面
    └── responsive_mobile.png # 移动端响应式截图
```

## 截图要求

1. **数据库截图**:
   - 展示 Supabase 表结构
   - 包含字段名、类型、约束
   - 展示表关系图

2. **API 接口截图**:
   - 使用 Postman 或浏览器开发者工具
   - 展示请求头、请求体、响应内容
   - 包含状态码和响应时间

3. **AI Code Review 截图**:
   - 展示 AI 辅助编程的 Prompt 和输出
   - 展示代码审查过程
   - 展示优化建议

4. **前端界面截图**:
   - 展示完整页面布局
   - 包含关键功能按钮和数据展示
   - 展示响应式效果

## 命名规范

- 文件名使用小写字母和下划线
- 使用描述性名称，便于识别
- 按功能模块分类存放

## 截图工具推荐

- **截图**: Snipaste、Windows 截图工具、Screenshot
- **API测试**: Postman、curl、浏览器开发者工具
- **录屏**: LICEcap、ShareX

## 提交要求

请将上述截图收集完整后放入对应目录，并确保所有截图清晰可辨。