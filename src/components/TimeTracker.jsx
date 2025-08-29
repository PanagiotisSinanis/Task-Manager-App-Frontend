import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './TimeTracker.css';

function TimeTracker({ projectId }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef(null);

  const localKey = `timeTracker_${projectId}`;

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const formatDateForMySQL = (isoString) => {
    return isoString.replace('T', ' ').substring(0, 19);
  };

  const saveStateToLocal = (state) => {
    localStorage.setItem(localKey, JSON.stringify(state));
  };

  const clearStateFromLocal = () => {
    localStorage.removeItem(localKey);
  };

  const handleStart = () => {
    const now = Date.now();
    setIsRunning(true);
    setStartTime(now);
    saveStateToLocal({ isRunning: true, startTime: now });

    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
  };

  const handleStop = async () => {
    setIsRunning(false);
    clearInterval(timerRef.current);
    clearStateFromLocal();

    const totalSeconds = Math.floor((Date.now() - startTime) / 1000);

    try {
      await axios.post('http://localhost:8000/api/time/stop', {
        project_id: projectId,
        duration: totalSeconds,
        start_time: formatDateForMySQL(new Date(startTime).toISOString()),
        end_time: formatDateForMySQL(new Date().toISOString()),
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('apiToken')}`,
        },
      });

      alert('Time entry saved!');
    } catch (err) {
      console.error('Error saving time entry:', err.response?.data);
      alert('Failed to save time entry');
    }

    setElapsedTime(0);
    setStartTime(null);
  };

  // On mount: restore previous session if any
  useEffect(() => {
    const saved = localStorage.getItem(localKey);
    if (saved) {
      const { isRunning: savedRunning, startTime: savedStart } = JSON.parse(saved);
      if (savedRunning && savedStart) {
        const now = Date.now();
        const elapsed = Math.floor((now - savedStart) / 1000);

        setIsRunning(true);
        setStartTime(savedStart);
        setElapsedTime(elapsed);

        timerRef.current = setInterval(() => {
          setElapsedTime((prev) => prev + 1);
        }, 1000);
      }
    }

    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div className="time-tracker">
      <h3>Time Tracking</h3>
      <h2>{formatTime(elapsedTime)}</h2>
      {isRunning ? (
        <button onClick={handleStop} className="stop-btn">Stop</button>
      ) : (
        <button onClick={handleStart} className="start-btn">Start</button>
      )}
    </div>
  );
}

export default TimeTracker;
