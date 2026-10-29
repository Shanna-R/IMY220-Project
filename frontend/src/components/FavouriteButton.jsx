import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function FavouriteButton({
  postId,
  initialFavourited = false,
  scope
}) {
  const { user } = useAuth();

  const [favourited, setFavourited] = useState(
    initialFavourited
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the button when the post or feed scope changes.
  useEffect(() => {
    setFavourited(initialFavourited);
  }, [postId, scope, initialFavourited]);

  if (!user || !postId || !['local', 'global'].includes(scope)) {
    return null;
  }

  async function toggleFavourite() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `/api/posts/${postId}/favourite`,
        {
          method: favourited ? 'DELETE' : 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ scope })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not update favourite.'
        );
      }

      setFavourited(data.isFavourited);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="favourite-control">
      <button
        type="button"
        className={`favourite-button ${
          favourited ? 'favourited' : ''
        }`}
        onClick={toggleFavourite}
        disabled={loading}
        title={
          favourited
            ? 'Remove from favourites'
            : 'Add to favourites'
        }
        aria-label={
          favourited
            ? 'Remove from favourites'
            : 'Add to favourites'
        }
      >
        {favourited ? '★' : '☆'}
      </button>

      {error && (
        <small className="form-error">{error}</small>
      )}
    </div>
  );
}

export default FavouriteButton;