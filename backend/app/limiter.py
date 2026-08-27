"""全局限流器（slowapi）。

统一按客户端 IP 限流。表单写接口使用 @limiter.limit("5/minute")。
放置在独立模块，避免 routers 与 main 之间的循环依赖。
"""
from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
