import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TimeTracker from './TimeTracker';

function ProjectDetails({ projectId }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(`http://localhost:8000/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('apiToken')}` }
        });
        setProject(res.data.project);
        setTasks(res.data.tasks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [projectId]);

  const handleNewTask = (newTask) => {
    setTasks(prev => [...prev, newTask]);  
  };

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <div>
      <h2>{project.name}</h2>
      <p>{project.description}</p>

      <h3>Tasks:</h3>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title} — {task.status}</li>
        ))}
      </ul>
      <h1>{project.name}</h1>
      <p>{project.description}</p>

      <TimeTracker projectId={project.id} />
    </div>
    
  );
}

export default ProjectDetails;
