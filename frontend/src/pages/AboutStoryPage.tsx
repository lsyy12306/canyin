import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import PlaceholderImage from '../components/PlaceholderImage';

const PARAGRAPHS = [
  '味禾小馆诞生于 2016 年广东广州。创始人一直希望忙碌的都市人，可以吃到如同家里一般温暖可口的饭菜。',
  '第一家门店扎根广州老城区，坚持每日采购新鲜食材，拒绝预制菜，大火现炒还原粤菜本味。',
  '凭借地道家常口味，门店客流量稳步上涨。2019 年开启连锁扩张之路。',
  '历经多年发展，如今味禾小馆已经在全国十余座城市开设 85 家直营门店，搭建起完整的中央厨房、冷链供应链、食材品控体系。',
];

export default function AboutStoryPage() {
  return (
    <>
      <Helmet>
        <title>品牌故事 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆品牌故事——从广州老城区的一家常家小馆，到全国连锁的放心家庭厨房。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 关于我们 / 品牌故事
          </div>
          <h1>品牌故事</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 680 }}>一口家常味，温暖千万家。</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <PlaceholderImage
            ratio="hero"
            label="品牌故事配图占位"
            alt="味禾小馆品牌故事"
            className="ph-hero"
          />
          {PARAGRAPHS.map((p, i) => (
            <p key={i} style={{ marginBottom: 16 }}>
              {p}
            </p>
          ))}
          <p>
            品牌始终坚守初心：<strong style={{ color: 'var(--brand)' }}>不用劣质食材，用心做好每一餐</strong>
            ，致力于成为大家身边放心的家庭厨房。
          </p>
        </div>
      </section>
    </>
  );
}
