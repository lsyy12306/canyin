# 味禾小馆 · 管理后台（admin）

味禾小馆官网全栈项目的内容管理后台（CMS）。基于 **React 18 + Vite + TypeScript + Ant Design v5 + axios + react-router-dom v6** 构建，与官网前台（Tailwind）解耦。

## 技术栈

| 依赖 | 版本 | 用途 |
|---|---|---|
| react / react-dom | ^18.3 | UI 框架 |
| react-router-dom | ^6.26 | 前端路由 |
| antd | ^5.21 | 组件库（主题色 `#C8482E`） |
| @ant-design/icons | ^5.5 | 图标 |
| axios | ^1.7 | HTTP 客户端 |
| dayjs | ^1.11 | 日期处理（新闻发布日期等） |
| vite / @vitejs/plugin-react / typescript | 最新 | 构建与类型 |

## 目录结构

```
admin/
├── package.json / vite.config.ts / tsconfig*.json / index.html / .env
├── src/
│   ├── main.tsx              # 入口（渲染 App）
│   ├── App.tsx               # ConfigProvider 主题 + App + RouterProvider
│   ├── routes.tsx            # 路由（/login 公开；其余受保护）
│   ├── index.css
│   ├── vite-env.d.ts
│   ├── api/                  # axios 实例 + 各模块 API 函数
│   │   ├── client.ts         # 拦截器：Bearer 注入 / 解包 {code,message,data} / 401 跳登录
│   │   ├── auth.ts dishes.ts stores.ts news.ts jobs.ts
│   │   ├── inquiries.ts applications.ts messages.ts configs.ts upload.ts
│   ├── store/auth.ts         # token + 当前用户（localStorage 持久化）
│   ├── components/           # ProtectedRoute、ImageUpload
│   ├── layouts/AdminLayout.tsx  # Sider 菜单 + Header（用户/退出）+ Outlet
│   ├── pages/                # Login / Dashboard / 菜品·门店·新闻·岗位管理 / 加盟·简历·留言列表 / 站点配置
│   ├── types/index.ts        # 与后端契约对齐的 TS 类型
│   └── utils/helpers.ts       # 列表归一化、价格/日期格式化
```

## 运行

> 注意：本目录交付为源代码，依赖需自行安装（沙箱环境未执行 npm install）。

```bash
cd admin
npm install
npm run dev      # 默认 http://localhost:5174
```

`vite.config.ts` 已配置开发代理：将 `/api` 与 `/uploads` 转发到后端（FastAPI，默认 `http://localhost:8000`）。如需修改后端地址，编辑 `vite.config.ts` 的 `server.proxy.target`。

生产构建：`npm run build`（产物在 `dist/`），`npm run preview` 预览。

## 接口契约

严格对接后端 `/api/admin/*`（详见 `weihe-website/开发技术文档.md` §6.3.8 与管理后台接口）：

- 统一响应包络 `{ code, message, data }`；列表 `data` 兼容数组与 `{ total, items }`。
- 鉴权：`POST /api/admin/login` → `data.access_token`（JWT）；后续请求带 `Authorization: Bearer <token>`；`POST /api/admin/refresh` 可刷新。
- CRUD：`/api/admin/dishes`、`/api/admin/stores`、`/api/admin/news`、`/api/admin/jobs`。
- 查阅：`/api/admin/inquiries`、`/api/admin/applications`、`/api/admin/messages`（支持 `?status=` 过滤，状态可经对应 `PUT /api/admin/{resource}/{id}` 流转）。
- 配置：`GET /api/admin/configs`、`PUT /api/admin/configs/{key}`（修改 `config_value`）。
- 分类下拉：`GET /api/dish-categories`（菜品表单 category_id 选择）。
- 上传：`POST /api/admin/uploads`（multipart，`file` 字段）→ `{ url }`。

## 功能要点

- 登录态保护：未登录访问任意管理页均重定向至 `/login`；退出清空 token 与用户信息。
- 菜品管理：分类 Select（来自 `/api/dish-categories`）、价格 InputNumber（分）、tags 可输入多选、推荐/上架 Switch、图片上传（调 `/api/admin/uploads`）。
- 新闻管理：类型 Radio、发布 Switch、发布日期 DatePicker、正文 TextArea（Markdown/HTML）。
- 岗位管理：类型 Select（全职/兼职/实习）、招聘中 Switch。
- 加盟意向 / 简历投递 / 在线留言：表格展示 + 状态列内联 Select 流转 + 按状态筛选。
- 站点配置：icp / police_record / franchise_license / franchise_risk_tip / contact_phone / contact_email / contact_address / site_title_suffix（Input）、privacy_policy（大 TextArea），保存逐项 `PUT` 对应 key。

## 说明

- 主题色使用品牌色 `#C8482E`（通过 `ConfigProvider` token 注入），中文 locale（`zh_CN`）。
- 语种与文案遵循品牌设计系统；与官网前台视觉解耦，独立维护。
