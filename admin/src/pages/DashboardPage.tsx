import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography, Spin, Space } from 'antd';
import {
  DatabaseOutlined,
  ShopOutlined,
  FileTextOutlined,
  SolutionOutlined,
  ContactsOutlined,
  IdcardOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { getDishes } from '../api/dishes';
import { getStores } from '../api/stores';
import { getNews } from '../api/news';
import { getJobs } from '../api/jobs';
import { getInquiries } from '../api/inquiries';
import { getApplications } from '../api/applications';
import { getMessages } from '../api/messages';
import { normalizeList } from '../utils/helpers';
import type { ListData } from '../types';

interface CardMeta {
  title: string;
  to: string;
  icon: React.ReactNode;
  color: string;
}

const cards: CardMeta[] = [
  { title: '菜品', to: '/dishes', icon: <DatabaseOutlined />, color: '#C8482E' },
  { title: '门店', to: '/stores', icon: <ShopOutlined />, color: '#E0A23B' },
  { title: '新闻', to: '/news', icon: <FileTextOutlined />, color: '#6E8B5B' },
  { title: '岗位', to: '/jobs', icon: <SolutionOutlined />, color: '#3B7FE0' },
  { title: '加盟意向', to: '/inquiries', icon: <ContactsOutlined />, color: '#9B59B6' },
  { title: '简历投递', to: '/applications', icon: <IdcardOutlined />, color: '#16A085' },
  { title: '在线留言', to: '/messages', icon: <MessageOutlined />, color: '#D35400' },
];

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    Promise.allSettled([
      getDishes(),
      getStores(),
      getNews(),
      getJobs(),
      getInquiries(),
      getApplications(),
      getMessages(),
    ]).then(([d, s, n, j, i, a, m]) => {
      const pick = (r: PromiseSettledResult<unknown>) =>
        r.status === 'fulfilled' ? normalizeList(r.value as ListData<unknown>).length : 0;
      setCounts({
        dishes: pick(d),
        stores: pick(s),
        news: pick(n),
        jobs: pick(j),
        inquiries: pick(i),
        applications: pick(a),
        messages: pick(m),
      });
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <Typography.Title level={3} style={{ marginTop: 0 }}>
        欢迎使用味禾小馆内容管理后台
      </Typography.Title>
      <Typography.Paragraph type="secondary">
        在这里维护菜品、门店、新闻、岗位，并处理加盟意向、简历投递与在线留言。
      </Typography.Paragraph>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 64 }}>
          <Spin />
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          {cards.map((c) => (
            <Col xs={12} sm={8} md={6} lg={6} key={c.to}>
              <Link to={c.to}>
                <Card hoverable>
                  <Statistic
                    title={c.title}
                    value={counts[c.to.replace('/', '')] ?? 0}
                    prefix={<span style={{ color: c.color, marginRight: 8 }}>{c.icon}</span>}
                  />
                </Card>
              </Link>
            </Col>
          ))}
          <Col xs={12} sm={8} md={6} lg={6}>
            <Link to="/configs">
              <Card hoverable>
                <Space>
                  <span style={{ color: '#888' }}>
                    <FileTextOutlined />
                  </span>
                  <span>站点配置</span>
                </Space>
              </Card>
            </Link>
          </Col>
        </Row>
      )}
    </div>
  );
}
