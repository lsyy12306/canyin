"""加盟意向表（franchise_inquiries）。"""
from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    Column,
    Index,
    Integer,
    String,
    TIMESTAMP,
    Text,
    func,
    text,
)

from app.database import Base


class FranchiseInquiry(Base):
    __tablename__ = "franchise_inquiries"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(32), nullable=False, comment="姓名")
    phone = Column(String(16), nullable=False, comment="手机")
    city = Column(String(32), default="", comment="意向城市")
    budget_range = Column(String(32), default="", comment="预算区间")
    message = Column(Text, default="", comment="留言")
    status = Column(
        String(16),
        default="pending",
        comment="pending/contacted/closed",
    )
    ip_address = Column(String(64), default="", comment="提交者 IP")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="提交时间")

    __table_args__ = (
        Index("idx_inquiries_status", "status"),
        Index("idx_inquiries_created", text("created_at DESC")),
        Index("idx_inquiries_phone", "phone"),
        CheckConstraint(
            "status IN ('pending', 'contacted', 'closed')",
            name="ck_inquiries_status",
        ),
    )
