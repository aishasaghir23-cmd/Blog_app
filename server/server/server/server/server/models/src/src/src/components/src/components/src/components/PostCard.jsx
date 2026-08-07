import { Link } from "react-router-dom";

const PostCard = ({ post }) => {
  return (
    <div className="post-card">
      <span className="post-tag">{post.tag}</span>
      <h3>{post.title}</h3>
      <p className="post-meta">
        {post.author} · {new Date(post.date).toLocaleDateString()}
      </p>
      <p className="post-summary">{post.summary}</p>
      <Link to={`/posts/${post._id}`} className="read-more-btn">
        Read more
      </Link>
    </div>
  );
};

export default PostCard;
