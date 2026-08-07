import { NavLink } from "react-router-dom";

const Navbar = () => {
  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  return (
    <nav className="navbar">
      <span className="brand">DevBlog</span>
      <div className="nav-links">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/posts" className={linkClass}>
          Posts
        </NavLink>
        <NavLink to="/new" className={linkClass}>
          New Post
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
