import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Posts from "./pages/Posts.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import NewPost from "./pages/NewPost.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

const App = () => {
  return (
    <div className="app">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/posts/:id" element={<PostDetail />} />
          <Route path="/new" element={<NewPost />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>Week 5 Blog Project · Hayatian Computing Society · University of Gujrat</p>
      </footer>
    </div>
  );
};

export default App;
