import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Leaf, Flame, Truck, Wallet, type LucideIcon } from 'lucide-react';
import Hero from '../components/Hero';
import SectionHeader from '../components/SectionHeader';
import DishCard from '../components/DishCard';
import StoreCard from '../components/StoreCard';
import NewsCard from '../components/NewsCard';
import { useDishes } from '../hooks/useDishes';
import { useStores } from '../hooks/useStores';
import { useNews } from '../hooks/useNews';

const FEATURES: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Leaf, title: '每日鲜采', desc: '坚持每日采购新鲜食材，门店不囤隔夜菜，从源头保证口感与安心。' },
  { icon: Flame, title: '大火现炒', desc: '拒绝预制菜，明档现炒还原粤菜本味，锅气十足、出品稳定。' },
  { icon: Truck, title: '冷链品控', desc: '自建中央厨房与冷链供应链，食材可追溯，标准化配送到全国门店。' },
  { icon: Wallet, title: '家常定价', desc: '人均 55-75 元，让家庭聚餐、朋友小聚、上班族简餐都吃得放心。' },
];

export default function HomePage() {
  const { dishes } = useDishes({ is_recommended: true });
  const { stores } = useStores();
  const { news } = useNews('corporate');

  const recommended = dishes.slice(0, 4);
  const topStores = stores.slice(0, 3);
  const topNews = news.slice(0, 2);

  return (
    <>
      <Helmet>
        <title>味禾小馆 | 一口家常味，温暖千万家</title>
        <meta
          name="description"
          content="味禾小馆——主打新式家常粤菜的全国连锁餐饮品牌，现炒现做、食材新鲜，人均 55-75 元，全国 85 家直营门店。"
        />
      </Helmet>

      <Hero
        title="一口家常味"
        accent="温暖千万家"
        slogan="新式家常粤菜 · 全国 85 家直营门店 · 现炒现做，拒绝预制"
        tags={['每日鲜采', '大火现炒', '中央厨房冷链', '人均 55-75 元']}
        primary={{ to: '/products/dishes', label: '查看招牌菜品' }}
        ghost={{ to: '/franchise/cooperation', label: '了解加盟合作' }}
        figureText="味禾小馆 · 家常粤味"
      />

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="为什么选味禾"
            title="把“家”的味道，端上每一张餐桌"
            subtitle="从田间到灶台，我们用一套完整的供应链与品控体系，守住每一餐的安心与地道。"
          />
          <div className="grid grid-4">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div className="card" key={f.title}>
                  <Icon className="ico" size={28} />
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeader
            eyebrow="招牌推荐"
            title="到店必点的几道家常味"
            subtitle="数据来自后端菜品接口，正式上线前将替换为真实菜品图片与介绍。"
          />
          <div className="grid grid-4">
            {recommended.map((d) => (
              <DishCard key={d.id} dish={d} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link className="btn btn-ghost" to="/products/dishes">
              进入菜品中心 →
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader
            eyebrow="门店网络"
            title="全国十余城，85 家直营门店"
            subtitle="从广州老城区出发，味禾小馆把家常粤味带到了更多城市的街坊邻里。"
          />
          <div className="grid grid-3">
            {topStores.map((s) => (
              <StoreCard key={s.id} store={s} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link className="btn btn-ghost" to="/products/stores">
              查看门店案例 →
            </Link>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="cta-band">
            <h2>想开一家属于你城市的味禾小馆？</h2>
            <p>成熟的供应链、运营与培训体系，助你稳健起步。欢迎了解加盟合作与人才招募。</p>
            <Link className="btn btn-amber" to="/franchise/cooperation">
              查看加盟政策
            </Link>
            <Link className="btn btn-ghost" to="/franchise/jobs">
              加入我们
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="品牌动态" title="最新新闻" />
          {topNews.map((n) => (
            <NewsCard key={n.id} news={n} />
          ))}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link className="btn btn-ghost" to="/news/corporate">
              更多企业新闻 →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
