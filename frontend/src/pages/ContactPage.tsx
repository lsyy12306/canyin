import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import useSWR from 'swr';
import ContactForm from '../components/ContactForm';
import { getConfigs } from '../api/config';

export default function ContactPage() {
  const { data: contact } = useSWR('configs-contact', () => getConfigs('contact'));

  return (
    <>
      <Helmet>
        <title>联系我们 | 味禾小馆</title>
        <meta
          name="description"
          content="味禾小馆联系我们——招商合作、媒体与顾客反馈的联系方式。"
        />
      </Helmet>

      <section className="page-hero">
        <div className="container">
          <div className="crumb">
            <Link to="/">首页</Link> / 关于我们 / 联系我们
          </div>
          <h1>联系我们</h1>
          <p style={{ color: 'var(--muted)', maxWidth: 680 }}>
            无论是加盟咨询、媒体合作还是顾客反馈，都欢迎与我们联系。
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-2">
            <div>
              <div className="card" style={{ marginBottom: 18 }}>
                <h3>招商加盟</h3>
                <p>
                  招商热线：{contact?.contact_phone || '400-xxx-xxxx（占位）'}
                  <br />
                  邮箱：{contact?.franchise_email || 'franchise@weihe.com（占位）'}
                </p>
              </div>
              <div className="card" style={{ marginBottom: 18 }}>
                <h3>品牌 / 媒体</h3>
                <p>邮箱：{contact?.contact_email || 'brand@weihe.com（占位）'}</p>
              </div>
              <div className="card">
                <h3>总部地址</h3>
                <p>{contact?.contact_address || '广东省广州市（占位，待补充详细地址）'}</p>
              </div>
            </div>

            <div className="card">
              <ContactForm defaultType="cooperation" showTypeSelect title="在线留言" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
