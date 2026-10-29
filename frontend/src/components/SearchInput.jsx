import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../assets/avatar';

function SearchInput({
  placeholder = 'Search users, posts, albums or hashtags...'
}) {
  const [search, setSearch] = useState('');
  const [suggestions, setSuggestions] = useState({
    users: [],
    posts: [],
    albums: []
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const term = search.trim().replace(/^#/, '');
    let cancelled = false;

    if (term.length < 2) {
      setSuggestions({ users: [], posts: [], albums: [] });
      setLoadingSuggestions(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setLoadingSuggestions(true);

        const response = await fetch(
          `/api/search?q=${encodeURIComponent(term)}`,
          {
            credentials: 'include',
            signal: controller.signal
          }
        );

        if (!response.ok) {
          throw new Error('Could not load suggestions.');
        }

        const data = await response.json();

        if (!cancelled) {
          setSuggestions({
            users: (data.users || []).slice(0, 3),
            posts: (data.posts || []).slice(0, 3),
            albums: (data.albums || []).slice(0, 3)
          });
        }
      } catch (error) {
        if (!cancelled && error.name !== 'AbortError') {
          console.error('Autocomplete error:', error);
          setSuggestions({ users: [], posts: [], albums: [] });
        }
      } finally {
        if (!cancelled) {
          setLoadingSuggestions(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  function handleSubmit(event) {
    event.preventDefault();

    const term = search.trim().replace(/^#/, '');

    if (!term) return;

    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(term)}`);
  }

  const hasSuggestions =
    suggestions.users.length > 0 ||
    suggestions.posts.length > 0 ||
    suggestions.albums.length > 0;

  return (
    <div className="search-input-container">
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={placeholder}
          autoComplete="off"
          aria-label="Search users, posts, albums and hashtags"
          aria-expanded={showSuggestions && search.trim().length >= 2}
        />

        <button type="submit" className="btn btn-primary">
          🔍︎
        </button>
      </form>

      {showSuggestions && search.trim().length >= 2 && (
        <div className="search-suggestions">
          {loadingSuggestions && (
            <p className="search-no-suggestions">
              Finding suggestions...
            </p>
          )}

          {!loadingSuggestions && hasSuggestions && (
            <>
              {suggestions.users.map((user) => (
                <Link
                  key={`user-${user._id}`}
                  to={`/users/${user._id}`}
                  className="search-suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowSuggestions(false)}
                >
                  <img
                    src={getAvatarUrl(user)}
                    alt=""
                    className="suggested-friend-avatar"
                  />

                  <span>
                    <strong>
                      {user.name || user.username || user.email || 'User'}
                    </strong>
                    {user.username && <small>@{user.username}</small>}
                    <small>User</small>
                  </span>
                </Link>
              ))}

              {suggestions.posts.map((post) => (
                <Link
                  key={`post-${post._id}`}
                  to={`/post/${post._id}`}
                  className="search-suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowSuggestions(false)}
                >
                  <span>
                    <strong>
                      {post.title || post.description || 'View post'}
                    </strong>
                    <small>Post</small>
                  </span>
                </Link>
              ))}

              {suggestions.albums.map((album) => (
                <Link
                  key={`album-${album._id}`}
                  to={`/albums/${album._id}`}
                  className="search-suggestion"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => setShowSuggestions(false)}
                >
                  <span>
                    <strong>{album.name || 'Untitled album'}</strong>
                    <small>Album</small>
                  </span>
                </Link>
              ))}

              <button
                type="button"
                className="search-all-suggestions"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleSubmit}
              >
                See all results
              </button>
            </>
          )}

          {!loadingSuggestions && !hasSuggestions && (
            <p className="search-no-suggestions">
              No suggestions found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInput;