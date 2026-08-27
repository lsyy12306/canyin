import { Layout, Menu, Button, Space, Avatar, Popconfirm, Typography } from 'antd';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ShopOutlined,
  FileTextOutlined,
  SolutionOutlined,
  ContactsOutlined,
  IdcardOutlined,
  MessageOutlined,
  SettingOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { getCurrentUser, clearToken } from '../store/auth';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: '/', icon: <DashboardOutlined />, label: '仪表盘' },
  { key: '/dishes', icon: <DatabaseOutlined />, label: '菜品管理' },
  { key: '/stores', icon: <ShopOutlined />, label: '门店管理' },
  { key: '/news', icon: <FileTextOutlined />, label: '新闻管理' },
  { key: '/jobs', icon: <SolutionOutlined />, label: '岗位管理' },
  { key: '/inquiries', icon: <ContactsOutlined />, label: '加盟意向' },
  { key: '/applications', icon: <IdcardOutlined />, label: '简历投递' },
  { key: '/messages', icon: <MessageOutlined />, label: '在线留言' },
  { key: '/reservations', icon: <CalendarOutlined />, label: '预约管理' },
  { key: '/configs', icon: <SettingOutlined />, label: '站点配置' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getCurrentUser();

  const handleLogout = () => {
    clearToken();
    navigate('/login', { replace: true });
  };

  // 选中态：首页精确匹配，其余取路径前缀
  const selectedKey =
    location.pathname === '/'
      ? '/'
      : (menuItems.find((m) => m.key !== '/' && location.pathname.startsWith(m.key))?.key ?? '/');

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={0} theme="light" width={216}>
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 18,
            color: '#C8482E',
            letterSpacing: 2,
          }}
        >
          味禾小馆
        </div>
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingInline: 24,
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <Space size="middle">
            <Avatar style={{ backgroundColor: '#C8482E' }}>
              {user?.username?.[0]?.toUpperCase() ?? 'A'}
            </Avatar>
            <Typography.Text>{user?.username ?? '管理员'}</Typography.Text>
            <Popconfirm title="确认退出登录？" onConfirm={handleLogout} okText="退出" cancelText="取消">
              <Button>退出</Button>
            </Popconfirm>
          </Space>
        </Header>
        <Content style={{ margin: 24, padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
