"""岗位表（jobs）。"""
from __future__ import annotations

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    Text,
    func,
)

from app.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(64), nullable=False, comment="职位名")
    department = Column(String(32), default="", comment="部门")
    location = Column(String(64), default="", comment="工作地点")
    type = Column(
        String(16),
        default="full_time",
        comment="full_time/part_time/intern",
    )
    description = Column(Text, default="", comment="岗位描述")
    requirements = Column(Text, default="", comment="任职要求")
    sort_order = Column(Integer, default=0, comment="排序权重")
    is_active = Column(Boolean, default=True, comment="是否在招")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="创建时间")

    __table_args__ = (
        Index("idx_jobs_active_sort", "is_active", "sort_order"),
        CheckConstraint(
            "type IN ('full_time', 'part_time', 'intern')",
            name="ck_jobs_type",
        ),
    )
