import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import NewsCard from '../components/NewsCard';
import { useNews } from '../hooks/useNews';
import type { NewsType } from '../types';

const META: Record<NewsType, { title: string; desc: string; crumb: string; other: NewsType; otherLabel: string }> = {
  corporate: {
    title: '企业新闻',
    desc: '味禾小馆品牌动态与经营进展，来自后端新闻接口。',
    crumb: '企业新闻',
    other: 'industry',
    otherLabel: '查看行业资讯 →',
  },
  industry: {
    title: '行业资讯',
    desc: '餐饮行业趋势、供应链与消费洞察，来自后端新闻接口。',
    crumb: '行业资讯',
    other: 'corporate',
    otherLabel: '查看企业新闻 →',
  },
};

export default function NewsListPage({ type }: { type: NewsType }) {
  const meta = META[type];
  const { news, isLoading } = useNews(type);

  return (
    <>
      <Helmet>
        <title>{meta.title} | 味禾小馆</title>
        <meta name="description" content={meta.desc} />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 新闻 / {meta.crumb}
          </div>
          <h1>{meta.title}</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 640 }}>{meta.desc}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div className="state">
              <div className="spinner" />
              加载中…
            </div>
          ) : news.length === 0 ? (
            <div className="state">暂无新闻。</div>
          ) : (
            news.map((n) => <NewsCard key={n.id} news={n} />)
          )}
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Link className="btn btn-ghost" to={`/news/${meta.other}`}>
              {meta.otherLabel}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
