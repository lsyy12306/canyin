"""邮件通知服务（占位钩子）。

设计意图：表单提交（加盟意向 / 简历投递 / 在线留言）后，异步/同步通知运营或招商负责人。
当前为占位实现：仅打印日志，不真正发送邮件。接入 SMTP 时在此实现发送逻辑即可，
调用方（routers）无需改动。

接入方式建议：
- 引入 smtplib / aiosmtplib + 环境变量 SMTP_HOST/SMTP_USER/SMTP_PASS；
- 或在 settings 中增加 Celery/Redis 后台任务；
- 保持函数签名不变，便于平滑替换。
"""
from __future__ import annotations

import logging

from app.models.contact_messages import ContactMessage
from app.models.dish_reservations import DishReservation
from app.models.franchise_inquiries import FranchiseInquiry
from app.models.job_applications import JobApplication

logger = logging.getLogger("weihe.email")


def _log(subject: str, body: str) -> None:
    """占位：真实环境改为 SMTP 发送。"""
    logger.info("[邮件通知-占位] %s | %s", subject, body)


def send_inquiry_notification(inquiry: FranchiseInquiry) -> None:
    """加盟意向提交后通知招商负责人。"""
    _log(
        "新的加盟意向",
        f"姓名={inquiry.name}, 手机={inquiry.phone}, 城市={inquiry.city}, "
        f"预算={inquiry.budget_range}, 留言={inquiry.message}",
    )


def send_application_notification(application: JobApplication) -> None:
    """简历投递后通知招聘负责人。"""
    _log(
        "新的简历投递",
        f"岗位ID={application.job_id}, 姓名={application.name}, 手机={application.phone}, "
        f"邮箱={application.email}, 留言={application.message}",
    )


def send_contact_notification(message: ContactMessage) -> None:
    """在线留言后通知运营/客服。"""
    _log(
        "新的在线留言",
        f"称呼={message.name}, 联系方式={message.contact}, 类型={message.msg_type}, "
        f"内容={message.content}",
    )


def send_reservation_notification(reservation: DishReservation) -> None:
    """提前预约菜品提交后通知门店运营。"""
    _log(
        "新的菜品预约",
        f"预约ID={reservation.id}, 门店ID={reservation.store_id}, 姓名={reservation.name}, "
        f"手机={reservation.phone}, 日期={reservation.reserve_date} {reservation.reserve_time}, "
        f"人数={reservation.guests}",
    )
