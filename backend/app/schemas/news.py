"""新闻 Schema。

NewsOut 含 slug/type/title/summary/cover_image/published_at/is_published/content 等。
"""
from __future__ import annotations

from datetime import date, datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

NewsType = Literal["corporate", "industry"]


class NewsBase(BaseModel):
    type: NewsType
    title: str = Field(..., min_length=1, max_length=128)
    slug: str = Field(..., min_length=1, max_length=128)
    summary: str = ""
    content: str = ""
    cover_image: str = ""
    published_at: Optional[date] = None
    is_published: bool = False


class NewsCreate(NewsBase):
    """管理后台创建新闻。"""


class NewsUpdate(BaseModel):
    type: Optional[NewsType] = None
    title: Optional[str] = Field(None, min_length=1, max_length=128)
    slug: Optional[str] = Field(None, min_length=1, max_length=128)
    summary: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    published_at: Optional[date] = None
    is_published: Optional[bool] = None


class NewsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    type: NewsType
    title: str
    slug: str
    summary: str = ""
    content: str = ""
    cover_image: str = ""
    published_at: Optional[date] = None
    is_published: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
