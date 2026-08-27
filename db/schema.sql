-- ===========================================================
-- 味禾小馆 数据库建表脚本 (PostgreSQL 专用)
-- ===========================================================
-- 适用：生产环境使用 PostgreSQL 时，先执行本文件建表/索引/外键，
--       再执行 db/seed.sql 灌入示例数据。
-- 方言：使用 SERIAL / TIMESTAMPTZ / JSONB / CHECK，均为 PostgreSQL 语法，
--       不能直接用于 SQLite。SQLite 用户请勿用本文件，改用 backend/seed.py。
-- 字符集：建议数据库与表使用 UTF-8（CREATE DATABASE weihe_db WITH ENCODING 'UTF8'）。
-- 幂等：本脚本直接 CREATE TABLE，已在库中则先 DROP 或手动跳过；
--       也可在 psql 中用 `CREATE TABLE IF NOT EXISTS`（需手动加，本文件为清晰起见用普通建表）。
-- ===========================================================

-- 如后续迁移到 UUID 主键，可启用以下扩展（当前主键为 SERIAL 自增整数，无需启用）：
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 5.1 菜品分类
CREATE TABLE dish_categories (
    id          SERIAL PRIMARY KEY,
    key         VARCHAR(32) UNIQUE NOT NULL,
    name        VARCHAR(32) NOT NULL,
    color       VARCHAR(16) DEFAULT '#C8482E',   -- 主题色，前台徽标/筛选圆点、后台彩色标签使用
    sort_order  INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_dish_categories_sort ON dish_categories(sort_order);

-- 5.2 菜品
CREATE TABLE dishes (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(64) NOT NULL,
    slug             VARCHAR(64) UNIQUE NOT NULL,
    category_id      INTEGER NOT NULL,
    price            INTEGER NOT NULL CHECK (price >= 0),   -- 单位：分
    description      VARCHAR(255) DEFAULT '',
    image_url        VARCHAR(512) DEFAULT '',
    tags             JSONB DEFAULT '[]',                     -- 标签数组，如 ["招牌","热销"]
    is_recommended   BOOLEAN DEFAULT FALSE,
    sort_order       INTEGER DEFAULT 0,
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_dishes_category
        FOREIGN KEY (category_id) REFERENCES dish_categories(id) ON DELETE RESTRICT
);
CREATE INDEX idx_dishes_category ON dishes(category_id);
CREATE INDEX idx_dishes_active_sort ON dishes(is_active, sort_order);
CREATE INDEX idx_dishes_recommended ON dishes(is_recommended, is_active);

-- 5.3 门店
CREATE TABLE stores (
    id          SERIAL PRIMARY KEY,
    city        VARCHAR(32) NOT NULL,
    name        VARCHAR(64) NOT NULL,
    slug        VARCHAR(64) UNIQUE NOT NULL,
    highlight   VARCHAR(255) DEFAULT '',
    image_url   VARCHAR(512) DEFAULT '',
    sort_order  INTEGER DEFAULT 0,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_stores_city_name UNIQUE (city, name)
);
CREATE INDEX idx_stores_active_sort ON stores(is_active, sort_order);
CREATE INDEX idx_stores_city ON stores(city);

-- 5.4 新闻
CREATE TABLE news (
    id             SERIAL PRIMARY KEY,
    type           VARCHAR(16) NOT NULL CHECK (type IN ('corporate', 'industry')),
    title          VARCHAR(128) NOT NULL,
    slug           VARCHAR(128) UNIQUE NOT NULL,
    summary        VARCHAR(255) DEFAULT '',
    content        TEXT DEFAULT '',
    cover_image    VARCHAR(512) DEFAULT '',
    published_at   DATE,
    is_published   BOOLEAN DEFAULT FALSE,
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_news_type_published ON news(type, is_published, published_at DESC);
CREATE INDEX idx_news_published ON news(is_published, published_at DESC);

-- 5.5 岗位
CREATE TABLE jobs (
    id            SERIAL PRIMARY KEY,
    title         VARCHAR(64) NOT NULL,
    department    VARCHAR(32) DEFAULT '',
    location      VARCHAR(64) DEFAULT '',
    type          VARCHAR(16) DEFAULT 'full_time' CHECK (type IN ('full_time', 'part_time', 'intern')),
    description   TEXT DEFAULT '',
    requirements  TEXT DEFAULT '',
    sort_order    INTEGER DEFAULT 0,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_jobs_active_sort ON jobs(is_active, sort_order);

-- 5.6 简历投递
CREATE TABLE job_applications (
    id          SERIAL PRIMARY KEY,
    job_id      INTEGER NOT NULL,
    name        VARCHAR(32) NOT NULL,
    phone       VARCHAR(16) NOT NULL,
    email       VARCHAR(128) DEFAULT '',
    resume_url  VARCHAR(512) DEFAULT '',
    message     TEXT DEFAULT '',
    status      VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'rejected', 'hired')),
    ip_address  VARCHAR(64) DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_applications_job
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE RESTRICT
);
CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_created ON job_applications(created_at DESC);

-- 5.7 加盟意向
CREATE TABLE franchise_inquiries (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(32) NOT NULL,
    phone         VARCHAR(16) NOT NULL,
    city          VARCHAR(32) DEFAULT '',
    budget_range  VARCHAR(32) DEFAULT '',
    message       TEXT DEFAULT '',
    status        VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
    ip_address    VARCHAR(64) DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_inquiries_status ON franchise_inquiries(status);
CREATE INDEX idx_inquiries_created ON franchise_inquiries(created_at DESC);
CREATE INDEX idx_inquiries_phone ON franchise_inquiries(phone);

-- 5.8 在线留言
CREATE TABLE contact_messages (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(32) NOT NULL,
    contact    VARCHAR(128) NOT NULL,
    msg_type   VARCHAR(16) NOT NULL CHECK (msg_type IN ('franchise', 'job', 'cooperation', 'other')),
    content    TEXT NOT NULL,
    status     VARCHAR(16) DEFAULT 'pending' CHECK (status IN ('pending', 'replied', 'closed')),
    ip_address VARCHAR(64) DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_status ON contact_messages(status);
CREATE INDEX idx_messages_type ON contact_messages(msg_type);
CREATE INDEX idx_messages_created ON contact_messages(created_at DESC);

-- 5.9 站点配置
CREATE TABLE site_configs (
    id             SERIAL PRIMARY KEY,
    config_key     VARCHAR(64) UNIQUE NOT NULL,
    config_value   TEXT DEFAULT '',
    config_group   VARCHAR(32) DEFAULT 'general',
    description    VARCHAR(255) DEFAULT '',
    updated_at     TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_site_configs_group ON site_configs(config_group);

-- 5.10 管理后台用户（必做）
CREATE TABLE users (
    id               SERIAL PRIMARY KEY,
    username         VARCHAR(32) UNIQUE NOT NULL,
    hashed_password  VARCHAR(255) NOT NULL,
    role             VARCHAR(16) DEFAULT 'editor' CHECK (role IN ('admin', 'editor')),
    is_active        BOOLEAN DEFAULT TRUE,
    created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 5.11 提前预约菜品（主表）
CREATE TABLE dish_reservations (
    id            SERIAL PRIMARY KEY,
    store_id      INTEGER NOT NULL,
    name          VARCHAR(32) NOT NULL,
    phone         VARCHAR(16) NOT NULL,
    reserve_date  VARCHAR(10) NOT NULL,           -- YYYY-MM-DD
    reserve_time  VARCHAR(8) DEFAULT '',          -- HH:MM
    guests        INTEGER DEFAULT 1,
    note          TEXT DEFAULT '',
    status        VARCHAR(16) DEFAULT 'pending',
    ip_address    VARCHAR(64) DEFAULT '',
    created_at    TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_reservations_store
        FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT,
    CONSTRAINT ck_dish_reservations_status
        CHECK (status IN ('pending', 'confirmed', 'done', 'cancelled'))
);
CREATE INDEX idx_dish_reservations_status ON dish_reservations(status);
CREATE INDEX idx_dish_reservations_store ON dish_reservations(store_id);
CREATE INDEX idx_dish_reservations_created ON dish_reservations(created_at DESC);

-- 5.12 预约明细（级联删除）
CREATE TABLE dish_reservation_items (
    id             SERIAL PRIMARY KEY,
    reservation_id INTEGER NOT NULL,
    dish_id        INTEGER NOT NULL,
    quantity       INTEGER DEFAULT 1,
    note           VARCHAR(255) DEFAULT '',
    CONSTRAINT fk_reservation_items_reservation
        FOREIGN KEY (reservation_id) REFERENCES dish_reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_items_dish
        FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE RESTRICT
);
CREATE INDEX idx_dish_reservation_items_res ON dish_reservation_items(reservation_id);
CREATE INDEX idx_dish_reservation_items_dish ON dish_reservation_items(dish_id);
