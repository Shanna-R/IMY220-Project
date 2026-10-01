import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';

function AlbumsPage() {
  const [albums, setAlbums] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadAlbums() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        '/api/albums',
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not load albums.'
        );
      }

      setAlbums(data.albums || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlbums();
  }, []);

  async function deleteAlbum(id) {
    const confirmed = window.confirm(
      'Delete this album?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

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

      loadAlbums();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="page">

      <Header />

      <main className="container">

        <div className="home-heading">

          <h1 className="page-title">
            Albums
          </h1>

          <Link
            to="/create-album"
            className="btn btn-primary"
          >
            Create Album
          </Link>

        </div>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {loading ? (
          <p className="loading">
            Loading albums...
          </p>
        ) : albums.length === 0 ? (
          <div className="empty-state">

            <h2>
              No Albums Yet
            </h2>

            <p>
              Create your first album to organise your
              scouting adventures.
            </p>

          </div>
        ) : (

        <section className="album-grid">

          {albums.map((album) => (

            <article
              className="card album-card"
              key={album._id}
            >

              {album.coverImage ? (
                <img
                  src={album.coverImage}
                  alt={album.name}
                  className="album-cover-image"
                />
              ) : (
                <div className="album-cover">
                  📷
                </div>
              )}

              <div className="album-info">

                <strong>
                  {album.name}
                </strong>

                <p>
                  {album.description}
                </p>

                {album.owner && (
                  <p>
                    Created by{' '}

                    <Link
                      to={`/users/${album.owner._id}`}
                    >
                      {album.owner.name}
                    </Link>
                  </p>
                )}

                <small>
                  {album.postIds?.length || 0} posts
                </small>

                <div className="friend-actions">

                  <Link
                    to={`/album/${album._id}`}
                    className="btn btn-outline"
                  >
                    View
                  </Link>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      deleteAlbum(album._id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            </article>

          ))}

        </section>
        )}

      </main>

    </div>
  );
}

export default AlbumsPage;