import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';
import Feed from '../components/Feed';
import SearchInput from '../components/SearchInput';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  const [scope, setScope] = useState('local');
  const [sort, setSort] = useState('newest');

  const [activities, setActivities] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [friends, setFriends] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sidebarLoading, setSidebarLoading] = useState(true);
  const [error, setError] = useState('');

  // Load the activity feed from the API
  async function loadFeed() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/feed?scope=${scope}&sort=${sort}`,
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not load feed.');
      }

      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error loading feed:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  // Load data used by the sidebars
  async function loadSidebarData() {
    try {
      setSidebarLoading(true);

      const [albumsResponse, friendsResponse, usersResponse] =
        await Promise.all([
          fetch('/api/albums', {
            credentials: 'include'
          }),

          fetch('/api/friends', {
            credentials: 'include'
          }),

          fetch('/api/users', {
            credentials: 'include'
          })
        ]);

      const albumsData = await albumsResponse.json();
      const friendsData = await friendsResponse.json();
      const usersData = await usersResponse.json();

      if (!albumsResponse.ok) {
        throw new Error(
          albumsData.error || 'Could not load albums.'
        );
      }

      if (!friendsResponse.ok) {
        throw new Error(
          friendsData.error || 'Could not load friends.'
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          usersData.error || 'Could not load users.'
        );
      }

      setAlbums(albumsData.albums || []);
      setFriends(friendsData.friends || []);
      setUsers(usersData.users || []);
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setSidebarLoading(false);
    }
  }

  useEffect(() => {
    loadFeed();
  }, [scope, sort]);

  useEffect(() => {
    loadSidebarData();
  }, []);

  // Find albums belonging to the logged-in user
  const myAlbums = albums
    .filter((album) => album.ownerId === user?._id)
    .slice(0, 3);

  // Find users who are not already friends
  const suggestedFriends = useMemo(() => {
    const friendIds = new Set(
      friends.map((friend) => friend._id)
    );

    return users
      .filter((otherUser) => {
        return (
          otherUser._id !== user?._id &&
          !friendIds.has(otherUser._id)
        );
      })
      .slice(0, 3);
  }, [users, friends, user]);

  // Calculate trending hashtags from the API feed
  const trendingHashtags = useMemo(() => {
    const hashtagCounts = {};

    activities.forEach((activity) => {
      if (!activity.hashtags) {
        return;
      }

      activity.hashtags.forEach((hashtag) => {
        const cleanHashtag = hashtag
          .toString()
          .replace('#', '')
          .toLowerCase();

        if (!cleanHashtag) {
          return;
        }

        if (!hashtagCounts[cleanHashtag]) {
          hashtagCounts[cleanHashtag] = 0;
        }

        hashtagCounts[cleanHashtag]++;
      });
    });

    return Object.entries(hashtagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [activities]);

  return (
    <div>
      <Header />

      <main className="home-layout">

        {/* =========================
            LEFT SIDEBAR
        ========================== */}
        <aside className="home-sidebar home-left-sidebar">

          {/* Current user */}
          <div className="card sidebar-card">

            <div className="user-summary">
              <div className="user-summary-photo">

                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className="avatar-medium"
                  />
                ) : (
                  <div className="avatar avatar-medium">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}

              </div>

              <div className="user-summary-info">

                <h3>
                  {user?.name || 'User'}
                </h3>

                {user?.username && (
                  <p>@{user.username}</p>
                )}

                {user?.bio && (
                  <p>{user.bio}</p>
                )}

              </div>
            </div>

            {user?._id && (
              <Link
                to={`/users/${user._id}`}
                className="btn btn-outline"
              >
                View User
              </Link>
            )}

          </div>

          {/* My albums */}
          <div className="card sidebar-card">

            <h3>My Albums</h3>

            {sidebarLoading ? (
              <p className="loading">
                Loading albums...
              </p>
            ) : myAlbums.length === 0 ? (
              <p className="empty-state">
                You have no albums yet.
              </p>
            ) : (
              myAlbums.map((album) => (
                <p key={album._id}>
                  <Link to={`/albums/${album._id}`}>
                    {album.name}
                  </Link>
                </p>
              ))
            )}

            <Link
              to="/albums"
              className="btn btn-secondary"
            >
              View Albums
            </Link>

          </div>

          {/* Badges */}
          <div className="card sidebar-card">

            <h3>Badges</h3>

            <p className="empty-state">
              No badges available yet.
            </p>

          </div>

        </aside>


        {/* =========================
            MAIN CONTENT
        ========================== */}
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


          {/* Feed tabs */}
          <div className="feed-tabs">

            <button
              className={
                scope === 'local'
                  ? 'active'
                  : ''
              }
              onClick={() => setScope('local')}
            >
              Local
            </button>

            <button
              className={
                scope === 'global'
                  ? 'active'
                  : ''
              }
              onClick={() => setScope('global')}
            >
              Global
            </button>

          </div>

          {/* Sorting */}
          <div className="feed-controls">

            <label>
              Sort:{' '}

              <select
                value={sort}
                onChange={(event) =>
                  setSort(event.target.value)
                }
              >
                <option value="newest">
                  Newest
                </option>

                <option value="popular">
                  Popular
                </option>
              </select>
            </label>

          </div>

          {/* Errors */}
          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {/* Feed */}
          {loading ? (
            <p className="loading">
              Loading feed...
            </p>
          ) : activities.length === 0 ? (
            <p className="empty-state">
              There is no activity to display.
            </p>
          ) : (
            <Feed activities={activities} />
          )}

        </section>


        {/* =========================
            RIGHT SIDEBAR
        ========================== */}
        <aside className="home-sidebar home-right-sidebar">

          {/* Upcoming events */}
          <div className="card sidebar-card">

            <h3>Upcoming Events</h3>

            <p className="empty-state">
              No upcoming events available.
            </p>

          </div>


          {/* Suggested friends */}
          <div className="card sidebar-card">

            <h3>Suggested Friends</h3>

            {sidebarLoading ? (
              <p className="loading">
                Loading users...
              </p>
            ) : suggestedFriends.length === 0 ? (
              <p className="empty-state">
                No friend suggestions available.
              </p>
            ) : (
              suggestedFriends.map((suggestedUser) => (
                <div
                  key={suggestedUser._id}
                  className="friend-card"
                >

                  <div className="profile-preview-info">

                    {suggestedUser.profileImage ? (
                      <img
                        src={suggestedUser.profileImage}
                        alt={suggestedUser.name}
                        className="avatar-small"
                      />
                    ) : (
                      <div className="avatar avatar-small">
                        {suggestedUser.name
                          ?.charAt(0)
                          ?.toUpperCase() || 'U'}
                      </div>
                    )}

                    <div>
                      <strong>
                        {suggestedUser.name}
                      </strong>

                      {suggestedUser.username && (
                        <p>
                          @{suggestedUser.username}
                        </p>
                      )}
                    </div>

                  </div>

                  <Link
                    to={`/users/${suggestedUser._id}`}
                    className="btn btn-outline"
                  >
                    View User
                  </Link>

                </div>
              ))
            )}

            <Link
              to="/friends"
              className="btn btn-secondary"
            >
              View Friends
            </Link>

          </div>


          {/* Trending */}
          <div className="card sidebar-card">

            <h3>Trending</h3>

            {trendingHashtags.length === 0 ? (
              <p className="empty-state">
                No trending hashtags yet.
              </p>
            ) : (
              trendingHashtags.map(
                ([hashtag, count]) => (
                  <p key={hashtag}>
                    <Link
                      to={`/search?query=${encodeURIComponent(
                        `#${hashtag}`
                      )}`}
                      className="hashtag"
                    >
                      {hashtag}
                    </Link>

                    {' '}
                    <small>
                      ({count})
                    </small>
                  </p>
                )
              )
            )}

          </div>

        </aside>

      </main>
    </div>
  );
}

export default Home;