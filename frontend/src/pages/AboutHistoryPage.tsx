import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import Timeline from '../components/Timeline';

const HISTORY = [
  { year: '2016', text: '广州第一家味禾小馆开业，扎根老城区社区。' },
  { year: '2018', text: '门店突破 10 家，搭建自有供应链。' },
  { year: '2019', text: '正式开启省外连锁扩张。' },
  { year: '2022', text: '全国门店达到 50 家。' },
  { year: '2026', text: '全国直营门店 85 家，持续开拓新城市。' },
];

export default function AboutHistoryPage() {
  return (
    <>
      <Helmet>
        <title>发展历程 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆发展历程——从 2016 年广州首家门店到全国 85 家直营门店的十年之路。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 关于我们 / 发展历程
          </div>
          <h1>发展历程</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 680 }}>
            十年深耕，把家常味从一条老街开向全国。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeader eyebrow="一路走来" title="味禾的十年" />
          <Timeline items={HISTORY} />
        </div>
      </section>
    </>
  );
}
