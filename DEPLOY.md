# 味禾小馆官网 · 生产部署指南

> 本指南对应《项目开发实施方案》阶段 6（生产部署）。
> 配套产物：`docker-compose.yml`、各子项目 `Dockerfile` 与 `nginx.conf`、CI 工作流 `.github/workflows/deploy.yml`。

---

## 0. 前置条件

- 一台已安装 **Docker（≥ 24）** 与 **Docker Compose v2** 的 Linux 服务器（开发机本机若无 Docker 无法实跑构建，本仓库部署配置已在本地做语法校验）。
- 域名（可选，但线上访问更友好）。
- 服务器放行入站端口：`80`（官网）、`8080`（管理后台）；`5432` 与 `8000` 仅调试用，生产建议不对外暴露。

---

## 1. 一键启动（Docker Compose）

```bash
# 1) 进入仓库根目录
cd canyin

# 2) （推荐）创建 compose 变量文件，至少设置 SECRET_KEY
cat > .env <<'EOF'
SECRET_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS=https://your-domain.com,https://admin.your-domain.com
EOF

# 3) 构建并后台启动全部服务
docker compose up -d --build

# 4) 查看状态与日志
docker compose ps
docker compose logs -f backend
```

启动后访问：
- 官网前台：http://服务器IP/  （或 https://your-domain.com）
- 管理后台：http://服务器IP:8080/  （默认账号 admin / admin123456，**首次务必改密码**）

---

## 2. 数据库选型

### 2.1 生产：PostgreSQL（默认，推荐）
`docker-compose.yml` 已包含 `db` 服务，后端 `DATABASE_URL` 默认指向它：
```
postgresql+psycopg://weihe:weihe_pass@db:5432/weihe
```
> ⚠️ 本项目 ORM 是**同步** SQLAlchemy，驱动必须是 `postgresql+psycopg`（同步），
> 不能用 `postgresql+asyncpg`（异步，会与同步引擎冲突）。这也是对《开发技术文档》§12.1 旧写的修正。

首次启动后执行建库与种子数据（在 backend 容器内）：
```bash
docker compose exec backend python seed.py
```

### 2.2 本地零依赖：SQLite
不想装 PostgreSQL，可改用 SQLite：
1. 把 `docker-compose.yml` 中 `backend.environment.DATABASE_URL` 改为
   `sqlite:///./weihe_dev.db`
2. 给 `backend` 增加卷：`- ./weihe_dev.db:/app/weihe_dev.db`
3. 删除（或保留不用）`db` 服务
4. 仍需 `docker compose exec backend python seed.py` 建库

---

## 3. 目录与端口对照

| 服务 | 容器内端口 | 宿主机发布 | 说明 |
|---|---|---|---|
| db | 5432 | 5432（调试） | PostgreSQL 数据卷 `pg_data` |
| backend | 8000 | 仅集群内 | FastAPI + uvicorn，健康检查 `/api/public/health` |
| frontend | 80 | 80 | 官网静态站 + 反代 `/api`、`/uploads` |
| admin | 80 | 8080 | 管理后台静态站 + 反代 `/api`、`/uploads` |

菜品图片持久化：backend 的 `app/static/uploads` 挂为数据卷 `uploads`，容器重建不丢图。

---

## 4. 反向代理说明（Nginx）

每个前端/后台容器内置一份 nginx：
- 托管各自的静态打包产物；
- 把 `/api`、`/uploads` 反向代理到 `backend:8000`，因此**浏览器只访问 80/8080 即可同时拿到页面与接口**，无需跨域直连后端。

如需用**单个域名 + 路径**或**子域名**统一入口（例如 `www.domain.com` → 官网、`admin.domain.com` → 后台），可在服务器再放一层 Nginx/Caddy 网关，把对应路径/域名转发到 `frontend:80` 与 `admin:8080`、把 `/api` 转发到 `backend:8000`。这属于服务器运维配置，不改动应用代码。

---

## 5. CI/CD

`.github/workflows/deploy.yml` 在推送 `main` 时：
1. `test`：后端导入校验 + 前后台 `tsc` 类型检查；
2. `build`：`docker compose build` 构建全部镜像；
3. `deploy`：SSH 部署占位（在仓库 Secrets 配置 `SSH_HOST/SSH_USER/SSH_KEY` 后启用）。

> 推送代码到 GitHub 需要凭证：本机可用已登录 GitHub 的 `git push`，或提供 Fine-grained Token（仅本仓库 `Contents: Read and Write`）。

---

## 6. 备份策略

- 数据库：PostgreSQL 用 `pg_dump` 每日备份；SQLite 直接备份 `weihe_dev.db` 文件。
- 上传文件：定期备份数据卷 `uploads`（菜品图）。
- 配置：环境变量与 `site_configs` 纳入版本控制或密钥管理（如 Vault / GitHub Secrets）。

---

## 7. 上线前检查清单（Launch Blocker）

- [ ] 修改默认管理员密码（admin / admin123456）。
- [ ] `SECRET_KEY` 已设为强随机串（非默认值）。
- [ ] `ALLOWED_ORIGINS` 已改为真实域名。
- [ ] 合规占位已填：《合规备案清单.md》中的 ICP 备案号、隐私政策、经营风险告知。
- [ ] 数据库与上传目录已配置持久化卷并验证备份。
- [ ] 服务器防火墙仅放行 80/8080（及必要 SSH）。
