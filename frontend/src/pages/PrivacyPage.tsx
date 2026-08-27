import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import Markdown from '../components/Markdown';
import { getConfigs } from '../api/config';

export default function PrivacyPage() {
  const { data: legal } = useSWR('configs-legal', () => getConfigs('legal'));
  const content = legal?.privacy_policy;

  return (
    <>
      <Helmet>
        <title>隐私政策 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆隐私政策——说明我们如何收集、使用与保护您的个人信息。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 隐私政策
          </div>
          <h1>隐私政策</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 680 }}>
            最后更新：2026-08-26（草稿，待法务审核后正式生效）
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          {content ? (
            <Markdown content={content} />
          ) : (
            <div className="state">隐私政策内容待配置（site_configs.privacy_policy）。</div>
          )}
          <p
            style={{
              color: 'var(--muted)',
              fontSize: 13,
              marginTop: 28,
              borderTop: '1px solid var(--line)',
              paddingTop: 16,
            }}
          >
            * 本页为隐私政策草稿，正式发布前须经法务或专业人员审核，并随实际表单方案与统计工具调整。
          </p>
        </div>
      </section>
    </>
  );
}
