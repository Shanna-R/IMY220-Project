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

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');

  const [availablePosts, setAvailablePosts] = useState([]);

  const [error, setError] = useState('');

  async function loadAlbum() {
    try {
      const response = await fetch(
        `/api/albums/${id}`,
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not load album.'
        );
      }

      setAlbum(data.album);
      setPosts(data.posts || []);

      setName(data.album.name || '');
      setDescription(
        data.album.description || ''
      );

      setHashtags(
        data.album.hashtags?.join(', ') || ''
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function loadAvailablePosts() {
    try {
      const response = await fetch(
        '/api/posts',
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAvailablePosts(
          (data.posts || []).filter(
            (post) =>
              post.userId === user?._id
          )
        );
      }
    } catch (error) {
      console.error(
        'Could not load posts:',
        error
      );
    }
  }

  useEffect(() => {
    loadAlbum();
  }, [id]);

  useEffect(() => {
    if (user) {
      loadAvailablePosts();
    }
  }, [user, album]);

  async function updateAlbum(event) {
    event.preventDefault();

    try {
      const response = await fetch(
        `/api/albums/${id}`,
        {
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
              .map((tag) =>
                tag.trim().replace(/^#/, '')
              )
              .filter(Boolean)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not update album.'
        );
      }

      setAlbum(data.album);
      setEditing(false);

      loadAlbum();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteAlbum() {
    const confirmed = window.confirm(
      'Delete this album?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/albums/${id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not delete album.'
        );
      }

      navigate('/albums');
    } catch (error) {
      setError(error.message);
    }
  }

  async function addPost(postId) {
    try {
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
          data.error || 'Could not add post.'
        );
      }

      loadAlbum();
    } catch (error) {
      setError(error.message);
    }
  }

  async function removePost(postId) {
    try {
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
          data.error || 'Could not remove post.'
        );
      }

      loadAlbum();
    } catch (error) {
      setError(error.message);
    }
  }

  if (!album) {
    return (
      <>
        <Header />

        <main className="container">
          {error ? (
            <p className="form-error">
              {error}
            </p>
          ) : (
            <p>Loading album...</p>
          )}
        </main>
      </>
    );
  }

  const ownAlbum = user?._id === album.userId;

  return (
    <div>
      <Header />

      <main className="container">
        <Link to="/albums">
          ← Back to Albums
        </Link>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {!editing ? (
          <>
            <section className="card">
              <h1>
                {album.name}
              </h1>

              <p>
                {album.description}
              </p>

              <p>
                {album.hashtags?.map(
                  (tag) => `#${tag} `
                )}
              </p>

              <p>
                {posts.length} posts
              </p>

              {ownAlbum && (
                <div>
                  <button
                    className="btn"
                    onClick={() =>
                      setEditing(true)
                    }
                  >
                    Edit Album
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={deleteAlbum}
                  >
                    Delete Album
                  </button>
                </div>
              )}
            </section>

            <section>
              <h2>
                Posts in Album
              </h2>

              {posts.map((post) => (
                <article
                  className="card"
                  key={post._id}
                >
                  <h3>
                    {post.title}
                  </h3>

                  <p>
                    {post.description}
                  </p>

                  <Link
                    to={`/post/${post._id}`}
                    className="btn btn-outline"
                  >
                    View Post
                  </Link>

                  {ownAlbum && (
                    <button
                      className="btn btn-danger"
                      onClick={() =>
                        removePost(post._id)
                      }
                    >
                      Remove
                    </button>
                  )}
                </article>
              ))}
            </section>

            {ownAlbum && (
              <section>
                <h2>
                  Add Your Posts
                </h2>

                {availablePosts
                  .filter(
                    (post) =>
                      !album.postIds?.includes(
                        post._id
                      )
                  )
                  .map((post) => (
                    <article
                      className="card"
                      key={post._id}
                    >
                      <h3>
                        {post.title}
                      </h3>

                      <button
                        className="btn"
                        onClick={() =>
                          addPost(post._id)
                        }
                      >
                        Add to Album
                      </button>
                    </article>
                  ))}
              </section>
            )}
          </>
        ) : (
          <form
            className="form-card"
            onSubmit={updateAlbum}
          >
            <h2>
              Edit Album
            </h2>

            <label>
              Name
            </label>

            <input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
            />

            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />

            <label>
              Hashtags
            </label>

            <input
              value={hashtags}
              onChange={(event) =>
                setHashtags(event.target.value)
              }
            />

            <button
              type="submit"
              className="btn"
            >
              Save
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                setEditing(false)
              }
            >
              Cancel
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

export default AlbumPage;