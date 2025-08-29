import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Card } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

function ProjectList({ projects, setLoggedIn, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const menuItems = [
    {
      key: '1',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/user/dashboard'),
    },
    {
      key: '2',
      icon: <ProjectOutlined />,
      label: 'My Projects',
      onClick: () => navigate('/my-projects'),
    },
    {
      key: '3',
      icon: <PlusOutlined />,
      label: 'Create Project',
      onClick: () => navigate('/projects/new'),
    },
    {
      key: '4',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ color: 'white', padding: '16px' }}>
          User Panel
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['2']} items={menuItems} />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Project List</h1>

          {projects.map((project) => (
            <Card
              key={project.id}
              title={project.name}
              style={{ marginBottom: '16px', borderRadius: '10px' }}
              extra={
                <Button type="primary" onClick={() => navigate(`/projects/${project.id}`)}>
                  Details
                </Button>
              }
            >
              <p>{project.description || 'No description provided.'}</p>
            </Card>
          ))}
        </Content>
      </Layout>
    </Layout>
  );
}

export default ProjectList;
