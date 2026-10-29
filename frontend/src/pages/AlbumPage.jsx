
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

function AlbumPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [album, setAlbum] = useState(null);
  const [posts, setPosts] = useState([]);
  const [availablePosts, setAvailablePosts] = useState([]);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function loadAlbum() {
    try {
      setError('');

      const response = await fetch(`/api/albums/${id}`, {
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Could not load album.');
      }

      setAlbum(data.album);
      setPosts(data.posts || []);

      setName(data.album.name || '');
      setDescription(data.album.description || '');
      setHashtags(data.album.hashtags?.join(', ') || '');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAvailablePosts() {
    try {
      const response = await fetch('/api/posts', {
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Could not load posts.'
        );
      }

      // Only show posts created by the logged-in user.
      setAvailablePosts(
        (data.posts || []).filter(
          (post) => String(post.authorId) === String(user?._id)
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    loadAlbum();
  }, [id]);

  useEffect(() => {
    if (user) {
      loadAvailablePosts();
    }
  }, [user]);

  async function updateAlbum(event) {
    event.preventDefault();

    try {
      setError('');

      const response = await fetch(`/api/albums/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          hashtags: hashtags
            .split(',')
            .map((tag) => tag.trim().replace(/^#/, ''))
            .filter(Boolean)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Could not update album.'
        );
      }

      await loadAlbum();
      setEditing(false);
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteAlbum() {
    const confirmed = window.confirm(
      'Delete this album? This will not delete the original posts.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const response = await fetch(`/api/albums/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Could not delete album.'
        );
      }

      navigate('/albums');
    } catch (error) {
      setError(error.message);
    }
  }

  async function addPost(postId) {
    try {
      setError('');

      const response = await fetch(
        `/api/albums/${id}/posts/${postId}`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Could not add post.'
        );
      }

      // Refresh both lists so the added post moves into the album.
      await loadAlbum();
      await loadAvailablePosts();
    } catch (error) {
      setError(error.message);
    }
  }

  async function removePost(postId) {
    try {
      setError('');

      const response = await fetch(
        `/api/albums/${id}/posts/${postId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || 'Could not remove post.'
        );
      }

      await loadAlbum();
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="container album-page">
          <p>Loading album...</p>
        </main>
      </>
    );
  }

  if (!album) {
    return (
      <>
        <Header />
        <main className="container album-page">
          <Link to="/albums" className="album-back-link">
            ← Back to Albums
          </Link>

          {error && (
            <p className="form-error album-error">{error}</p>
          )}

          {!error && <p>Album not found.</p>}
        </main>
      </>
    );
  }

  const ownAlbum =
    String(user?._id) === String(album.ownerId);

  // Compare IDs as strings to avoid string/ObjectId mismatches.
  const albumPostIds = (album.postIds || []).map(String);

  const postsToAdd = availablePosts.filter(
    (post) => !albumPostIds.includes(String(post._id))
  );

  return (
    <>
      <Header />

      <main className="container album-page">
        <Link to="/albums" className="album-back-link">
          ← Back to Albums
        </Link>

        {error && (
          <p className="form-error album-error">{error}</p>
        )}

        {!editing ? (
          <>
            {/* Album heading and information */}
            <section className="album-header">
              <h1>{album.name}</h1>

              {album.description && (
                <p className="album-description">
                  {album.description}
                </p>
              )}

              {album.hashtags?.length > 0 && (
                <p className="album-hashtags">
                  {album.hashtags.map((tag) => `#${tag}`).join(' ')}
                </p>
              )}

              <span className="album-post-count">
                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
              </span>

              {ownAlbum && (
                <div className="album-actions">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Album
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={deleteAlbum}
                  >
                    Delete Album
                  </button>
                </div>
              )}
            </section>

            {/* Posts already in the album */}
            <section className="album-section">
              <h2>Posts in Album</h2>

              {posts.length === 0 ? (
                <p className="album-empty">
                  This album is empty. Add some of your posts below!
                </p>
              ) : (
                <div className="album-post-grid">
                  {posts.map((post) => (
                    <article
                      className="album-post-card"
                      key={post._id}
                    >
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={post.title || 'Post image'}
                          className="album-post-image"
                        />
                      ) : (
                        <div className="album-post-image-placeholder">
                          📷
                        </div>
                      )}

                      <div className="album-post-content">
                        <h3>{post.title || 'Untitled post'}</h3>

                        {post.description && (
                          <p className="album-post-description">
                            {post.description}
                          </p>
                        )}

                        <div className="album-post-actions">
                          <Link
                            to={`/post/${post._id}`}
                            className="btn btn-outline"
                          >
                            View Post
                          </Link>

                          {ownAlbum && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removePost(post._id)}
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Posts the owner can add */}
            {ownAlbum && (
              <section className="album-section album-add-section">
                <h2>Add Your Posts</h2>

                <p>
                  Choose one of your posts to include in this album.
                </p>

                {postsToAdd.length === 0 ? (
                  <p className="album-empty">
                    You have no more posts to add to this album.
                  </p>
                ) : (
                  <div className="album-post-grid">
                    {postsToAdd.map((post) => (
                      <article
                        className="album-post-card"
                        key={post._id}
                      >
                        {post.imageUrl ? (
                          <img
                            src={post.imageUrl}
                            alt={post.title || 'Post image'}
                            className="album-post-image"
                          />
                        ) : (
                          <div className="album-post-image-placeholder">
                            📷
                          </div>
                        )}

                        <div className="album-post-content">
                          <h3>{post.title || 'Untitled post'}</h3>

                          {post.description && (
                            <p className="album-post-description">
                              {post.description}
                            </p>
                          )}

                          <div className="album-post-actions">
                            <button
                              type="button"
                              className="btn btn-primary"
                              onClick={() => addPost(post._id)}
                            >
                              Add to Album
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        ) : (
          <form
            className="card album-edit-form"
            onSubmit={updateAlbum}
          >
            <h2>Edit Album</h2>

            <label htmlFor="album-name">Name</label>
            <input
              id="album-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />

            <label htmlFor="album-description">Description</label>
            <textarea
              id="album-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />

            <label htmlFor="album-hashtags">
              Hashtags (separate with commas)
            </label>
            <input
              id="album-hashtags"
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
              placeholder="travel, friends, memories"
            />
            <HashtagSuggestions value={hashtags} onChange={setHashtags} />

            <div className="album-form-actions">
              <button type="submit" className="btn btn-primary">
                Save Changes
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => {
                  setEditing(false);
                  setName(album.name || '');
                  setDescription(album.description || '');
                  setHashtags(album.hashtags?.join(', ') || '');
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}

export default AlbumPage;
