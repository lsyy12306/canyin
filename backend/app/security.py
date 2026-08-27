"""安全相关：JWT 令牌、密码哈希、当前用户依赖。

- 密码使用 bcrypt（passlib）哈希存储。
- JWT 使用 python-jose（HS256）签发与校验。
- get_current_user：从 Authorization: Bearer 解析 token，返回 User。
- require_admin：在 get_current_user 基础上校验管理员角色。
"""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.users import User

# bcrypt 密码哈希上下文。
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 不强制要求请求必须带 token（由依赖自己判断），便于 401 自定义消息。
_bearer = HTTPBearer(auto_error=False)

ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(subject: str | int, role: str = "editor", expires_minutes: Optional[int] = None) -> str:
    """签发 JWT 访问令牌。"""
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=expires_minutes or settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    payload = {"sub": str(subject), "role": role, "exp": expire}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    """校验并解码 token，失败抛出 JWTError。"""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    """解析 Bearer token 返回当前用户；无效/缺失则 401。"""
    if credentials is None or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="未提供认证凭据")
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = int(payload.get("sub"))
        role = payload.get("role", "editor")
    except (JWTError, ValueError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="无效或过期的令牌")

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="用户不存在或已禁用")
    # 将角色从 token 同步到对象（避免 token 与库不一致时权限判断偏差）。
    user.role = role
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """写操作鉴权：要求 admin 角色，否则 403。"""
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="需要管理员权限")
    return user
