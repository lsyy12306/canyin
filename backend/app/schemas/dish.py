"""菜品 Schema。

DishOut 按技术文档 §6.4：含 id/name/slug/category/category_name/price/price_text/
description/image_url/tags/is_recommended，from_attributes=True。
category 与 category_name 为运行时由关联分类计算填充（非模型直接字段）。
"""
from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class DishBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=64)
    slug: str = Field(..., min_length=1, max_length=64)
    category_id: int
    price: int = Field(..., ge=0, description="价格，单位：分")
    description: str = ""
    image_url: str = ""
    tags: List[str] = []
    is_recommended: bool = False
    sort_order: int = 0
    is_active: bool = True


class DishCreate(DishBase):
    """管理后台创建菜品。"""


class DishUpdate(BaseModel):
    """管理后台更新菜品（全字段可选）。"""

    name: Optional[str] = Field(None, min_length=1, max_length=64)
    slug: Optional[str] = Field(None, min_length=1, max_length=64)
    category_id: Optional[int] = None
    price: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None
    is_recommended: Optional[bool] = None
    sort_order: Optional[int] = None
    is_active: Optional[bool] = None


class DishOut(BaseModel):
    """菜品对外响应（含计算字段）。"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    category: str = ""
    category_name: str = ""
    category_color: str = ""
    price: int
    price_text: str = ""
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: List[str] = []
    is_recommended: bool = False
