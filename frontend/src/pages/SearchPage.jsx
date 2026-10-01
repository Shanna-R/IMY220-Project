import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import Header from '../components/Header';

function SearchPage() {
const [searchParams, setSearchParams] = useSearchParams();

const initialQuery = searchParams.get('q') || '';

const [query, setQuery] = useState(initialQuery);

const [results, setResults] = useState({
users: [],
posts: [],
albums: []
});

const [activeFilter, setActiveFilter] = useState('all');

const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

async function performSearch(searchTerm) {
if (!searchTerm.trim()) {
setResults({
users: [],
posts: [],
albums: []
});

  return;
}

try {
  setLoading(true);
  setError('');

  const response = await fetch(
    `/api/search?q=${encodeURIComponent(searchTerm)}`,
    {
      credentials: 'include'
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error || data.message || 'Search failed.'
    );
  }

  setResults({
    users: data.users || [],
    posts: data.posts || [],
    albums: data.albums || []
  });

} catch (error) {
  console.error('Search error:', error);
  setError(error.message);
} finally {
  setLoading(false);
}

}

useEffect(() => {
if (initialQuery) {
performSearch(initialQuery);
}
}, []);

function handleSubmit(event) {
event.preventDefault();

const trimmedQuery = query.trim();

setSearchParams({
  q: trimmedQuery
});

performSearch(trimmedQuery);

}

function showUsers() {
return (
<section>
<h2 className="section-title">
Users
</h2>

    {results.users.length === 0 ? (
      <div className="empty-state">
        <p>No users found.</p>
      </div>
    ) : (
      <div className="search-results">
        {results.users.map((user) => (
          <Link
            key={user._id}
            to={`/users/${user._id}`}
            className="search-result"
          >
            <div className="avatar">
              {user.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            <div>
              <strong>
                {user.name}
              </strong>

              <p>
                @{user.username}
              </p>
            </div>
          </Link>
        ))}
      </div>
    )}
  </section>
);

}

function showPosts() {
return (
<section>
<h2 className="section-title">
Posts
</h2>

    {results.posts.length === 0 ? (
      <div className="empty-state">
        <p>No posts found.</p>
      </div>
    ) : (
      <div className="search-results">
        {results.posts.map((post) => (
          <Link
            key={post._id}
            to={`/post/${post._id}`}
            className="search-result"
          >
            <div>
              <strong>
                {post.title}
              </strong>

              <p>
                {post.description}
              </p>

              {post.hashtags?.length > 0 && (
                <div className="post-hashtags">
                  {post.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="hashtag"
                    >
                      {tag} 
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    )}
  </section>
);

}

function showAlbums() {
return (
<section>
<h2 className="section-title">
Albums
</h2>

    {results.albums.length === 0 ? (
      <div className="empty-state">
        <p>No albums found.</p>
      </div>
    ) : (
      <div className="search-results">
        {results.albums.map((album) => (
          <Link
            key={album._id}
            to={`/albums/${album._id}`}
            className="search-result"
          >
            <div>
              <strong>
                {album.name}
              </strong>

              <p>
                {album.description}
              </p>

              {album.hashtags?.length > 0 && (
                <div className="post-hashtags">
                  {album.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="hashtag"
                    >
                      {tag} 
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    )}
  </section>
);

}

return (
<div className="page">

  <Header />

  <main className="container">

    <h1 className="page-title">
      Search
    </h1>

    <form
      className="search-form"
      onSubmit={handleSubmit}
    >
      <input
        value={query}
        onChange={(event) =>
          setQuery(event.target.value)
        }
        placeholder="Search users, posts, albums or hashtags..."
      />

      <button
        type="submit"
        className="btn btn-primary"
      >
        Search
      </button>
    </form>

    {loading && (
      <p className="loading">
        Searching...
      </p>
    )}

    {error && (
      <p className="form-error">
        {error}
      </p>
    )}

    {!loading && !error && query.trim() && (
      <>
        <div className="search-tabs">

          <button
            type="button"
            className={
              activeFilter === 'all'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveFilter('all')
            }
          >
            All
          </button>

          <button
            type="button"
            className={
              activeFilter === 'users'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveFilter('users')
            }
          >
            Users ({results.users.length})
          </button>

          <button
            type="button"
            className={
              activeFilter === 'posts'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveFilter('posts')
            }
          >
            Posts ({results.posts.length})
          </button>

          <button
            type="button"
            className={
              activeFilter === 'albums'
                ? 'active'
                : ''
            }
            onClick={() =>
              setActiveFilter('albums')
            }
          >
            Albums ({results.albums.length})
          </button>

        </div>

        {activeFilter === 'all' && (
          <>
            {showUsers()}
            {showPosts()}
            {showAlbums()}
          </>
        )}

        {activeFilter === 'users' && showUsers()}

        {activeFilter === 'posts' && showPosts()}

        {activeFilter === 'albums' && showAlbums()}

      </>
    )}

    {!loading && !error && !query.trim() && (
      <div className="empty-state">
        <h2>
          Search Woggle
        </h2>

        <p>
          Search for users, posts, albums or hashtags.
        </p>
      </div>
    )}

  </main>

</div>

);
}

export default SearchPage;