import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card } from 'antd';
import {
  UserOutlined,
  ProjectOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import QuickEntryBar from '../components/QuickEntryBar';
import TaskList from '../components/TaskList';

const { Header, Content, Sider } = Layout;

const UserLayout = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/time/entries', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
        },
      });
      setTasks(res.data.entries || []);
    } catch (err) {
      console.error('Failed to fetch time entries:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ color: 'white', padding: '16px' }}>
          User Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['dashboard']}
          items={[
            {
              key: 'dashboard',
              icon: <UserOutlined />,
              label: 'Dashboard',
              onClick: () => navigate('/user/dashboard'),
            },
            {
              key: 'projects',
              icon: <ProjectOutlined />,
              label: 'My Projects',
              onClick: () => navigate('/my-projects'),
            },
            {
              key: 'create-project',
              icon: <PlusOutlined />,
              label: 'Create Project',
              onClick: () => navigate('/projects/new'),
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          <Card style={{ marginBottom: 24 }}>
            <QuickEntryBar onStopped={fetchTasks} />
          </Card>

          <TaskList tasks={tasks} onRefresh={fetchTasks} />

          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserLayout;
