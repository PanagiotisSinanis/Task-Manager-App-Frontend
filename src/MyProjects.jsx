import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  ProjectOutlined,
  LogoutOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import CreateTask from './CreateTask';
import TimeTracker from './TimeTracker';
import './MyProjects.css';

const { Header, Content, Sider } = Layout;

function MyProjects({ setLoggedIn, setUser }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [timeTotals, setTimeTotals] = useState({});
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

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/my-projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });

        setProjects(res.data.projects);
        fetchAllTimeTotals(res.data.projects);
      } catch (err) {
        console.error('Error loading projects:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllTimeTotals(projects);
    }, 10000); // Refresh every 10 sec

    return () => clearInterval(interval);
  }, [projects]);

  const fetchAllTimeTotals = (projects) => {
    projects.forEach((project) => {
      axios
        .get(`http://localhost:8000/api/project/${project.id}/time-total`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        })
        .then((res) => {
          setTimeTotals((prev) => ({
            ...prev,
            [project.id]: res.data.formatted,
          }));
        })
        .catch((err) => {
          console.error(`Error loading time for project ${project.id}:`, err);
        });
    });
  };

  const goToDetails = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

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
          <h1 className="page-title" style={{ textAlign: 'center' }}>My Projects</h1>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="tracker-list">
              {projects.map((project) => (
                <div key={project.id} className="tracker-card">
                  <div className="tracker-header">
                    <div>
                      <h2>{project.name}</h2>
                      <p className="project-description">{project.description}</p>
                    </div>
                    <div className="project-time">
                      {timeTotals[project.id] || '00:00:00'}
                    </div>
                  </div>

                  <div className="tracker-controls">
                    <TimeTracker projectId={project.id} />
                  </div>

                  <div className="tracker-buttons">
                    <button
                      onClick={() => setSelectedProjectId(project.id)}
                      className="rounded-button"
                    >
                      + Add Task
                    </button>
                    <button
                      onClick={() => goToDetails(project.id)}
                      className="rounded-button"
                    >
                      View Details
                    </button>
                  </div>

                  {selectedProjectId === project.id && (
                    <CreateTask
                      projectId={project.id}
                      onClose={() => setSelectedProjectId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
}

export default MyProjects;
