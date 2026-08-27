"""鉴权 Schema。

LoginRequest：登录请求体。
TokenResponse：登录/刷新返回的令牌。
StatusUpdate：状态流转（加盟意向 / 简历 / 留言通用）。
"""
from __future__ import annotations

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=32)
    password: str = Field(..., min_length=1, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 0


class StatusUpdate(BaseModel):
    status: str = Field(..., min_length=1, description="目标状态值")
