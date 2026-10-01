import { Link } from 'react-router-dom';

function AlbumCard({ album }) {
  return (
    <article className="card album-card">

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

        <p className="activity-label">
          Album
        </p>

        <h2>
          {album.name}
        </h2>

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

        {album.hashtags?.length > 0 && (
          <p className="hashtags">

            {album.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/search?q=${encodeURIComponent(tag)}`}
              >
                {tag} 
              </Link>
            ))}

          </p>
        )}

        <p>
          {album.postIds?.length || 0} posts
        </p>

        <Link
          to={`/album/${album._id}`}
          className="btn btn-outline"
        >
          View Album
        </Link>

      </div>

    </article>
  );
}

export default AlbumCard;