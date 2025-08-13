import { useState } from 'react';
import axios from 'axios';

function CreateTask({ projectId, onClose }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: ''
  });
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('apiToken');

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/tasks', {
        ...form,
        project_id: projectId
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      setMessage('Task created successfully!');
      setForm({ title: '', description: '', deadline: '' });

      // Προαιρετικό delay πριν το κλείσιμο
      setTimeout(() => {
        onClose();
      }, 1000);

    } catch (err) {
      console.error(err);
      setMessage('Failed to create task.');
    }
  };

  return (
    <div style={{ padding: 10, border: '1px solid #ccc', marginTop: 10 }}>
      <h4>Create Task for Project #{projectId}</h4>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} required />
        </div>
        <div>
          <label>Description:</label>
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </div>
        <div>
          <label>Deadline:</label>
          <input type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
        </div>
        <button type="submit">Create Task</button>
        <button type="button" onClick={onClose} style={{ marginLeft: 10 }}>Cancel</button>
      </form>
    </div>
  );
}

export default CreateTask;
