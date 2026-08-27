"""汇总导出所有 ORM 模型，确保 import 本包即注册到 Base.metadata。"""
from __future__ import annotations

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

__all__ = [
    "DishCategory",
    "Dish",
    "DishReservation",
    "DishReservationItem",
    "Store",
    "News",
    "Job",
    "JobApplication",
    "FranchiseInquiry",
    "ContactMessage",
    "SiteConfig",
    "User",
]
