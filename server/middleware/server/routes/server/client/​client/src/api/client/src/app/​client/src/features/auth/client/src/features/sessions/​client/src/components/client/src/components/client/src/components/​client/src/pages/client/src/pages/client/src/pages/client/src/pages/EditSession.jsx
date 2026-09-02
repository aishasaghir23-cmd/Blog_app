import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { updateSession } from '../features/sessions/sessionsSlice';

const EditSession = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const session = useSelector((state) =>
    state.sessions.items.find((item) => item._id === id)
  );

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('React');
  const [hours, setHours] = useState(1);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (session) {
      setTitle(session.title);
      setTopic(session.topic);
      setHours(session.hours);
      setCompleted(session.completed || false);
    }
  }, [session]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim().length >= 3) {
      dispatch(updateSession({ id, sessionData: { title, topic, hours: Number(hours), completed } }))
        .unwrap()
        .then(() => navigate('/sessions'));
    }
  };

  if (!session) {
    return (
      <div className="page-container">
        <p>Session not found.</p>
        <button onClick={() => navigate('/sessions')} className="btn-secondary">
          Back to Sessions
        </button>
      </div>
    );
  }

  return (
    <div className="page-container center">
      <div className="edit-box">
        <h2>Edit Session</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Topic</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              <option value="React">React</option>
              <option value="Node">Node</option>
              <option value="Database">Database</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Hours</label>
            <input
              type="number"
              min="1"
              max="24"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              required
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
              />
              Completed
            </label>
          </div>
          <div className="button-group">
            <button type="submit" disabled={title.trim().length < 3} className="btn-primary">
              Save
            </button>
            <button type="button" onClick={() => navigate('/sessions')} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSession;
