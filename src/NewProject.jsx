import React, { useState, useEffect } from 'react';
import { Layout, Menu, Form, Input, Select, Button, Typography } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Header, Content, Sider } = Layout;
const { TextArea } = Input;
const { Title } = Typography;

const getToken = () => localStorage.getItem('apiToken');
const getUserId = () => localStorage.getItem('userId');
const getUserRole = () => localStorage.getItem('userRole');

function NewProject({ setLoggedIn, setUser }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const navigate = useNavigate();
  const role = getUserRole();

  useEffect(() => {
    axios
      .get('http://localhost:8000/api/users', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      .then((res) => setAllUsers(res.data.users || []))
      .catch((err) => console.error('Error fetching users:', err));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:8000/api/projects',
        {
          name,
          description,
          user_ids: selectedUsers,
        },
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      alert('Project created successfully');
      navigate(role === 'superadmin' ? '/superadmin/dashboard' : '/user/dashboard');
    } catch (err) {
      console.error('Project creation error:', err);
      alert('Error creating project');
    }
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
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['3']} items={menuItems} />
      </Sider>

      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '24px 16px', padding: 24, background: '#f0f2f5' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <Title level={2} style={{ textAlign: 'center' }}>
              Create New Project
            </Title>

            <Form layout="vertical" onFinish={handleSubmit}>
              <Form.Item label="Project Name" required>
                <Input
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Item>

              <Form.Item label="Description">
                <TextArea
                  rows={4}
                  placeholder="Enter project description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Form.Item>

              <Form.Item label="Assign Users">
                <Select
                  mode="multiple"
                  placeholder="Select users"
                  value={selectedUsers}
                  onChange={(val) => setSelectedUsers(val)}
                >
                  {allUsers.map((user) => (
                    <Select.Option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit" style={{ marginRight: 12 }}>
                  Create
                </Button>
                <Button
                  onClick={() =>
                    navigate(role === 'superadmin' ? '/superadmin/dashboard' : '/user/dashboard')
                  }
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

export default NewProject;
