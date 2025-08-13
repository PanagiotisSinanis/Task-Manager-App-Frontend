import React, { useEffect, useState, useRef } from 'react';
import { Button, Select, Input } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

const { Option } = Select;

const QuickEntryBar = ({ onStopped }) => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [description, setDescription] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode] = useState('standard');

  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('quickEntry')) || {};
    if (savedData.description) setDescription(savedData.description);
    if (savedData.selectedProject) setSelectedProject(savedData.selectedProject);
    if (savedData.selectedTask) setSelectedTask(savedData.selectedTask);
  }, []);

  useEffect(() => {
    const quickEntryData = {
      description,
      selectedProject,
      selectedTask,
    };
    localStorage.setItem('quickEntry', JSON.stringify(quickEntryData));
  }, [description, selectedProject, selectedTask]);

  useEffect(() => {
    const fetchActiveEntry = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/time/active', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });

        if (res.data.active && res.data.entry?.start_time) {
          const startedAt = dayjs.utc(res.data.entry.start_time);
          const now = dayjs.utc();
          const diff = now.diff(startedAt, 'second');

          setStartTime(startedAt.toDate());
          setElapsed(diff);
          setIsRunning(true);
          setSelectedProject(res.data.entry.project_id || null);
          setSelectedTask(res.data.entry.task_id || null);
          setDescription(res.data.entry.description || '');

          clearInterval(intervalRef.current);
          intervalRef.current = setInterval(() => {
            setElapsed(prev => prev + 1);
          }, 1000);
        } else {
          resetTimerState();
        }
      } catch (err) {
        console.error('Failed to fetch active timer:', err);
      }
    };

    fetchActiveEntry();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/my-projects', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!selectedProject) {
        setTasks([]);
        setSelectedTask(null);
        return;
      }

      try {
        const res = await axios.get(`http://localhost:8000/api/projects/${selectedProject}/tasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
          },
        });

        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error('Failed to load tasks:', err);
        setTasks([]);
        setSelectedTask(null);
      }
    };

    fetchTasks();
  }, [selectedProject]);

  const resetTimerState = () => {
    setIsRunning(false);
    setElapsed(0);
    setStartTime(null);
    setSelectedProject(null);
    setSelectedTask(null);
    setDescription('');
    setMode('standard');
    clearInterval(intervalRef.current);
    localStorage.removeItem('quickEntry');
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);

    if (!selectedTask && value.trim()) {
      setMode('quick');
    } else {
      setMode('standard');
    }
  };

  const handleStart = async () => {
    if (!selectedProject) {
      alert('Please select a project before starting');
      return;
    }

    try {
      await axios.post('http://localhost:8000/api/time/start', {
        project_id: selectedProject,
        task_id: selectedTask,
        description,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
        },
      });

      const now = new Date();
      setStartTime(now);
      setIsRunning(true);
      setElapsed(0);
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting time entry:', err.response?.data);
      alert('Failed to start timer');
    }
  };

  const handleQuickStart = async () => {
  if (!selectedProject || !description.trim()) return;

  try {
    const res = await axios.post(`http://localhost:8000/api/tasks`, {
      title: description.trim(),
      description: '-',
      deadline: dayjs().add(1, 'year').format('YYYY-MM-DD'),
      project_id: selectedProject,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
      },
    });

    const newTask = res.data.task;
    setSelectedTask(newTask.id);

    // ✅ Ειδοποίησε τον UserLayout να φέρει ξανά tasks
    if (onTaskCreated) onTaskCreated();

    await axios.post('http://localhost:8000/api/time/start', {
      project_id: selectedProject,
      task_id: newTask.id,
      description,
    }, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
      },
    });

    const now = new Date();
    setStartTime(now);
    setIsRunning(true);
    setElapsed(0);
    setMode('standard');

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
  } catch (err) {
    console.error('Quick start error:', err);
    alert('Failed to create and start task');
  }
};


  const handleStop = async () => {
    if (!startTime || !selectedProject) return;

    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000);

    try {
      await axios.post('http://localhost:8000/api/time/stop', {
        project_id: selectedProject,
        task_id: selectedTask,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
        },
      });

      resetTimerState();
      if (onStopped) onStopped();
    } catch (err) {
      console.error('Stop error:', err);
      alert('Failed to stop timer');
    }
  };

  const formatElapsed = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #d9d9d9',
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
      marginBottom: '24px'
    }}>
      <Input
        placeholder="What are you working on?"
        value={description}
        onChange={handleDescriptionChange}
        style={{ flex: 1, minWidth: 180 }}
      />

      <Select
        placeholder="Project"
        value={selectedProject}
        onChange={(v) => setSelectedProject(v)}
        style={{ width: 160 }}
        allowClear
      >
        {projects.map(p => (
          <Option key={p.id} value={p.id}>{p.name}</Option>
        ))}
      </Select>

      {mode === 'standard' && tasks.length > 0 && (
        <Select
          placeholder="Task"
          value={selectedTask}
          onChange={(v) => setSelectedTask(v)}
          style={{ width: 160 }}
          allowClear
        >
          {tasks.map(t => (
            <Option key={t.id} value={t.id}>{t.title}</Option>
          ))}
        </Select>
      )}

      <span style={{ width: 100, textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
        {isRunning ? formatElapsed(elapsed) : '00:00:00'}
      </span>

      {isRunning ? (
        <Button danger onClick={handleStop} style={{ borderRadius: 6 }}>Stop</Button>
      ) : mode === 'quick' && selectedProject ? (
        <Button type="primary" onClick={handleQuickStart} style={{ borderRadius: 6 }}>
          Create & Start
        </Button>
      ) : (
        <Button type="primary" onClick={handleStart} disabled={!selectedProject} style={{ borderRadius: 6 }}>
          Start
        </Button>
      )}
    </div>
  );
};

export default QuickEntryBar;
