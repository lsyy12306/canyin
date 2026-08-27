"""门店 Schema。"""
from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StoreBase(BaseModel):
    city: str = Field(..., min_length=1, max_length=32)
    name: str = Field(..., min_length=1, max_length=64)
    slug: str = Field(..., min_length=1, max_length=64)
    highlight: str = ""
    image_url: str = ""
    sort_order: int = 0
    is_active: bool = True


class StoreCreate(StoreBase):
    """管理后台创建门店。"""


class StoreUpdate(BaseModel):
    city: Optional[str] = Field(None, min_length=1, max_length=32)
    name: Optional[str] = Field(None, min_length=1, max_length=64)
    slug: Optional[str] = Field(None, min_length=1, max_length=64)
    highlight: Optional[str] = None
    image_url: Optional[str] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class StoreOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    city: str
    name: str
    slug: str
    highlight: str = ""
    image_url: str = ""
    sort_order: int = 0
    is_active: bool = True
    created_at: Optional[datetime] = None
