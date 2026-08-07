import { useState } from "react";
import { Link } from "react-router-dom";
import Counter from "../components/Counter.jsx";

const Home = () => {
  const [count, setCount] = useState(0);

  const handleIncrease = () => {
    setCount((prev) => prev + 1);
  };

  return (
    <div className="page">
      <div className="hero">
        <h1>DevBlog</h1>
        <p>A small blog built with React, Vite, React Router, useEffect and axios.</p>
        <Link to="/posts" className="cta-btn">
          Read the posts
        </Link>
      </div>

      <div className="home-grid">
        <Counter count={count} onIncrease={handleIncrease} />

        <div className="info-box">
          <h3>What this project uses</h3>
          <ul>
            <li>React + Vite</li>
            <li>React Router (5 routes + 404)</li>
            <li>useEffect with a dependency array</li>
            <li>axios talking to an Express API</li>
            <li>Loading, error and refresh states</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Home;
