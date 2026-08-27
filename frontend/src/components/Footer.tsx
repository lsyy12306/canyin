import { Link } from 'react-router-dom';
import useSWR from 'swr';
import { getConfigs } from '../api/config';

export default function Footer() {
  const { data: legal } = useSWR('configs-legal', () => getConfigs('legal'));
  const { data: contact } = useSWR('configs-contact', () => getConfigs('contact'));

  const icp = legal?.icp;
  const police = legal?.police_record;

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="brand-name">味禾小馆</div>
          <p className="slogan">一口家常味，温暖千万家</p>
          <p style={{ marginTop: 14, color: '#C9C0B4', fontSize: 14 }}>
            主打新式家常粤菜的全国连锁餐饮品牌，现炒现做、食材新鲜。
          </p>
        </div>

        <div>
          <h4>联系我们</h4>
          <ul>
            <li>招商热线：{contact?.contact_phone || '400-xxx-xxxx（占位）'}</li>
            <li>品牌邮箱：{contact?.contact_email || 'brand@weihe.com（占位）'}</li>
            <li>总部：{contact?.contact_address || '广州市（占位）'}</li>
          </ul>
        </div>

        <div>
          <h4>快速链接</h4>
          <ul>
            <li>
              <Link to="/products/dishes">菜品中心</Link>
            </li>
            <li>
              <Link to="/products/stores">门店案例</Link>
            </li>
            <li>
              <Link to="/franchise/cooperation">加盟合作</Link>
            </li>
            <li>
              <Link to="/about/intro">关于味禾</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 味禾小馆 版权所有
        {icp ? ` · ${icp}` : ''}
        {police ? ` · ${police}` : ''} · <Link to="/privacy">隐私政策</Link>
      </div>
    </footer>
  );
}
