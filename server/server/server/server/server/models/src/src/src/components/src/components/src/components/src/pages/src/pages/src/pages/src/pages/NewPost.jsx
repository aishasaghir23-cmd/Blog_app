import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

const NewPost = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [tag, setTag] = useState("");
  const [summary, setSummary] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await api.post("/posts", { title, author, tag, summary, body });
      navigate("/posts");
    } catch (err) {
      setError("Could not save the post. Please check the fields and try again.");
    }
  };

  return (
    <div className="page">
      <div className="form-box">
        <h2>Add a New Post</h2>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Tag (React, Hooks, API...)"
            value={tag}
            onChange={(e) => setTag(e.target.value)}
          />
          <input
            type="text"
            placeholder="Short summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <textarea
            placeholder="Write the post..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            required
          />
          <button type="submit">Publish Post</button>
        </form>
      </div>
    </div>
  );
};

export default NewPost;
