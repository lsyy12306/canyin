"""在线留言 Schema。

ContactMessageCreate 含 name/contact/msg_type/content（均必填）。
"""
from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

_MsgType = Literal["franchise", "job", "cooperation", "other"]
_MsgStatus = Literal["pending", "replied", "closed"]


class ContactMessageCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=32)
    contact: str = Field(..., min_length=1, max_length=128, description="联系方式（手机/邮箱）")
    msg_type: _MsgType
    content: str = Field(..., min_length=1, description="留言内容")


class ContactMessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    contact: str
    msg_type: _MsgType
    content: str
    status: _MsgStatus = "pending"
    ip_address: str = ""
    created_at: Optional[datetime] = None
