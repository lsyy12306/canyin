"""应用配置（pydantic-settings）。

所有配置项均可通过环境变量覆盖，便于本地开发与生产部署。
-DATABASE_URL：默认 SQLite（本地零依赖即可运行），生产填 PostgreSQL 连接串。
-SECRET_KEY：JWT 签名密钥，默认每次启动生成随机串，生产务必通过环境变量固定。
"""
from __future__ import annotations

import secrets
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # 数据库连接串。默认 SQLite 文件库，本地零依赖即可跑起来。
    DATABASE_URL: str = "sqlite:///./weihe_dev.db"

    # JWT 签名密钥。默认随机生成，生产务必用固定强随机串覆盖（避免重启后旧 token 失效）。
    SECRET_KEY: str = Field(default_factory=lambda: secrets.token_urlsafe(32))

    # CORS 允许的源（逗号分隔）。默认本地前端开发端口。
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:5174"

    # 文件上传目录（相对 backend 工作目录）。
    UPLOAD_DIR: str = "app/static/uploads"

    # 启动若 users 表为空，则创建的默认管理员。
    DEFAULT_ADMIN_USER: str = "admin"
    DEFAULT_ADMIN_PASSWORD: str = "admin123456"

    # 访问令牌有效期（分钟）。
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    @property
    def allowed_origins_list(self) -> list[str]:
        """解析逗号分隔的 ALLOWED_ORIGINS 为列表。"""
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
