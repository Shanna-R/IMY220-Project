import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Feed from '../components/Feed';
import SearchInput from '../components/SearchInput';
import { Link } from 'react-router-dom';
import '../index.css';

function Home() {
  const [feedType, setFeedType] = useState('local');
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch('/api/posts')
      .then(response => response.json())
      .then(data => {
        setPosts(data.posts);
      })
      .catch(error => {
        console.error('Error loading posts:', error);
      });
  }, []);

  return (
    <div>
      <Header />

      <main className="home-layout">

        <aside className="home-sidebar home-left-sidebar">

          <div className="card sidebar-card">
            <div className="large-avatar">
              👤
            </div>

            <h3>Shanna Reinecke</h3>
            <p>First Class Scout</p>

            <Link
              to="/profile/1"
              className="btn btn-outline"
            >
              View Profile
            </Link>
          </div>

          <div className="card sidebar-card">
            <h3>My Albums</h3>
            <p>Summer Camp 2025</p>
            <p>Winter Camp 2026</p>
            <p>Hiking Adventures</p>
          </div>

          <div className="card sidebar-card">
            <h3>Badges</h3>
            <p>🏅 First Aid</p>
            <p>🏅 Hiking</p>
            <p>🏅 Camping</p>
          </div>

        </aside>

        <section className="home-main">

          <div className="home-heading">
            <h1>Home</h1>

            <Link
              to="/create-post"
              className="btn btn-primary"
            >
              New Post +
            </Link>
          </div>

          <SearchInput
            placeholder="Search posts, people, hashtags..."
          />

          <div className="feed-tabs">

            <button
              className={feedType === 'local' ? 'active' : ''}
              onClick={() => setFeedType('local')}
            >
              Local
            </button>

            <button
              className={feedType === 'global' ? 'active' : ''}
              onClick={() => setFeedType('global')}
            >
              Global
            </button>

          </div>

          {posts.length === 0 ? (
            <p>Loading posts...</p>
          ) : (
            <Feed posts={posts} />
          )}

        </section>

        <aside className="home-sidebar home-right-sidebar">

          <div className="card sidebar-card">
            <h3>Upcoming Events</h3>

            <p>📅 Field Day</p>
            <p>📅 JOTA-JOTI</p>
            <p>📅 Summer Camp</p>
          </div>

          <div className="card sidebar-card">
            <h3>Suggested Friends</h3>

            <p>Jemma Smith</p>
            <p>Alex Brown</p>
            <p>Sam Jones</p>

            <Link to="/friends">
              View Friends
            </Link>
          </div>

          <div className="card sidebar-card">
            <h3>Trending</h3>

            <p>#Camping</p>
            <p>#Hiking</p>
            <p>#Campfire</p>
            <p>#Adventure</p>
          </div>

        </aside>

      </main>
    </div>
  );
}

export default Home;