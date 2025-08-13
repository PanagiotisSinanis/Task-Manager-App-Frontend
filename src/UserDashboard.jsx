import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import QuickEntryBar from './QuickEntryBar';


const { Header, Content, Sider } = Layout;

const UserDashboard = ({ setLoggedIn, setUser }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/my-projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });
        const data = await res.json();
        setProjects(data.projects || []);
      } catch (err) {
        console.error('Error fetching projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div className="logo" style={{ color: 'white', padding: '16px' }}>
          User Panel
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: 0 }} />
        <Content style={{ margin: '16px' }}>
          <h1>User Dashboard</h1>
          <p>Welcome!</p>
          <QuickEntryBar projects={projects} />
          <h2>Assigned Projects:</h2>
          {loading ? (
            <p>Loading...</p>
          ) : projects.length > 0 ? (
            <ul>
              {projects.map((project) => (
                <li key={project.id}>
                  <strong>{project.name}</strong>
                  <p>{project.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No projects assigned to you.</p>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default UserDashboard;
