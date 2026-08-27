# 数据库脚本（db/）

本项目提供两套建库 + 灌数据方式，按数据库类型选用其一即可。

## 文件清单

| 文件 | 作用 | 适用 |
|---|---|---|
| `schema.sql` | 建表 DDL（12 张表 + 索引 + 外键） | **PostgreSQL 专用**（含 `SERIAL`/`TIMESTAMPTZ`/`JSONB`/`CHECK`） |
| `seed.sql` | 示例数据（8 分类 / 9 配置 / 6 门店 / 7 新闻 / 18 菜品 / 6 岗位 / 1 管理员） | **PostgreSQL 专用**，需先执行 `schema.sql` |
| `../backend/seed.py` | 运行时建库 + 灌数据的 Python 脚本 | **SQLite / PostgreSQL 通用**（默认 SQLite） |

## 方式一：PostgreSQL（生产推荐）

```bash
# 1) 建库（字符集 UTF-8）
createdb weihe_db --encoding=UTF8

# 2) 建表
psql "$DATABASE_URL" -f db/schema.sql

# 3) 灌入示例数据
psql "$DATABASE_URL" -f db/seed.sql
```

> `DATABASE_URL` 形如 `postgresql+psycopg://user:pass@host:5432/weihe_db`（注意用**同步**驱动 `psycopg`，本项目 ORM 是同步 SQLAlchemy，不要用 `asyncpg`）。
> 示例数据幂等：`seed.sql` 带唯一键的表用 `ON CONFLICT DO NOTHING`，`jobs`/`users` 用 `WHERE NOT EXISTS`，可重复执行。

## 方式二：SQLite（本地零依赖开发）

```bash
cd backend
python seed.py        # 自动 create_all 建表 + 灌入示例数据，已存在记录自动跳过
```

> SQLite 不支持 `SERIAL`/`JSONB` 等 PostgreSQL 语法，因此**不要用** `db/schema.sql`。
> `seed.py` 由 SQLAlchemy ORM 按 SQLite 类型自动建表，数据内容与 `seed.sql` 完全一致。

## 数据一览（seed 覆盖）

- `dish_categories`：8 类（招牌热菜/精致靓汤/家常小炒/主食点心/凉菜前菜/海鲜水产/特色小吃/时令养生），各带主题色 `color`
- `dishes`：18 道，含示例图 `/uploads/dishes/*.png`、标签数组、是否推荐
- `stores`：6 门店（广州/深圳/武汉/成都/西安/长沙）
- `news`：7 条（4 企业 + 3 行业）
- `jobs`：6 个招聘岗位
- `site_configs`：9 条（合规占位 + 联系方式 + SEO）
- `users`：1 管理员（默认 `admin` / `admin123456`，**首次登录务必修改密码**）

## 注意

- `db/seed.sql` 由 `backend/_gen_seed_sql.py` 依据 `seed.py` 的真实数据生成（密码用 bcrypt 哈希）。若调整 `seed.py`，请同步重新生成或手工修改 `seed.sql`，保持两份种子一致。
- 上线前必填 `site_configs` 中 `legal` 组的合规占位（ICP 备案号、公安备案号、特许经营备案号）与隐私政策正文。
