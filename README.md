# 味禾小馆官网 · 全栈量产版

> 状态：本地可运行版（阶段 0–5 已交付；阶段 6 生产部署留后续）。  
> 依据：`PRD-味禾小馆官网.md` v1.4 + `UI-UX-设计规范.md` v1.0 + `开发技术文档.md` v1.3 + `数据库设计文档.md` v1.1。

将原静态高保真原型升级为 **React + FastAPI 全栈应用**，包含官网前台与后台管理系统。

---

## 0. 目录结构

```
weihe-website/
├── README.md                    ← 本文件
├── 项目开发实施方案.md
├── PRD-味禾小馆官网.md          ┐
├── UI-UX-设计规范.md            │ 既有文档（事实来源）
├── 开发技术文档.md              │
├── 数据库设计文档.md            │
├── 合规备案清单.md              ┘
├── index.html, privacy.html     ┐
├── about/  products/  news/     │ 静态高保真原型（保留作视觉参考）
├── franchise/  assets/          ┘
│
├── frontend/                    官网前台  React 18 + Vite + Tailwind + React Router
├── admin/                       后台管理  React 18 + Vite + Ant Design v5
├── backend/                     后端服务  FastAPI + SQLAlchemy 2.0 + Alembic
└── docker-compose.yml           可选 PostgreSQL（默认本地用 SQLite，零数据库依赖）
```

---

## 1. 技术栈

| 层 | 选型 |
|---|---|
| 官网前台 | React 18 · Vite 5 · TypeScript · Tailwind CSS 3 · React Router 6 · SWR · axios · zod · react-helmet-async · lucide-react |
| 后台管理 | React 18 · Vite 5 · TypeScript · Ant Design v5 · axios · dayjs |
| 后端 | FastAPI · SQLAlchemy 2.0（同步）· Pydantic v2 · pydantic-settings · Alembic · slowapi · python-jose · passlib[bcrypt] · psycopg / sqlite3 |
| 数据库 | PostgreSQL 14+（生产） / SQLite 3（本地零依赖默认） |
| 鉴权 | JWT（HS256）· bcrypt 密码哈希 |

> 与《开发技术文档》v1.3 的实施期调整见 §6。

---

## 2. 快速开始（本地零依赖 · SQLite 默认）

### 2.1 启动后端（:8000）

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt

# 可选：复制环境变量模板并按需修改
# cp .env.example .env

python seed.py            # 建表 + 灌入种子数据（4 个菜品分类 / 9 项 site_configs / 10+ 菜品 / 6+ 门店 / 7+ 新闻 / 6+ 岗位 / 默认管理员）
uvicorn app.main:app --reload --port 8000
```

- 接口根：`http://localhost:8000`  
- Swagger UI：`http://localhost:8000/docs`  
- 默认管理员：`admin` / `admin123456`（**首次登录后请立即改密码**）  
- 上传文件落地：`backend/app/static/uploads/`，URL 前缀 `/uploads/`

### 2.2 启动官网前台（:5173）

```bash
cd frontend
npm install
npm run dev
```

打开 `http://localhost:5173`。开发模式下 `/api` 与 `/uploads` 已由 Vite 代理到 `:8000`。

### 2.3 启动后台管理（:5174）

```bash
cd admin
npm install
npm run dev
```

打开 `http://localhost:5174`，跳转 `/login` 用 `admin / admin123456` 登录。  
**正式上线前务必修改默认密码**（后台 → 站点配置 或直接改库）。

---

## 3. 切换到 PostgreSQL（贴近生产 / 验证方言特性）

1. 启动本地 PG（任选其一）：
   - `docker compose up -d db`（使用仓库根目录 `docker-compose.yml`）
   - 或使用现有 PostgreSQL，建库 `weihe`，用户 `weihe` 密码 `weihe_pass`
2. 修改 `backend/.env`：
   ```
   DATABASE_URL=postgresql+psycopg://weihe:weihe_pass@localhost:5432/weihe
   SECRET_KEY=<固定强随机串>
   ```
3. 初始化：
   ```bash
   cd backend
   alembic upgrade head    # 或保留默认启动兜底（Base.metadata.create_all）
   python seed.py
   ```
4. 启动同 §2。

`tags` 等 JSONB 字段在 PostgreSQL 下生效为 JSONB，本地 SQLite 下回退为 JSON——其他列、约束、索引与 `数据库设计文档.md` v1.1 完全一致。

---

## 4. 常用脚本

| 目录 | 命令 | 作用 |
|---|---|---|
| `backend/` | `python seed.py` | 建表 + 种子（幂等） |
| `backend/` | `alembic upgrade head` | 应用迁移 |
| `backend/` | `pytest` | 跑后端接口测试（含 TestClient 冒烟） |
| `backend/` | `uvicorn app.main:app --reload --port 8000` | 开发模式 |
| `frontend/` | `npm run dev` | 前台开发模式（:5173） |
| `frontend/` | `npm run build` | 前台生产构建 |
| `admin/` | `npm run dev` | 后台开发模式（:5174） |
| `admin/` | `npm run build` | 后台生产构建 |

---

## 5. 环境变量（`backend/.env`）

| 变量 | 必填 | 默认 | 说明 |
|---|---|---|---|
| `DATABASE_URL` | 否 | `sqlite:///./weihe_dev.db` | SQLAlchemy 连接串；生产用 `postgresql+psycopg://...` |
| `SECRET_KEY` | 生产必填 | 随机生成 | JWT 签名密钥；留空开发可接受，生产必须固定 |
| `ALLOWED_ORIGINS` | 否 | `http://localhost:5173,http://localhost:5174` | CORS 允许源，逗号分隔 |
| `UPLOAD_DIR` | 否 | `app/static/uploads` | 文件上传目录 |
| `DEFAULT_ADMIN_USER` | 否 | `admin` | 启动时若 users 表为空则创建的管理员用户名 |
| `DEFAULT_ADMIN_PASSWORD` | 否 | `admin123456` | 同上，**首次登录后必须改** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 否 | `1440` | 访问令牌有效期（分钟） |

---

## 6. 与既有文档的实施期调整

详见 `开发技术文档.md` §14 "实施阶段调整" 与本目录 `项目开发实施方案.md` 末尾的"实施记录"。要点：

1. **后台管理系统升级为必做**——启用 `users` 表与 `/api/admin/*`（JWT 鉴权、CRUD、线索/留言/配置管理），原技术文档标记为可选的实施项。
2. **后端数据库驱动由 `asyncpg`（异步）改为 `psycopg` / SQLite（同步）**——核心动机是本机/本地零数据库依赖即可运行；字段类型做方言兼容（`JSON().with_variant(JSONB(), "postgresql")`），主键/CHECK/外键 RESTRICT/时间戳在两端通用。
3. **新增 `admin/` 目录**（Ant Design v5），与 `frontend/`（Tailwind 自定义令牌）解耦。Sider 9 项模块：仪表盘/菜品/门店/新闻/岗位/加盟意向/简历投递/在线留言/站点配置。
4. **集成期发现的契约不一致已修正**：① 后台状态流转路径统一为 `/{id}/status`；② 官网前台公共配置归一化适配后端 `key/value` 映射。
5. **邮件/短信通知**：MVP 默认未启用，`app/services/email_service.py` 留 SMTP 钩子；上线前按需接入。
6. **reCAPTCHA / hCaptcha**：MVP 未接入，依赖后端 `slowapi` 限流（5/min/IP）与 `ip_address` 审计作为主防刷。

---

## 7. 上线前阻断项（Launch Blocker）

见 `合规备案清单.md` 与 `PRD` §9：

- ICP 备案号、`police_record` 公安备案号
- 商业特许经营备案号 + 加盟风险提示文案
- 真实隐私政策正文（`site_configs.privacy_policy`）
- 默认管理员密码（`admin/admin123456`）必须修改
- 真实菜品牌照、门店实景图替换占位
- `SECRET_KEY` 设为固定强随机串

这些项已通过 `site_configs` 全部配置化（**不需要改代码**），由后台管理系统 → 站点配置 在线编辑。

---

## 8. 文档与设计资源

- 视觉规范：`UI-UX-设计规范.md`（设计令牌原样落到 `frontend/tailwind.config.js`）
- 接口契约：`开发技术文档.md` §6（实现层已 1:1 落地）
- 数据模型：`数据库设计文档.md` v1.1（10 张表与 SQL DDL 严格一致）
- 静态原型：仓库根目录的 12 个 HTML + `assets/*`（保留作视觉对照蓝本）

---

## 9. 沙箱环境说明

本仓库在受限沙箱中完成代码生成，**未执行 `pip install` / `npm install` / 启动服务**（沙箱无外网）。  
已完成的校验：后端全部 Python 文件通过 `py_compile` 语法编译；集成期发现的两处契约不一致已修正；路由抽取与 schema 字段逐项对照通过。  
端到端运行测试请在联网的本机环境按 §2 / §3 步骤执行。
