import { useState, useEffect } from "react";
import api from "../api.js";
import PostCard from "../components/PostCard.jsx";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get("/posts")
      .then((res) => setPosts(res.data))
      .catch(() => setError("Could not load posts. Is the server running on port 3000?"))
      .finally(() => setLoading(false));
  }, [refresh]);

  const handleRefresh = () => {
    setRefresh((prev) => prev + 1);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Posts</h2>
        <button onClick={handleRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && (
        <div className="posts-grid">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Posts;
