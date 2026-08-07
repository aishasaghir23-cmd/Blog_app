import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api.js";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    api
      .get(`/posts/${id}`)
      .then((res) => setPost(res.data))
      .catch(() => setError("That post could not be found."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="page">
      {loading && <p>Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && post && (
        <div className="post-detail">
          <span className="post-tag">{post.tag}</span>
          <h2>{post.title}</h2>
          <p className="post-meta">
            {post.author} · {new Date(post.date).toLocaleDateString()}
          </p>
          <p className="post-body">{post.body}</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            Back
          </button>
        </div>
      )}
    </div>
  );
};

export default PostDetail;
