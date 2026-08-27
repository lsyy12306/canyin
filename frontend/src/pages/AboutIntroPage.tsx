import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Target, Handshake, Heart, type LucideIcon } from 'lucide-react';
import PlaceholderImage from '../components/PlaceholderImage';
import SectionHeader from '../components/SectionHeader';

const CULTURE: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: Target, title: '品牌愿景', desc: '成为国民喜爱的家常餐饮连锁品牌。' },
  { icon: Handshake, title: '经营理念', desc: '新鲜为本，诚信经营，温暖服务。' },
  { icon: Heart, title: '核心价值观', desc: '食材安心、口味地道、顾客至上。' },
];

export default function AboutIntroPage() {
  return (
    <>
      <Helmet>
        <title>品牌简介 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆品牌简介——新式家常粤菜全国连锁品牌，健康家常、现炒现做、食材新鲜。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 关于我们 / 品牌简介
          </div>
          <h1>品牌简介</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 680 }}>
            味禾小馆，是一家主打新式家常粤菜的全国连锁餐饮品牌。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: 24, marginBottom: 12 }}>我们是谁</h2>
              <p style={{ color: 'var(--muted)' }}>
                味禾小馆主打健康家常菜、现炒现做、食材新鲜。客群面向家庭聚餐、朋友小聚、上班族简餐，人均消费
                55-75 元。品牌始终坚守初心：不用劣质食材，用心做好每一餐，致力于成为大家身边放心的家庭厨房。
              </p>
              <div style={{ marginTop: 18, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span className="badge badge-fresh">健康家常</span>
                <span className="badge badge-amber">现炒现做</span>
                <span className="badge badge-brand">食材新鲜</span>
                <span className="badge badge-brand">全国连锁</span>
              </div>
            </div>
            <PlaceholderImage ratio="hero" label="品牌主视觉占位" alt="味禾小馆品牌视觉" />
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <SectionHeader eyebrow="企业文化" title="我们坚守的东西" />
          <div className="grid grid-3">
            {CULTURE.map((c) => {
              const Icon = c.icon;
              return (
                <div className="card" key={c.title}>
                  <Icon className="ico" size={28} />
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
