import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Header from '../components/Header';
import { getAvatarUrl } from '../assets/avatar';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');

  const [results, setResults] = useState({
    users: [],
    posts: [],
    albums: []
  });

  const [activeFilter, setActiveFilter] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the input when the URL query changes.
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
  }, [searchParams]);

  // Search automatically while the user types.
  useEffect(() => {
    const searchTerm = query.trim().replace(/^#/, '');
    let cancelled = false;

    if (!searchTerm) {
      setResults({ users: [], posts: [], albums: [] });
      setLoading(false);
      setError('');
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(searchTerm)}`,
          { credentials: 'include' }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Search failed.');
        }

        if (!cancelled) {
          setResults({
            users: data.users || [],
            posts: data.posts || [],
            albums: data.albums || []
          });
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Search error:', error);
          setError(error.message || 'Search failed.');
          setResults({ users: [], posts: [], albums: [] });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  function handleSubmit(event) {
    event.preventDefault();

    const trimmedQuery = query.trim().replace(/^#/, '');

    setQuery(trimmedQuery);
    setSearchParams(
      trimmedQuery ? { q: trimmedQuery } : {},
      { replace: true }
    );
  }

  function renderHashtags(hashtags = []) {
    if (!hashtags.length) return null;

    return (
      <div className="post-hashtags">
        {hashtags.map((tag) => {
          const cleanTag = String(tag).replace(/^#/, '');

          return (
            <Link
              key={tag}
              to={`/search?q=${encodeURIComponent(cleanTag)}`}
              className="hashtag"
            >
              #{cleanTag}
            </Link>
          );
        })}
      </div>
    );
  }

  function showUsers() {
    if (results.users.length === 0) {
      return (
        <div className="empty-state">
          <p>No users found.</p>
        </div>
      );
    }

    return (
      <div className="search-results">
        {results.users.map((searchUser) => (
          <div key={searchUser._id} className="card search-result">
            <div className="suggested-friend-row">
              <Link
                to={`/users/${searchUser._id}`}
                className="suggested-friend-link"
              >
                <img
                  src={getAvatarUrl(searchUser)}
                  alt={searchUser.name || 'User'}
                  className="suggested-friend-avatar"
                />

                <div className="suggested-friend-info">
                  <p className="suggested-friend-name">
                    {searchUser.name || 'Unnamed user'}
                  </p>

                  {searchUser.username && (
                    <p className="suggested-friend-username">
                      @{searchUser.username}
                    </p>
                  )}

                  {searchUser.email && (
                    <p className="search-result-email">
                      {searchUser.email}
                    </p>
                  )}
                </div>
              </Link>

              <Link
                to={`/users/${searchUser._id}`}
                className="suggested-friend-view"
              >
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function showPosts() {
    if (results.posts.length === 0) {
      return (
        <div className="empty-state">
          <p>No posts found.</p>
        </div>
      );
    }

    return (
      <div className="search-results">
        {results.posts.map((post) => (
          <div key={post._id} className="card search-result">
            <Link to={`/post/${post._id}`} className="search-result-content">
              <strong>{post.title || 'Post'}</strong>

              <p>
                {post.description || 'No description available.'}
              </p>

              {post.author && (
                <p className="search-result-owner">
                  By {post.author.name}
                  {post.author.username && ` (@${post.author.username})`}
                </p>
              )}
            </Link>

            {renderHashtags(post.hashtags)}
          </div>
        ))}
      </div>
    );
  }

  function showAlbums() {
    if (results.albums.length === 0) {
      return (
        <div className="empty-state">
          <p>No albums found.</p>
        </div>
      );
    }

    return (
      <div className="search-results">
        {results.albums.map((album) => (
          <div key={album._id} className="card search-result">
            <Link
              to={`/albums/${album._id}`}
              className="search-result-content"
            >
              <strong>{album.name || 'Untitled album'}</strong>

              <p>
                {album.description || 'No description available.'}
              </p>

              {album.owner && (
                <p className="search-result-owner">
                  By {album.owner.name}
                  {album.owner.username && ` (@${album.owner.username})`}
                </p>
              )}
            </Link>

            {renderHashtags(album.hashtags)}
          </div>
        ))}
      </div>
    );
  }

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'posts', label: 'Posts' },
    { id: 'albums', label: 'Albums' }
  ];

  return (
    <div className="page">
      <Header />

      <main className="container">
        <h1 className="page-title">Search</h1>

        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search users, posts, albums or hashtags..."
            aria-label="Search users, posts, albums or hashtags"
          />

          <button type="submit" className="btn btn-primary">
            🔍︎
          </button>
        </form>

        <div className="search-tabs">
          {tabs.map((tab) => {
            const count =
              tab.id === 'users'
                ? results.users.length
                : tab.id === 'posts'
                  ? results.posts.length
                  : results.albums.length;

            return (
              <button
                key={tab.id}
                type="button"
                className={activeFilter === tab.id ? 'active' : ''}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label} ({count})
              </button>
            );
          })}
        </div>

        {loading && <p className="loading">Searching...</p>}

        {error && <p className="form-error">{error}</p>}

        {!loading && !error && !query.trim() && (
          <div className="empty-state">
            <h2>Search Woggle</h2>
            <p>Search for users, posts, albums or hashtags.</p>
          </div>
        )}

        {!loading && !error && query.trim() && (
          <>
            {activeFilter === 'users' && (
              <>
                <h2 className="section-title">
                  Users
                </h2>
                {showUsers()}
              </>
            )}

            {activeFilter === 'posts' && (
              <>
                <h2 className="section-title">
                  Posts
                </h2>
                {showPosts()}
              </>
            )}

            {activeFilter === 'albums' && (
              <>
                <h2 className="section-title">
                  Albums
                </h2>
                {showAlbums()}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default SearchPage;