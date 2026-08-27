"""简历投递表（job_applications）。"""
from __future__ import annotations

from sqlalchemy import (
    CheckConstraint,
    Column,
    ForeignKey,
    Index,
    Integer,
    String,
    TIMESTAMP,
    Text,
    func,
    text,
)

from app.database import Base


class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    job_id = Column(
        Integer,
        ForeignKey("jobs.id", ondelete="RESTRICT"),
        nullable=False,
        comment="应聘岗位",
    )
    name = Column(String(32), nullable=False, comment="姓名")
    phone = Column(String(16), nullable=False, comment="手机")
    email = Column(String(128), default="", comment="邮箱")
    resume_url = Column(String(512), default="", comment="简历附件 URL")
    message = Column(Text, default="", comment="留言")
    status = Column(
        String(16),
        default="pending",
        comment="pending/reviewed/rejected/hired",
    )
    ip_address = Column(String(64), default="", comment="提交者 IP")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), comment="投递时间")

    __table_args__ = (
        Index("idx_applications_job", "job_id"),
        Index("idx_applications_status", "status"),
        Index("idx_applications_created", text("created_at DESC")),
        CheckConstraint(
            "status IN ('pending', 'reviewed', 'rejected', 'hired')",
            name="ck_applications_status",
        ),
    )
