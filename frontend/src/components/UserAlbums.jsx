
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function UserAlbums({ userId }) {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAlbums() {
        try
        {
            setLoading(true);
            setError('');

            const response = await fetch('/api/albums', {
            credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok)
            {
                throw new Error(
                    data.message || 'Unable to load albums.'
                );
            }

            // Only show albums belonging to this profile.
            const userAlbums = (data.albums || []).filter(
            album => album.ownerId === userId
            );

            setAlbums(userAlbums);
        }
        catch (error)
        {
            console.error('Error loading user albums:', error);
            setError(error.message || 'Unable to load albums.');
        }
        finally
        {
            setLoading(false);
        }
        }

        loadAlbums();
    }, [userId]);

    if (loading)
    {
        return <p>Loading albums...</p>;
    }

    if (error)
    {
        return (
        <div className="card">
            <p>{error}</p>
        </div>
        );
    }

    if (albums.length === 0)
    {
        return <p>This user has not created any albums yet.</p>;
    }

    return (
        <section className="user-albums-grid">
        {albums.map(album => (
            <article className="card user-album-card" key={album._id}>
            <Link to={`/albums/${album._id}`} className="user-album-cover-link">
                {album.coverImage ? (
                <img
                    src={album.coverImage}
                    alt={`${album.name} cover`}
                    className="user-album-cover"
                />
                ) : (
                <div className="user-album-placeholder">
                    No cover image
                </div>
                )}
            </Link>

            <div className="user-album-content">
                <h3>{album.name || 'Untitled Album'}</h3>

                {album.description && <p>{album.description}</p>}

                <p>
                {album.postIds?.length || 0}{' '}
                {(album.postIds?.length || 0) === 1 ? 'post' : 'posts'}
                </p>

                <Link
                to={`/albums/${album._id}`}
                className="btn btn-outline"
                >
                View Album
                </Link>
            </div>
            </article>
        ))}
        </section>
    );
}

export default UserAlbums;