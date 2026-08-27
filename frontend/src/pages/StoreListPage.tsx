import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader';
import StoreCard from '../components/StoreCard';
import { useStores } from '../hooks/useStores';

export default function StoreListPage() {
  const { stores, isLoading } = useStores();

  return (
    <>
      <Helmet>
        <title>门店案例展示 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆门店案例展示——全国十余城 85 家直营门店的空间与运营实景。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 产品 / 门店案例展示
          </div>
          <h1>门店案例展示</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 640 }}>
            从社区小店到商圈旗舰，味禾小馆把“家”的味道开进了不同城市。以下门店图片来自后端接口。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {isLoading ? (
            <div className="state">
              <div className="spinner" />
              加载中…
            </div>
          ) : stores.length === 0 ? (
            <div className="state">暂无门店数据。</div>
          ) : (
            <div className="grid grid-3">
              {stores.map((s) => (
                <StoreCard key={s.id} store={s} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
