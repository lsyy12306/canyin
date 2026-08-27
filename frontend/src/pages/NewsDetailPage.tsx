import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import useSWR from 'swr';
import PlaceholderImage from '../components/PlaceholderImage';
import Markdown from '../components/Markdown';
import { getNewsDetail } from '../api/news';
import { formatDate } from '../utils/helpers';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useSWR(slug ? `/news/${slug}` : null, () =>
    getNewsDetail(slug as string),
  );

  if (isLoading) {
    return (
      <section className="section">
        <div className="container state">
          <div className="spinner" />
          加载中…
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="section">
        <div className="container state">
          <h1>文章不存在</h1>
          <p style={{ marginTop: 12 }}>
            <Link className="btn btn-ghost" to="/news/corporate">
              返回企业新闻
            </Link>
          </p>
        </div>
      </section>
    );
  }

  const typeLabel = data.type === 'corporate' ? '企业新闻' : '行业资讯';

  return (
    <>
      <Helmet>
        <title>{data.title} | 味禾小馆</title>
        <meta name="description" content={data.summary || data.title} />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 新闻 /{' '}
            <Link to={`/news/${data.type}`}>{typeLabel}</Link> / {data.title}
          </div>
          <h1>{data.title}</h1>
          <p style={{ color: 'var(--muted)', marginTop: 8 }}>{formatDate(data.published_at)}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          {data.cover_image && (
            <PlaceholderImage
              src={data.cover_image}
              ratio="hero"
              label="新闻配图"
              alt={data.title}
              className="ph-hero"
              // 复用 hero 比例展示封面
            />
          )}
          {data.content ? (
            <Markdown content={data.content} />
          ) : (
            <p style={{ color: 'var(--muted)' }}>{data.summary}</p>
          )}
          <div style={{ marginTop: 28, borderTop: '1px solid var(--line)', paddingTop: 18 }}>
            <Link className="btn btn-ghost" to={`/news/${data.type}`}>
              ← 返回列表
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
