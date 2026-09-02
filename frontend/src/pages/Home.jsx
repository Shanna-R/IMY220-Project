import { useState } from 'react';
import Header from '../components/Header';
import Feed from '../components/Feed';
import SearchInput from '../components/SearchInput';
import { Link } from 'react-router-dom';
import '../index.css';

const localPosts = [
  {
    id: 1,
    authorName: 'Leara Gangadin',
    troop: 'Troop 17',
    timeAgo: '2 hours ago',
    title: 'Mountain Hike',
    description: 'Amazing hike with the troop this weekend!',
    likes: 32,
    comments: 4,
    hashtags: ['#Hiking', '#Adventure']
  },
  {
    id: 2,
    authorName: 'Jemma Smith',
    troop: '8th Pretoria',
    timeAgo: '5 hours ago',
    title: 'Campfire Evening',
    description: 'Great memories around the campfire.',
    likes: 18,
    comments: 2,
    hashtags: ['#Camping', '#Campfire']
  }
];

const globalPosts = [
  {
    id: 3,
    authorName: 'Alex Brown',
    troop: 'Cape Town Scouts',
    timeAgo: 'Yesterday',
    title: 'Coastal Adventure',
    description: 'Exploring the coast with our troop.',
    likes: 45,
    comments: 9,
    hashtags: ['#Adventure', '#Scouts']
  },
  {
    id: 4,
    authorName: 'Sam Jones',
    troop: 'Durban Scouts',
    timeAgo: 'Yesterday',
    title: 'Pioneering Tower',
    description: 'Our troop completed a huge pioneering project.',
    likes: 51,
    comments: 11,
    hashtags: ['#Pioneering', '#Scouting']
  }
];

function Home() {
  const [feedType, setFeedType] = useState('local');

  const posts =
    feedType === 'local'
      ? localPosts
      : globalPosts;

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

          <Feed posts={posts} />

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