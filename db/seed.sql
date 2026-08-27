-- ===========================================================
-- 味禾小馆 种子数据 (PostgreSQL)
-- 执行顺序：先执行 db/schema.sql 建表，再执行本文件灌入示例数据。
-- 幂等：带唯一键的表使用 ON CONFLICT (唯一键) DO NOTHING；
--        jobs / users 无合适唯一键，改用 WHERE NOT EXISTS 防重复。
-- 字符集：UTF-8（菜品标签使用 JSONB，中文无需转义）。
-- 注意：本文件数据应与 backend/seed.py 保持一致；若 seed.py 调整，
--       请重新生成或同步修改本文件。
-- ===========================================================

-- 5.1 菜品分类（color 为主题色，前台徽标/筛选圆点、后台彩色标签使用）
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('hot', '招牌热菜', '#E0483B', 1) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('soup', '精致靓汤', '#E08A3C', 2) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('stir', '家常小炒', '#6E8B5B', 3) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('staple', '主食点心', '#A9744F', 4) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('cold', '凉菜前菜', '#9B6FB0', 5) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('seafood', '海鲜水产', '#2E86B5', 6) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('snack', '特色小吃', '#D96B9A', 7) ON CONFLICT (key) DO NOTHING;
INSERT INTO dish_categories (key, name, color, sort_order) VALUES ('wellness', '时令养生', '#7BA05B', 8) ON CONFLICT (key) DO NOTHING;

-- 5.9 站点配置（legal 组为合规占位，上线前必填；contact/seo 为联系方式与 SEO）
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('icp', '', 'legal', 'ICP 备案号') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('police_record', '', 'legal', '公安备案号') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('franchise_license', '', 'legal', '商业特许经营备案号') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('franchise_risk_tip', '投资有风险，加盟需谨慎。', 'legal', '加盟风险提示文案') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('privacy_policy', '## 隐私政策

请替换为正式隐私政策内容。', 'legal', '隐私政策 Markdown 正文') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('contact_phone', '400-xxx-xxxx', 'contact', '招商热线') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('contact_email', 'contact@weihe.com', 'contact', '联系邮箱') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('contact_address', '广州市xx区xx路xx号', 'contact', '总部地址') ON CONFLICT (config_key) DO NOTHING;
INSERT INTO site_configs (config_key, config_value, config_group, description) VALUES ('site_title_suffix', '味禾小馆', 'seo', '页面标题后缀') ON CONFLICT (config_key) DO NOTHING;

-- 5.3 门店（image_url 留空，上线前替换为真实门店图）
INSERT INTO stores (city, name, slug, highlight, image_url, sort_order, is_active) VALUES ('广州', '北京路店', 'guangzhou-beijinglu', '品牌始发店，扎根老城区社区，复购率领先。', '', 1, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO stores (city, name, slug, highlight, image_url, sort_order, is_active) VALUES ('深圳', '福田店', 'shenzhen-futian', '商圈白领简餐首选，午市翻台高效。', '', 2, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO stores (city, name, slug, highlight, image_url, sort_order, is_active) VALUES ('武汉', '江汉路店', 'wuhan-jianghanlu', '华中旗舰店，家庭聚餐热门地标。', '', 3, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO stores (city, name, slug, highlight, image_url, sort_order, is_active) VALUES ('成都', '春熙路店', 'chengdu-chunxilu', '西南首店，川粤融合受年轻人喜爱。', '', 4, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO stores (city, name, slug, highlight, image_url, sort_order, is_active) VALUES ('西安', '钟楼店', 'xian-zhonglou', '西北枢纽店，文旅客流稳定。', '', 5, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO stores (city, name, slug, highlight, image_url, sort_order, is_active) VALUES ('长沙', '五一店', 'changsha-wuyi', '新一线布局，夜经济表现亮眼。', '', 6, TRUE) ON CONFLICT (slug) DO NOTHING;

-- 5.4 新闻（cover_image 留空占位；published_at 为 DATE 字面量）
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('corporate', '味禾小馆全国直营门店突破 85 家', 'corp-stores-85', '继上半年新开 8 城后，品牌持续稳健扩张，中央厨房与冷链品控体系同步升级。', '继上半年新开 8 城后，品牌持续稳健扩张，中央厨房与冷链品控体系同步升级，保障多城出品稳定。', '', '2026-08-20', TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('corporate', '夏季时令菜单上线，主打清爽家常', 'corp-summer-menu', '结合当季食材推出轻负担系列，兼顾口味与健康。', '结合当季食材推出轻负担系列，兼顾口味与健康，覆盖家庭聚餐与上班族简餐场景。', '', '2026-07-12', TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('corporate', '全新供应链中心投入运营', 'corp-supply-chain', '新增冷链分拨能力，进一步缩短从采购到门店的链路。', '新增冷链分拨能力，进一步缩短从采购到门店的链路，支撑新城市拓展。', '', '2026-06-03', TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('corporate', '“明档现炒”体验升级', 'corp-open-kitchen', '多家门店改造开放厨房，让顾客直观看到现炒过程。', '多家门店改造开放厨房，让顾客直观看到现炒过程，强化“拒绝预制菜”的品牌承诺。', '', '2026-05-18', TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('industry', '“现炒现做”成为连锁餐饮新卖点', 'ind-fresh-cooking', '消费者愈发关注预制与透明度，明档现炒成为差异化竞争关键。', '消费者愈发关注预制与透明度，明档现炒、食材可追溯成为差异化竞争关键。', '', '2026-08-15', TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('industry', '社区餐饮的“高频复购”逻辑', 'ind-community', '人均 60 元上下的家常正餐，构建强复购模型。', '人均 60 元上下的家常正餐，凭借稳定出品与就近便利，构建强复购模型。', '', '2026-07-28', TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO news (type, title, slug, summary, content, cover_image, published_at, is_published) VALUES ('industry', '冷链供应链如何支撑多城扩张', 'ind-cold-chain', '中央厨房 + 区域分拨，是守住口味与食安的底层能力。', '中央厨房 + 区域分拨，是连锁品牌在扩张期守住口味与食安的底层能力。', '', '2026-06-30', TRUE) ON CONFLICT (slug) DO NOTHING;

-- 5.2 菜品（category_id 用子查询关联分类 key；tags 为 JSONB 数组；
--       image_url 指向 /uploads/dishes/*.png，需后端静态目录存在这些图）
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('古法烧腩仔', 'gufa-shaonanzhai', (SELECT id FROM dish_categories WHERE key='hot'), 4800, '皮脆肉嫩，粤式烧味经典。', '/uploads/dishes/roast-pork-belly.png', '["招牌"]'::jsonb, TRUE, 1, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('白切清远鸡', 'baiqie-qingyuanji', (SELECT id FROM dish_categories WHERE key='hot'), 5800, '原汁原味，配姜葱蓉。', '/uploads/dishes/poached-chicken.png', '["粤味"]'::jsonb, TRUE, 2, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('豉汁蒸排骨', 'chizhi-zhengpaigu', (SELECT id FROM dish_categories WHERE key='hot'), 3800, '软糯入味，老少皆宜。', '/uploads/dishes/ribs-blackbean.png', '["热销"]'::jsonb, TRUE, 3, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('啫啫黄鳝煲', 'zeze-huangshanbao', (SELECT id FROM dish_categories WHERE key='hot'), 5200, '砂锅生啫，锅气十足。', '/uploads/dishes/claypot-eel.png', '["现做"]'::jsonb, FALSE, 4, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('蜜汁叉烧', 'mizhi-chashao', (SELECT id FROM dish_categories WHERE key='hot'), 4600, '蜜汁焦香，广式烧味代表。', '/uploads/dishes/char-siu.png', '["招牌"]'::jsonb, TRUE, 5, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('椰子鸡火锅', 'yeziji-huoguo', (SELECT id FROM dish_categories WHERE key='hot'), 8800, '清甜滋补，现涮鲜活。', '/uploads/dishes/coconut-chicken-hotpot.png', '["时令"]'::jsonb, FALSE, 6, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('白灼基围虾', 'baizhuo-jiweixia', (SELECT id FROM dish_categories WHERE key='seafood'), 6800, '鲜活白灼，蘸料提鲜。', '/uploads/dishes/poached-prawns.png', '["海鲜"]'::jsonb, FALSE, 7, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('清蒸石斑鱼', 'qingzheng-shiban', (SELECT id FROM dish_categories WHERE key='seafood'), 12800, '肉质细嫩，原汁清蒸。', '/uploads/dishes/steamed-grouper.png', '["海鲜"]'::jsonb, TRUE, 8, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('老火例汤', 'laohuo-litang', (SELECT id FROM dish_categories WHERE key='soup'), 1800, '每日一炖，温润养生。', '/uploads/dishes/old-fire-soup.png', '["每日"]'::jsonb, TRUE, 9, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('陈皮老鸭汤', 'chenpi-laoyatang', (SELECT id FROM dish_categories WHERE key='soup'), 2800, '陈皮入味，温润去燥。', '/uploads/dishes/duck-tangerine-soup.png', '["滋补"]'::jsonb, FALSE, 10, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('上汤娃娃菜', 'shangtang-wawacai', (SELECT id FROM dish_categories WHERE key='stir'), 2800, '清爽解腻，家常好味。', '/uploads/dishes/baby-cabbage.png', '["素菜"]'::jsonb, FALSE, 11, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('干炒牛河', 'ganchao-niuhe', (SELECT id FROM dish_categories WHERE key='stir'), 3200, '镬气十足，河粉爽滑。', '/uploads/dishes/beef-hofun.png', '["热销"]'::jsonb, TRUE, 12, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('拍黄瓜', 'paichuanggua', (SELECT id FROM dish_categories WHERE key='cold'), 1600, '清爽开胃，蒜香脆口。', '/uploads/dishes/cucumber-salad.png', '["凉菜"]'::jsonb, FALSE, 13, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('皮蛋拌豆腐', 'pidan-tofu', (SELECT id FROM dish_categories WHERE key='cold'), 1800, '清凉滑嫩，下饭一绝。', '/uploads/dishes/century-egg-tofu.png', '["凉菜"]'::jsonb, FALSE, 14, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('腊味煲仔饭', 'lawwei-baozifan', (SELECT id FROM dish_categories WHERE key='staple'), 3200, '焦香锅巴，一口满足。', '/uploads/dishes/claypot-rice.png', '["主食"]'::jsonb, TRUE, 15, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('流沙奶黄包', 'liusha-naihuangbao', (SELECT id FROM dish_categories WHERE key='staple'), 1600, '现蒸点心，咸甜流心。', '/uploads/dishes/custard-bun.png', '["点心"]'::jsonb, FALSE, 16, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('脆皮炸鲜奶', 'cuipi-zhanai', (SELECT id FROM dish_categories WHERE key='snack'), 2200, '外脆内嫩，甜而不腻。', '/uploads/dishes/fried-milk.png', '["小吃"]'::jsonb, FALSE, 17, TRUE) ON CONFLICT (slug) DO NOTHING;
INSERT INTO dishes (name, slug, category_id, price, description, image_url, tags, is_recommended, sort_order, is_active) VALUES ('雪梨银耳羹', 'xueli-yiner', (SELECT id FROM dish_categories WHERE key='wellness'), 2000, '润肺清甜，时令养生。', '/uploads/dishes/pear-fungus-soup.png', '["养生"]'::jsonb, TRUE, 18, TRUE) ON CONFLICT (slug) DO NOTHING;

-- 5.5 岗位（title 非唯一，使用 WHERE NOT EXISTS 防重复插入）
INSERT INTO jobs (title, department, location, type, description, requirements, sort_order, is_active) SELECT '门店店长', '营运', '多城直营门店', 'full_time', '负责单店日常运营、团队管理与业绩达成。', '3 年以上餐饮门店管理经验，责任心强。', 1, TRUE WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title='门店店长');
INSERT INTO jobs (title, department, location, type, description, requirements, sort_order, is_active) SELECT '粤菜厨师 / 炒锅', '厨房', '各门店厨房', 'full_time', '负责粤菜热炒与出品质量把控。', '扎实炒锅功底，熟悉粤菜工艺。', 2, TRUE WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title='粤菜厨师 / 炒锅');
INSERT INTO jobs (title, department, location, type, description, requirements, sort_order, is_active) SELECT '前厅服务 / 领班', '前厅', '各门店前厅', 'part_time', '负责顾客接待、点单与用餐服务。', '良好服务意识，兼职亦可。', 3, TRUE WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title='前厅服务 / 领班');
INSERT INTO jobs (title, department, location, type, description, requirements, sort_order, is_active) SELECT '供应链专员', '供应链', '区域分拨中心', 'full_time', '负责采购协同与分拨调度。', '物流 / 供应链相关经验优先。', 4, TRUE WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title='供应链专员');
INSERT INTO jobs (title, department, location, type, description, requirements, sort_order, is_active) SELECT '品牌 / 新媒体运营', '品牌市场', '总部', 'full_time', '负责品牌内容与新媒体矩阵运营。', '文案与剪辑能力，懂餐饮流量。', 5, TRUE WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title='品牌 / 新媒体运营');
INSERT INTO jobs (title, department, location, type, description, requirements, sort_order, is_active) SELECT '加盟拓展经理', '招商', '总部', 'full_time', '负责加盟线索拓展与洽谈。', '商务拓展经验，能适应出差。', 6, TRUE WHERE NOT EXISTS (SELECT 1 FROM jobs WHERE title='加盟拓展经理');

-- 5.10 管理后台用户（默认账号 admin / admin123456，首次登录务必修改密码！）
INSERT INTO users (username, hashed_password, role, is_active) SELECT 'admin', '$2b$12$au7nFArMvgJ5tiSySY/wauAJJXIrKmQ8CE2eiG8uLQXRuyK2POVou', 'admin', TRUE WHERE NOT EXISTS (SELECT 1 FROM users WHERE username='admin');
