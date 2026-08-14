import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSessions, addSession, deleteSession } from '../features/sessions/sessionsSlice';
import SessionCard from '../components/SessionCard';

const Sessions = () => {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.sessions);

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('React');
  const [hours, setHours] = useState(1);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchSessions());
    }
  }, [status, dispatch]);

  const handleAddSession = (e) => {
    e.preventDefault();
    if (title.trim().length >= 3) {
      dispatch(addSession({ title, topic, hours: Number(hours) }));
      setTitle('');
      setTopic('React');
      setHours(1);
    }
  };

  const handleDelete = (id) => {
    dispatch(deleteSession(id));
  };

  const isFormValid = title.trim().length >= 3;

  return (
    <div className="page-container">
      <h2>My Sessions</h2>

      <form onSubmit={handleAddSession} className="inline-form">
        <input
          type="text"
          placeholder="Session Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={topic} onChange={(e) => setTopic(e.target.value)}>
          <option value="React">React</option>
          <option value="Node">Node</option>
          <option value="Database">Database</option>
          <option value="Other">Other</option>
        </select>
        <input
          type="number"
          min="1"
          max="24"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />
        <button type="submit" disabled={!isFormValid} className="btn-primary">
          Add
        </button>
      </form>

      {status === 'loading' && <p className="loading-text">Loading...</p>}
      {status === 'failed' && <p className="error-message">{error}</p>}

      {status === 'succeeded' && (
        <div className="sessions-list">
          {items.map((session) => (
            <SessionCard key={session._id} session={session} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Sessions;
