"""管理后台接口（必做）。

前缀 /api/admin：
- POST /login                 JWT 登录
- POST /refresh               刷新令牌（需有效 token）
- CRUD /dishes|stores|news|jobs（写操作需 admin 角色）
- GET  /inquiries|applications|messages   表单线索列表（需登录）
- PUT  /inquiries|applications|messages/{id}/status  状态流转（需 admin）
- GET /configs | PUT /configs/{key}         站点配置管理（写需 admin）
- POST /uploads               文件上传（需 admin），返回 /uploads/xxx
"""
from __future__ import annotations

import os
import shutil
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.contact_messages import ContactMessage
from app.models.dish_categories import DishCategory
from app.models.dishes import Dish
from app.models.dish_reservation_items import DishReservationItem
from app.models.dish_reservations import DishReservation
from app.models.franchise_inquiries import FranchiseInquiry
from app.models.jobs import Job
from app.models.job_applications import JobApplication
from app.models.news import News
from app.models.site_configs import SiteConfig
from app.models.stores import Store
from app.models.users import User
from app.routers.dishes import _to_dish_out
from app.schemas.application import ApplicationOut
from app.schemas.auth import LoginRequest, StatusUpdate, TokenResponse
from app.schemas.common import ok
from app.schemas.config import ConfigOut, ConfigValueUpdate
from app.schemas.contact import ContactMessageOut
from app.schemas.dish import DishCreate, DishOut, DishUpdate
from app.schemas.inquiry import InquiryOut
from app.schemas.job import JobCreate, JobOut, JobUpdate
from app.schemas.news import NewsCreate, NewsOut, NewsUpdate
from app.schemas.reservation import DishReservationOut, ReservationItemOut
from app.schemas.store import StoreCreate, StoreOut, StoreUpdate
from app.security import (
    create_access_token,
    get_current_user,
    hash_password,
    require_admin,
    verify_password,
)

router = APIRouter(tags=["管理后台"])

# 允许上传的文件扩展名。
_ALLOWED_EXT = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".pdf"}


# --------------------------------------------------------------------------- #
# 鉴权
# --------------------------------------------------------------------------- #
@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    """管理员登录，返回 JWT。"""
    user = db.query(User).filter(User.username == payload.username).first()
    if user is None or not user.is_active or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    token = create_access_token(str(user.id), user.role)
    return ok(
        TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ).model_dump()
    )


@router.post("/refresh")
def refresh(user: User = Depends(get_current_user)) -> dict:
    """用当前有效 token 换取新 token（滑动续期）。"""
    token = create_access_token(str(user.id), user.role)
    return ok(
        TokenResponse(
            access_token=token,
            token_type="bearer",
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        ).model_dump()
    )


# --------------------------------------------------------------------------- #
# 菜品 CRUD
# --------------------------------------------------------------------------- #
@router.get("/dishes")
def admin_list_dishes(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    rows = db.query(Dish).order_by(Dish.sort_order).all()
    return ok([_to_dish_out(d) for d in rows])


@router.post("/dishes")
def admin_create_dish(
    payload: DishCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    cat = db.query(DishCategory).filter(DishCategory.id == payload.category_id).first()
    if cat is None:
        raise HTTPException(status_code=400, detail="分类不存在")
    dish = Dish(**payload.model_dump())
    db.add(dish)
    db.commit()
    db.refresh(dish)
    return ok(_to_dish_out(dish), message="创建成功")


@router.put("/dishes/{dish_id}")
def admin_update_dish(
    dish_id: int, payload: DishUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    dish = db.get(Dish, dish_id)
    if dish is None:
        raise HTTPException(status_code=404, detail="菜品不存在")
    if payload.category_id is not None:
        cat = db.query(DishCategory).filter(DishCategory.id == payload.category_id).first()
        if cat is None:
            raise HTTPException(status_code=400, detail="分类不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(dish, key, value)
    db.commit()
    db.refresh(dish)
    return ok(_to_dish_out(dish), message="更新成功")


@router.delete("/dishes/{dish_id}")
def admin_delete_dish(
    dish_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    dish = db.get(Dish, dish_id)
    if dish is None:
        raise HTTPException(status_code=404, detail="菜品不存在")
    db.delete(dish)
    db.commit()
    return ok(None, message="删除成功")


# --------------------------------------------------------------------------- #
# 门店 CRUD
# --------------------------------------------------------------------------- #
@router.get("/stores")
def admin_list_stores(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    rows = db.query(Store).order_by(Store.sort_order).all()
    return ok([StoreOut.model_validate(s) for s in rows])


@router.post("/stores")
def admin_create_store(
    payload: StoreCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    store = Store(**payload.model_dump())
    db.add(store)
    db.commit()
    db.refresh(store)
    return ok(StoreOut.model_validate(store), message="创建成功")


@router.put("/stores/{store_id}")
def admin_update_store(
    store_id: int, payload: StoreUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    store = db.get(Store, store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="门店不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(store, key, value)
    db.commit()
    db.refresh(store)
    return ok(StoreOut.model_validate(store), message="更新成功")


@router.delete("/stores/{store_id}")
def admin_delete_store(
    store_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    store = db.get(Store, store_id)
    if store is None:
        raise HTTPException(status_code=404, detail="门店不存在")
    db.delete(store)
    db.commit()
    return ok(None, message="删除成功")


# --------------------------------------------------------------------------- #
# 新闻 CRUD
# --------------------------------------------------------------------------- #
@router.get("/news")
def admin_list_news(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    rows = db.query(News).order_by(News.published_at.desc()).all()
    return ok([NewsOut.model_validate(n) for n in rows])


@router.post("/news")
def admin_create_news(
    payload: NewsCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    news = News(**payload.model_dump())
    db.add(news)
    db.commit()
    db.refresh(news)
    return ok(NewsOut.model_validate(news), message="创建成功")


@router.put("/news/{news_id}")
def admin_update_news(
    news_id: int, payload: NewsUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    news = db.get(News, news_id)
    if news is None:
        raise HTTPException(status_code=404, detail="新闻不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(news, key, value)
    db.commit()
    db.refresh(news)
    return ok(NewsOut.model_validate(news), message="更新成功")


@router.delete("/news/{news_id}")
def admin_delete_news(
    news_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    news = db.get(News, news_id)
    if news is None:
        raise HTTPException(status_code=404, detail="新闻不存在")
    db.delete(news)
    db.commit()
    return ok(None, message="删除成功")


# --------------------------------------------------------------------------- #
# 岗位 CRUD
# --------------------------------------------------------------------------- #
@router.get("/jobs")
def admin_list_jobs(db: Session = Depends(get_db), _: User = Depends(get_current_user)) -> dict:
    rows = db.query(Job).order_by(Job.sort_order).all()
    return ok([JobOut.model_validate(j) for j in rows])


@router.post("/jobs")
def admin_create_job(
    payload: JobCreate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    job = Job(**payload.model_dump())
    db.add(job)
    db.commit()
    db.refresh(job)
    return ok(JobOut.model_validate(job), message="创建成功")


@router.put("/jobs/{job_id}")
def admin_update_job(
    job_id: int, payload: JobUpdate, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="岗位不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return ok(JobOut.model_validate(job), message="更新成功")


@router.delete("/jobs/{job_id}")
def admin_delete_job(
    job_id: int, db: Session = Depends(get_db), _: User = Depends(require_admin)
) -> dict:
    job = db.get(Job, job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="岗位不存在")
    db.delete(job)
    db.commit()
    return ok(None, message="删除成功")


# --------------------------------------------------------------------------- #
# 表单线索列表 + 状态流转
# --------------------------------------------------------------------------- #
_INQUIRY_STATUSES = {"pending", "contacted", "closed"}
_APPLICATION_STATUSES = {"pending", "reviewed", "rejected", "hired"}
_MESSAGE_STATUSES = {"pending", "replied", "closed"}
_RESERVATION_STATUSES = {"pending", "confirmed", "done", "cancelled"}


def _to_reservation_out(res: DishReservation) -> DishReservationOut:
    """将预约 ORM 转换为对外响应（填充门店名与明细菜名）。"""
    store = res.store
    dish_ids = [it.dish_id for it in res.items]
    dish_map: dict[int, Dish] = {}
    if dish_ids:
        sess = Session.object_session(res)
        if sess is not None:
            dish_map = {d.id: d for d in sess.query(Dish).filter(Dish.id.in_(dish_ids)).all()}
    items_out = [
        ReservationItemOut(
            id=it.id,
            dish_id=it.dish_id,
            quantity=it.quantity,
            note=it.note or "",
            dish_name=dish_map[it.dish_id].name if it.dish_id in dish_map else "",
        )
        for it in res.items
    ]
    return DishReservationOut(
        id=res.id,
        store_id=res.store_id,
        store_name=store.name if store else "",
        name=res.name,
        phone=res.phone,
        reserve_date=res.reserve_date,
        reserve_time=res.reserve_time or "",
        guests=res.guests,
        note=res.note or "",
        status=res.status,
        ip_address=res.ip_address or "",
        created_at=res.created_at.isoformat() if res.created_at else None,
        items=items_out,
    )


@router.get("/inquiries")
def admin_list_inquiries(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    rows = db.query(FranchiseInquiry).order_by(FranchiseInquiry.created_at.desc()).all()
    return ok([InquiryOut.model_validate(r) for r in rows])


@router.put("/inquiries/{inquiry_id}/status")
def admin_update_inquiry_status(
    inquiry_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    row = db.get(FranchiseInquiry, inquiry_id)
    if row is None:
        raise HTTPException(status_code=404, detail="加盟意向不存在")
    if payload.status not in _INQUIRY_STATUSES:
        raise HTTPException(status_code=400, detail="非法状态值")
    row.status = payload.status
    db.commit()
    return ok(InquiryOut.model_validate(row), message="状态已更新")


@router.get("/applications")
def admin_list_applications(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    rows = db.query(JobApplication).order_by(JobApplication.created_at.desc()).all()
    return ok([ApplicationOut.model_validate(r) for r in rows])


@router.put("/applications/{application_id}/status")
def admin_update_application_status(
    application_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    row = db.get(JobApplication, application_id)
    if row is None:
        raise HTTPException(status_code=404, detail="简历投递不存在")
    if payload.status not in _APPLICATION_STATUSES:
        raise HTTPException(status_code=400, detail="非法状态值")
    row.status = payload.status
    db.commit()
    return ok(ApplicationOut.model_validate(row), message="状态已更新")


@router.get("/messages")
def admin_list_messages(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    rows = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    return ok([ContactMessageOut.model_validate(r) for r in rows])


@router.put("/messages/{message_id}/status")
def admin_update_message_status(
    message_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    row = db.get(ContactMessage, message_id)
    if row is None:
        raise HTTPException(status_code=404, detail="留言不存在")
    if payload.status not in _MESSAGE_STATUSES:
        raise HTTPException(status_code=400, detail="非法状态值")
    row.status = payload.status
    db.commit()
    return ok(ContactMessageOut.model_validate(row), message="状态已更新")


# --------------------------------------------------------------------------- #
# 提前预约菜品管理
# --------------------------------------------------------------------------- #
@router.get("/dish-reservations")
def admin_list_reservations(
    status: str | None = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """预约列表（可按状态过滤）。"""
    query = db.query(DishReservation)
    if status:
        query = query.filter(DishReservation.status == status)
    rows = query.order_by(DishReservation.created_at.desc()).all()
    return ok([_to_reservation_out(r) for r in rows])


@router.get("/dish-reservations/{reservation_id}")
def admin_get_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
) -> dict:
    """预约详情（含门店名与菜品明细）。"""
    res = db.get(DishReservation, reservation_id)
    if res is None:
        raise HTTPException(status_code=404, detail="预约不存在")
    return ok(_to_reservation_out(res))


@router.put("/dish-reservations/{reservation_id}/status")
def admin_update_reservation_status(
    reservation_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    """预约状态流转（pending/confirmed/done/cancelled）。"""
    res = db.get(DishReservation, reservation_id)
    if res is None:
        raise HTTPException(status_code=404, detail="预约不存在")
    if payload.status not in _RESERVATION_STATUSES:
        raise HTTPException(status_code=400, detail="非法状态值")
    res.status = payload.status
    db.commit()
    return ok(_to_reservation_out(res), message="状态已更新")


@router.delete("/dish-reservations/{reservation_id}")
def admin_delete_reservation(
    reservation_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    """删除预约（级联删除明细）。"""
    res = db.get(DishReservation, reservation_id)
    if res is None:
        raise HTTPException(status_code=404, detail="预约不存在")
    db.delete(res)
    db.commit()
    return ok({"id": reservation_id}, message="预约已删除")


# --------------------------------------------------------------------------- #
# 站点配置
# --------------------------------------------------------------------------- #
@router.get("/configs")
def admin_list_configs(
    db: Session = Depends(get_db), _: User = Depends(get_current_user)
) -> dict:
    rows = db.query(SiteConfig).order_by(SiteConfig.config_key).all()
    return ok([ConfigOut.model_validate(c) for c in rows])


@router.put("/configs/{key}")
def admin_update_config(
    key: str,
    payload: ConfigValueUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
) -> dict:
    config = db.query(SiteConfig).filter(SiteConfig.config_key == key).first()
    if config is None:
        raise HTTPException(status_code=404, detail="配置项不存在")
    config.config_value = payload.config_value
    config.updated_at = datetime.now()
    db.commit()
    db.refresh(config)
    return ok(ConfigOut.model_validate(config), message="配置已更新")


# --------------------------------------------------------------------------- #
# 文件上传
# --------------------------------------------------------------------------- #
@router.post("/uploads")
def admin_upload_file(
    file: UploadFile = File(...),
    _: User = Depends(require_admin),
) -> dict:
    """上传文件到 UPLOAD_DIR，返回可访问 URL /uploads/xxx。"""
    ext = Path(file.filename or "").suffix.lower()
    if ext not in _ALLOWED_EXT:
        raise HTTPException(status_code=400, detail="不支持的文件类型")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    # 用 uuid 重命名，避免覆盖与路径穿越。
    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest = upload_dir / safe_name
    with dest.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    url = f"/uploads/{safe_name}"
    return ok({"url": url, "filename": safe_name}, message="上传成功")
