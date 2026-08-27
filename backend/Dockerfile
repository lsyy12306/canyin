# 味禾小馆官网后端镜像
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

# 先装依赖以利用构建缓存
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY app /app/app
COPY alembic.ini /app/alembic.ini
COPY seed.py /app/seed.py

# 运行时用户
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

# 生产建议：先执行 `alembic upgrade head`（或 `python seed.py` 初始化），再启动。
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
