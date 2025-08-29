import React, { useEffect, useState } from 'react';
import { List, Typography, Button, Tag, Space } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Text } = Typography;

const RecentEntries = () => {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const res = await axios.get('http://localhost:8000/api/time/entries', {
          headers: { Authorization: `Bearer ${localStorage.getItem('apiToken')}` },
        });
        setEntries(res.data);
      } catch (err) {
        console.error('Failed to fetch entries:', err);
      }
    };
    fetchEntries();
  }, []);

  const formatTime = (timeStr) => dayjs(timeStr).format('HH:mm');
  const formatDuration = (start, end) => {
    const diff = dayjs(end).diff(dayjs(start), 'second');
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleResume = async (entry) => {
    try {
      await axios.post('http://localhost:8000/api/time/start', {
        project_id: entry.project.id,
        task_id: entry.task?.id,
        description: entry.description,
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('apiToken')}` },
      });
      window.location.reload(); // ή κάνε refetch αν θες πιο "καθαρή" λύση
    } catch (err) {
      console.error('Resume failed:', err);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #eee' }}>
      <Text strong style={{ fontSize: 16 }}>Recent Time Entries</Text>
      <List
        itemLayout="horizontal"
        dataSource={entries}
        renderItem={entry => (
          <List.Item
            actions={[
              <Button
                icon={<PlayCircleOutlined />}
                onClick={() => handleResume(entry)}
                type="text"
                key="resume"
              />
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{entry.description || 'No description'}</Text>
                  {entry.project && <Tag color="blue">{entry.project.name}</Tag>}
                  {entry.task && <Tag>{entry.task.title}</Tag>}
                </Space>
              }
              description={
                <Text type="secondary">
                  {formatTime(entry.start_time)} - {formatTime(entry.end_time)} | Duration: {formatDuration(entry.start_time, entry.end_time)}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );
};

export default RecentEntries;
