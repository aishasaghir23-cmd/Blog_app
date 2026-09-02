import React from 'react';
import { Link } from 'react-router-dom';

const SessionCard = ({ session, onDelete }) => {
  const getTopicClass = (topic) => {
    switch (topic) {
      case 'React': return 'badge-react';
      case 'Node': return 'badge-node';
      case 'Database': return 'badge-database';
      default: return 'badge-other';
    }
  };

  return (
    <div className="session-card">
      <div className="session-info">
        <h3>{session.title}</h3>
        <div className="session-meta">
          <span className={`badge ${getTopicClass(session.topic)}`}>{session.topic}</span>
          <span className="meta-hours">{session.hours} hours</span>
          <span className="meta-status">{session.completed ? 'Completed' : 'Pending'}</span>
        </div>
      </div>
      <div className="session-actions">
        <Link to={`/sessions/${session._id}/edit`} className="btn-action edit">Edit</Link>
        <button onClick={() => onDelete(session._id)} className="btn-action delete">Delete</button>
      </div>
    </div>
  );
};

export default SessionCard;
