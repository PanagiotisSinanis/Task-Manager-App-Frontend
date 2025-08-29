import { Layout, Menu } from 'antd';
import {
  ProjectOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet } from 'react-router-dom';
import { useEffect } from 'react';

const { Header, Sider, Content } = Layout;

function SuperAdminDashboard({ setLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    navigate('/login');
  };

  useEffect(() => {
    navigate('/superadmin/dashboard/overview');
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item
            key="1"
            icon={<DashboardOutlined />}
            onClick={() => navigate('/superadmin/dashboard/overview')}
          >
            Overview
          </Menu.Item>
          <Menu.Item
            key="2"
            icon={<ProjectOutlined />}
            onClick={() => navigate('/projects')}
          >
            Projects
          </Menu.Item>
          <Menu.Item
            key="3"
            icon={<UserOutlined />}
            onClick={() => navigate('/users')}
          >
            Users
          </Menu.Item>
          <Menu.Item key="4" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', paddingLeft: '1rem' }}>
          <h2>Super Admin Dashboard</h2>
        </Header>
        <Content style={{ margin: '16px' }}>
          <Outlet /> {/* Renders nested routes here */}
        </Content>
      </Layout>
    </Layout>
  );
}

export default SuperAdminDashboard;
