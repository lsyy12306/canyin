# 味禾小馆官网 · 前台（React 18 + Vite + TypeScript）

品牌官网前台，基于《UI-UX 设计规范》与《开发技术文档》实现，对接 FastAPI 后端。

## 技术栈

- React 18 + Vite 5 + TypeScript
- Tailwind CSS 3（设计令牌见 `tailwind.config.js`）
- react-router-dom v6（12 个路由页面）
- axios（统一解包 `{code,message,data}` 包络）
- swr（列表数据缓存）
- react-helmet-async（每页 SEO title/description）
- zod（表单校验）
- lucide-react（SVG 图标）

## 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器（默认 http://localhost:5173）
npm run dev
```

开发服务器通过 Vite 代理把 `/api` 转发到后端 `http://localhost:8000`（见 `vite.config.ts`）。
如需自定义后端地址，修改 `.env` 中的 `VITE_API_BASE`。

## 构建与预览

```bash
npm run build      # 类型检查 + 生产构建
npm run preview    # 本地预览构建产物
```

## 目录结构

```
frontend/
├── index.html
├── vite.config.ts        # /api 代理到 backend:8000
├── tailwind.config.js    # 设计令牌（颜色/圆角/阴影/字体）
├── src/
│   ├── main.tsx          # HelmetProvider + ToastProvider + RouterProvider
│   ├── App.tsx
│   ├── routes.tsx        # createBrowserRouter，Layout 嵌套 12 路由
│   ├── api/              # axios 实例 + 各模块 GET/POST 函数
│   ├── hooks/            # useDishes / useStores / useNews（swr）
│   ├── components/       # Layout/Header/Footer/卡片/表单/Toast 等
│   ├── pages/            # 12 个页面 + 新闻详情
│   ├── types/            # TS 类型（匹配后端 schema）
│   ├── utils/            # 价格/日期/标签等工具
│   └── styles/index.css  # Tailwind 指令 + 设计系统变量与基础类
└── public/               # favicon.svg / robots.txt / sitemap.xml
```

## 接口约定

后端统一响应包络 `{ code, message, data }`，列表 `data` 形如 `{ total, items }`。
所有数据均来自后端 API，无硬编码业务数据；备案号、隐私政策、联系方式等配置来自
`GET /api/public/configs?group=legal|contact`。

## 说明

- 表单提交（加盟意向 / 简历投递 / 在线留言）均做 zod 校验与成功 Toast 反馈。
- 隐私政策正文来自 `site_configs.privacy_policy`（Markdown），在 `PrivacyPage` 经
  轻量 Markdown 渲染（先 HTML 转义消毒再转换），内容来自可信后端配置。
- Toast 为自实现组件（`components/Toast.tsx`），不引入额外第三方库。
