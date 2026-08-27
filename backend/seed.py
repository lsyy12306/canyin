"""种子数据脚本：建表并写入示例内容。

读取静态原型（products/dishes.html、products/stores.html、news/*.html、
franchise/jobs.html）中的示例文案，转换为结构化数据写入数据库。

运行方式（在 backend/ 目录下）：
    python seed.py

特点：
- 幂等：按唯一键（slug / config_key / key / username）跳过已存在记录。
- 默认 SQLite；生产将 DATABASE_URL 指向 PostgreSQL 即可。
- 菜品图片来自 backend/app/static/uploads/dishes/ 下由 ImageGen 生成的示意图。
"""
from __future__ import annotations

from datetime import date

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.models.contact_messages import ContactMessage  # noqa: F401
from app.models.dish_categories import DishCategory
from app.models.dishes import Dish
from app.models.dish_reservation_items import DishReservationItem
from app.models.dish_reservations import DishReservation
from app.models.franchise_inquiries import FranchiseInquiry  # noqa: F401
from app.models.jobs import Job
from app.models.news import News
from app.models.site_configs import SiteConfig
from app.models.stores import Store
from app.models.users import User
from app.security import hash_password


# --------------------------------------------------------------------------- #
# 数据定义（来源：weihe-website 静态原型）
# --------------------------------------------------------------------------- #
# 分类定义：(key 英文键, 显示名, 主题色十六进制, 排序权重)
# color 用于前台分类徽标/筛选圆点、后台彩色标签；sort_order 越小越靠前。
CATEGORIES = [
    ("hot", "招牌热菜", "#E0483B", 1),
    ("soup", "精致靓汤", "#E08A3C", 2),
    ("stir", "家常小炒", "#6E8B5B", 3),
    ("staple", "主食点心", "#A9744F", 4),
    ("cold", "凉菜前菜", "#9B6FB0", 5),
    ("seafood", "海鲜水产", "#2E86B5", 6),
    ("snack", "特色小吃", "#D96B9A", 7),
    ("wellness", "时令养生", "#7BA05B", 8),
]

# (name, slug, category_key, price分, description, tags, is_recommended, sort_order, image)
UPLOAD = "/uploads/dishes"
DISHES = [
    ("古法烧腩仔", "gufa-shaonanzhai", "hot", 4800, "皮脆肉嫩，粤式烧味经典。", ["招牌"], True, 1, f"{UPLOAD}/roast-pork-belly.png"),
    ("白切清远鸡", "baiqie-qingyuanji", "hot", 5800, "原汁原味，配姜葱蓉。", ["粤味"], True, 2, f"{UPLOAD}/poached-chicken.png"),
    ("豉汁蒸排骨", "chizhi-zhengpaigu", "hot", 3800, "软糯入味，老少皆宜。", ["热销"], True, 3, f"{UPLOAD}/ribs-blackbean.png"),
    ("啫啫黄鳝煲", "zeze-huangshanbao", "hot", 5200, "砂锅生啫，锅气十足。", ["现做"], False, 4, f"{UPLOAD}/claypot-eel.png"),
    ("蜜汁叉烧", "mizhi-chashao", "hot", 4600, "蜜汁焦香，广式烧味代表。", ["招牌"], True, 5, f"{UPLOAD}/char-siu.png"),
    ("椰子鸡火锅", "yeziji-huoguo", "hot", 8800, "清甜滋补，现涮鲜活。", ["时令"], False, 6, f"{UPLOAD}/coconut-chicken-hotpot.png"),
    ("白灼基围虾", "baizhuo-jiweixia", "seafood", 6800, "鲜活白灼，蘸料提鲜。", ["海鲜"], False, 7, f"{UPLOAD}/poached-prawns.png"),
    ("清蒸石斑鱼", "qingzheng-shiban", "seafood", 12800, "肉质细嫩，原汁清蒸。", ["海鲜"], True, 8, f"{UPLOAD}/steamed-grouper.png"),
    ("老火例汤", "laohuo-litang", "soup", 1800, "每日一炖，温润养生。", ["每日"], True, 9, f"{UPLOAD}/old-fire-soup.png"),
    ("陈皮老鸭汤", "chenpi-laoyatang", "soup", 2800, "陈皮入味，温润去燥。", ["滋补"], False, 10, f"{UPLOAD}/duck-tangerine-soup.png"),
    ("上汤娃娃菜", "shangtang-wawacai", "stir", 2800, "清爽解腻，家常好味。", ["素菜"], False, 11, f"{UPLOAD}/baby-cabbage.png"),
    ("干炒牛河", "ganchao-niuhe", "stir", 3200, "镬气十足，河粉爽滑。", ["热销"], True, 12, f"{UPLOAD}/beef-hofun.png"),
    ("拍黄瓜", "paichuanggua", "cold", 1600, "清爽开胃，蒜香脆口。", ["凉菜"], False, 13, f"{UPLOAD}/cucumber-salad.png"),
    ("皮蛋拌豆腐", "pidan-tofu", "cold", 1800, "清凉滑嫩，下饭一绝。", ["凉菜"], False, 14, f"{UPLOAD}/century-egg-tofu.png"),
    ("腊味煲仔饭", "lawwei-baozifan", "staple", 3200, "焦香锅巴，一口满足。", ["主食"], True, 15, f"{UPLOAD}/claypot-rice.png"),
    ("流沙奶黄包", "liusha-naihuangbao", "staple", 1600, "现蒸点心，咸甜流心。", ["点心"], False, 16, f"{UPLOAD}/custard-bun.png"),
    ("脆皮炸鲜奶", "cuipi-zhanai", "snack", 2200, "外脆内嫩，甜而不腻。", ["小吃"], False, 17, f"{UPLOAD}/fried-milk.png"),
    ("雪梨银耳羹", "xueli-yiner", "wellness", 2000, "润肺清甜，时令养生。", ["养生"], True, 18, f"{UPLOAD}/pear-fungus-soup.png"),
]

# (city, name, slug, highlight, sort_order)
STORES = [
    ("广州", "北京路店", "guangzhou-beijinglu", "品牌始发店，扎根老城区社区，复购率领先。", 1),
    ("深圳", "福田店", "shenzhen-futian", "商圈白领简餐首选，午市翻台高效。", 2),
    ("武汉", "江汉路店", "wuhan-jianghanlu", "华中旗舰店，家庭聚餐热门地标。", 3),
    ("成都", "春熙路店", "chengdu-chunxilu", "西南首店，川粤融合受年轻人喜爱。", 4),
    ("西安", "钟楼店", "xian-zhonglou", "西北枢纽店，文旅客流稳定。", 5),
    ("长沙", "五一店", "changsha-wuyi", "新一线布局，夜经济表现亮眼。", 6),
]

# 新闻：(type, title, slug, published_at, summary, content)
NEWS = [
    ("corporate", "味禾小馆全国直营门店突破 85 家", "corp-stores-85", date(2026, 8, 20),
     "继上半年新开 8 城后，品牌持续稳健扩张，中央厨房与冷链品控体系同步升级。",
     "继上半年新开 8 城后，品牌持续稳健扩张，中央厨房与冷链品控体系同步升级，保障多城出品稳定。"),
    ("corporate", "夏季时令菜单上线，主打清爽家常", "corp-summer-menu", date(2026, 7, 12),
     "结合当季食材推出轻负担系列，兼顾口味与健康。",
     "结合当季食材推出轻负担系列，兼顾口味与健康，覆盖家庭聚餐与上班族简餐场景。"),
    ("corporate", "全新供应链中心投入运营", "corp-supply-chain", date(2026, 6, 3),
     "新增冷链分拨能力，进一步缩短从采购到门店的链路。",
     "新增冷链分拨能力，进一步缩短从采购到门店的链路，支撑新城市拓展。"),
    ("corporate", "“明档现炒”体验升级", "corp-open-kitchen", date(2026, 5, 18),
     "多家门店改造开放厨房，让顾客直观看到现炒过程。",
     "多家门店改造开放厨房，让顾客直观看到现炒过程，强化“拒绝预制菜”的品牌承诺。"),
    ("industry", "“现炒现做”成为连锁餐饮新卖点", "ind-fresh-cooking", date(2026, 8, 15),
     "消费者愈发关注预制与透明度，明档现炒成为差异化竞争关键。",
     "消费者愈发关注预制与透明度，明档现炒、食材可追溯成为差异化竞争关键。"),
    ("industry", "社区餐饮的“高频复购”逻辑", "ind-community", date(2026, 7, 28),
     "人均 60 元上下的家常正餐，构建强复购模型。",
     "人均 60 元上下的家常正餐，凭借稳定出品与就近便利，构建强复购模型。"),
    ("industry", "冷链供应链如何支撑多城扩张", "ind-cold-chain", date(2026, 6, 30),
     "中央厨房 + 区域分拨，是守住口味与食安的底层能力。",
     "中央厨房 + 区域分拨，是连锁品牌在扩张期守住口味与食安的底层能力。"),
]

# (title, department, location, type, description, requirements, sort_order)
JOBS = [
    ("门店店长", "营运", "多城直营门店", "full_time",
     "负责单店日常运营、团队管理与业绩达成。", "3 年以上餐饮门店管理经验，责任心强。", 1),
    ("粤菜厨师 / 炒锅", "厨房", "各门店厨房", "full_time",
     "负责粤菜热炒与出品质量把控。", "扎实炒锅功底，熟悉粤菜工艺。", 2),
    ("前厅服务 / 领班", "前厅", "各门店前厅", "part_time",
     "负责顾客接待、点单与用餐服务。", "良好服务意识，兼职亦可。", 3),
    ("供应链专员", "供应链", "区域分拨中心", "full_time",
     "负责采购协同与分拨调度。", "物流 / 供应链相关经验优先。", 4),
    ("品牌 / 新媒体运营", "品牌市场", "总部", "full_time",
     "负责品牌内容与新媒体矩阵运营。", "文案与剪辑能力，懂餐饮流量。", 5),
    ("加盟拓展经理", "招商", "总部", "full_time",
     "负责加盟线索拓展与洽谈。", "商务拓展经验，能适应出差。", 6),
]

# (config_key, config_value, config_group, description)
CONFIGS = [
    ("icp", "", "legal", "ICP 备案号"),
    ("police_record", "", "legal", "公安备案号"),
    ("franchise_license", "", "legal", "商业特许经营备案号"),
    ("franchise_risk_tip", "投资有风险，加盟需谨慎。", "legal", "加盟风险提示文案"),
    ("privacy_policy", "## 隐私政策\n\n请替换为正式隐私政策内容。", "legal", "隐私政策 Markdown 正文"),
    ("contact_phone", "400-xxx-xxxx", "contact", "招商热线"),
    ("contact_email", "contact@weihe.com", "contact", "联系邮箱"),
    ("contact_address", "广州市xx区xx路xx号", "contact", "总部地址"),
    ("site_title_suffix", "味禾小馆", "seo", "页面标题后缀"),
]


# --------------------------------------------------------------------------- #
# 写入逻辑（幂等）
# --------------------------------------------------------------------------- #
def _seed_categories(db) -> dict[str, int]:
    existing = {c.key for c in db.query(DishCategory).all()}
    id_map: dict[str, int] = {}
    for key, name, color, sort_order in CATEGORIES:
        if key in existing:
            cat = db.query(DishCategory).filter(DishCategory.key == key).first()
            if cat is not None:
                # 存量记录：回填颜色（列可能由 _auto_migrate 补建）。
                cat.color = color
                cat.sort_order = sort_order
                id_map[key] = cat.id
            continue
        cat = DishCategory(key=key, name=name, color=color, sort_order=sort_order)
        db.add(cat)
        db.flush()
        id_map[key] = cat.id
    return id_map


def _seed_configs(db) -> None:
    existing = {c.config_key for c in db.query(SiteConfig).all()}
    for key, value, group, desc in CONFIGS:
        if key in existing:
            continue
        db.add(SiteConfig(config_key=key, config_value=value, config_group=group, description=desc))


def _seed_dishes(db, cat_ids: dict[str, int]) -> None:
    existing = {d.slug for d in db.query(Dish).all()}
    for name, slug, cat_key, price, desc, tags, rec, order, image in DISHES:
        if slug in existing:
            continue
        db.add(
            Dish(
                name=name,
                slug=slug,
                category_id=cat_ids[cat_key],
                price=price,
                description=desc,
                image_url=image,
                tags=tags,
                is_recommended=rec,
                sort_order=order,
                is_active=True,
            )
        )


def _seed_stores(db) -> None:
    existing = {s.slug for s in db.query(Store).all()}
    for city, name, slug, highlight, order in STORES:
        if slug in existing:
            continue
        db.add(
            Store(
                city=city,
                name=name,
                slug=slug,
                highlight=highlight,
                image_url="",
                sort_order=order,
                is_active=True,
            )
        )


def _seed_news(db) -> None:
    existing = {n.slug for n in db.query(News).all()}
    for ntype, title, slug, pub, summary, content in NEWS:
        if slug in existing:
            continue
        db.add(
            News(
                type=ntype,
                title=title,
                slug=slug,
                summary=summary,
                content=content,
                cover_image="",
                published_at=pub,
                is_published=True,
            )
        )


def _seed_jobs(db) -> None:
    existing = {j.title for j in db.query(Job).all()}
    for title, dept, loc, jtype, desc, req, order in JOBS:
        if title in existing:
            continue
        db.add(
            Job(
                title=title,
                department=dept,
                location=loc,
                type=jtype,
                description=desc,
                requirements=req,
                sort_order=order,
                is_active=True,
            )
        )


def _seed_admin(db) -> None:
    if db.query(User).count() > 0:
        return
    db.add(
        User(
            username=settings.DEFAULT_ADMIN_USER,
            hashed_password=hash_password(settings.DEFAULT_ADMIN_PASSWORD),
            role="admin",
            is_active=True,
        )
    )


def _seed_reservations(db) -> None:
    """示例预约（仅演示用，幂等）。"""
    if db.query(DishReservation).count() > 0:
        return
    store = db.query(Store).order_by(Store.id).first()
    d1 = db.query(Dish).order_by(Dish.id).first()
    d2 = db.query(Dish).order_by(Dish.id).offset(1).first()
    if store is None or d1 is None:
        return
    res = DishReservation(
        store_id=store.id,
        name="示例顾客",
        phone="13800000000",
        reserve_date="2026-09-01",
        reserve_time="18:30",
        guests=4,
        note="希望安排靠窗位置，提前备好两道招牌菜。",
        status="pending",
    )
    db.add(res)
    db.flush()
    db.add(DishReservationItem(reservation_id=res.id, dish_id=d1.id, quantity=2))
    if d2 is not None:
        db.add(DishReservationItem(reservation_id=res.id, dish_id=d2.id, quantity=1))


def seed_all() -> None:
    # 兜底建表（生产以 alembic 为准）。
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        cat_ids = _seed_categories(db)
        _seed_configs(db)
        _seed_dishes(db, cat_ids)
        _seed_stores(db)
        _seed_news(db)
        _seed_jobs(db)
        _seed_admin(db)
        _seed_reservations(db)
        db.commit()
    print("种子数据写入完成（已存在记录自动跳过）。")


if __name__ == "__main__":
    seed_all()
