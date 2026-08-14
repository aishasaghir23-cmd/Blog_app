import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page-container center">
      <div className="not-found-box">
        <h2>404 - Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <Link to="/sessions" className="btn-primary">
          Back to sessions
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
