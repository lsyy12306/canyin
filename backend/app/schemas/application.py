"""简历投递 Schema。

ApplicationCreate 只含必要字段（name/phone 必填，email/resume_url/message 可选）。
ApplicationOut 供管理后台列表查看（含状态、IP、时间）。
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

_AppStatus = Literal["pending", "reviewed", "rejected", "hired"]

# 中国大陆手机号。
_PHONE_RE = r"^1[3-9]\d{9}$"


class ApplicationCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=32)
    phone: str = Field(..., pattern=_PHONE_RE, description="手机号")
    email: str = Field("", max_length=128)
    resume_url: str = Field("", max_length=512)
    message: str = ""


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_id: int
    name: str
    phone: str
    email: str = ""
    resume_url: str = ""
    message: str = ""
    status: _AppStatus = "pending"
    ip_address: str = ""
    created_at: Optional[datetime] = None
