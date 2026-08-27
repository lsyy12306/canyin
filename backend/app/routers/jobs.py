"""招聘接口。

前缀 /api/jobs：
- GET /                     岗位列表
- GET /{job_id}            岗位详情
- POST /{job_id}/applications  投递简历（限流 5/minute/IP，记录 ip_address）
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.limiter import limiter
from app.models.jobs import Job
from app.models.job_applications import JobApplication
from app.schemas.application import ApplicationCreate, ApplicationOut
from app.schemas.common import ok
from app.schemas.job import JobOut
from app.services.email_service import send_application_notification

router = APIRouter(tags=["招聘"])


@router.get("")
def list_jobs(type: str | None = None, db: Session = Depends(get_db)) -> dict:
    """岗位列表（默认仅 is_active）。"""
    query = db.query(Job).filter(Job.is_active == True)  # noqa: E712
    if type:
        if type not in ("full_time", "part_time", "intern"):
            raise HTTPException(status_code=400, detail="type 仅支持 full_time/part_time/intern")
        query = query.filter(Job.type == type)
    query = query.order_by(Job.sort_order)
    total = query.count()
    items = [JobOut.model_validate(j) for j in query.all()]
    return ok({"total": total, "items": items})


@router.get("/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)) -> dict:
    """岗位详情。"""
    job = db.query(Job).filter(Job.id == job_id, Job.is_active == True).first()  # noqa: E712
    if job is None:
        raise HTTPException(status_code=404, detail="岗位不存在")
    return ok(JobOut.model_validate(job))


@router.post("/{job_id}/applications")
@limiter.limit("5/minute")
def create_application(
    job_id: int,
    request: Request,
    payload: ApplicationCreate,
    db: Session = Depends(get_db),
) -> dict:
    """投递简历，真实落库并限流。"""
    job = db.query(Job).filter(Job.id == job_id).first()
    if job is None or not job.is_active:
        raise HTTPException(status_code=404, detail="岗位不存在或已关闭")

    ip_address = request.client.host if request.client else ""
    application = JobApplication(
        job_id=job_id,
        name=payload.name,
        phone=payload.phone,
        email=payload.email or "",
        resume_url=payload.resume_url or "",
        message=payload.message or "",
        ip_address=ip_address,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    # 邮件通知钩子（占位，不真正发送）。
    send_application_notification(application)

    return ok({"id": application.id}, message="简历投递成功，我们会尽快与您联系。")
