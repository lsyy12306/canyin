"""菜品分类表（dish_categories）。

分类键：hot 招牌热菜 / soup 精致靓汤 / stir 家常小炒 / staple 主食点心 /
cold 凉菜前菜 / seafood 海鲜水产 / snack 特色小吃 / wellness 时令养生。
color 为前端分类徽标主题色（十六进制）。
"""
from __future__ import annotations

from sqlalchemy import Column, Index, Integer, String, TIMESTAMP, func
from sqlalchemy.orm import relationship

from app.database import Base


class DishCategory(Base):
    __tablename__ = "dish_categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(32), unique=True, nullable=False, comment="分类键")
    name = Column(String(32), nullable=False, comment="显示名")
    color = Column(String(16), default="#C8452E", comment="分类主题色（十六进制），用于前端徽标")
    sort_order = Column(Integer, default=0, comment="排序权重，越小越靠前")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="创建时间")

    dishes = relationship("Dish", back_populates="category", passive_deletes=True)

    __table_args__ = (
        Index("idx_dish_categories_sort", "sort_order"),
    )
