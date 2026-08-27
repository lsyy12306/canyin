"""接口冒烟测试。

使用 fastapi.testclient.TestClient + pytest，覆盖：
- 健康检查
- 菜品列表返回 code=200 且有数据
- 加盟意向提交返回 200 且 data.id 存在（真实落库）
- 管理后台接口需鉴权（未带 token 返回 401）
- 登录后可访问管理后台菜品列表
"""
from __future__ import annotations

import os

os.environ.setdefault("DATABASE_URL", "sqlite:///./.test_weihe.db")
os.environ.setdefault("SECRET_KEY", "test-secret-key-for-unit-tests-only")

from fastapi.testclient import TestClient

from app.config import settings
from app.main import app

client = TestClient(app)


def test_health() -> None:
    resp = client.get("/api/public/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert body["data"]["status"] == "ok"


def test_list_dishes() -> None:
    resp = client.get("/api/dishes")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert "items" in body["data"]
    assert len(body["data"]["items"]) > 0
    # DishOut 含计算字段
    first = body["data"]["items"][0]
    assert "category" in first and "category_name" in first and "price_text" in first


def test_dish_categories() -> None:
    resp = client.get("/api/dishes/dish-categories")
    assert resp.status_code == 200
    assert resp.json()["code"] == 200
    assert len(resp.json()["data"]) == 4


def test_create_inquiry() -> None:
    resp = client.post(
        "/api/franchise/inquiries",
        json={"name": "张先生", "phone": "13800138000"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    assert body["data"]["id"]


def test_create_contact_message() -> None:
    resp = client.post(
        "/api/contact/messages",
        json={
            "name": "李女士",
            "contact": "13800138001",
            "msg_type": "cooperation",
            "content": "希望洽谈品牌合作。",
        },
    )
    assert resp.status_code == 200
    assert resp.json()["code"] == 200
    assert resp.json()["data"]["id"]


def test_admin_requires_auth() -> None:
    resp = client.get("/api/admin/dishes")
    assert resp.status_code == 401
    body = resp.json()
    assert body["code"] == 401


def test_admin_login_and_list() -> None:
    resp = client.post(
        "/api/admin/login",
        json={
            "username": settings.DEFAULT_ADMIN_USER,
            "password": settings.DEFAULT_ADMIN_PASSWORD,
        },
    )
    assert resp.status_code == 200
    token = resp.json()["data"]["access_token"]
    assert token

    resp2 = client.get(
        "/api/admin/dishes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp2.status_code == 200
    assert resp2.json()["code"] == 200
    assert len(resp2.json()["data"]) > 0


def test_configs_public() -> None:
    resp = client.get("/api/public/configs")
    assert resp.status_code == 200
    body = resp.json()
    assert body["code"] == 200
    keys = {item["key"] for item in body["data"]}
    assert "contact_phone" in keys
    # configs 接口将 config_key 映射为 key
    assert all("key" in item and "value" in item for item in body["data"])
