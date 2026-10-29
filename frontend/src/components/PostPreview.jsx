import { Link } from 'react-router-dom';
import FavouriteButton from './FavouriteButton';
import { getAvatarUrl } from '../assets/avatar';

function PostPreview({ post, scope }) {
  if (post.hidden) {
    return (
      <article className="card post-preview">
        <h3>Post hidden</h3>

        <p>
          This post has received multiple reports.
        </p>

        <Link
          to={`/post/${post._id}`}
          className="btn btn-outline"
        >
          View Post
        </Link>
      </article>
    );
  }

  return (
    <article className="card post-preview">

      <div className="post-preview-header">

        <img
          src={getAvatarUrl(post.author)}
          alt={post.author?.name || 'User'}
          className="post-preview-avatar"
        />

        <div className="post-preview-user">
          <Link to={`/users/${post.author?._id}`}>
            <strong>
              {post.author?.name || 'Unknown User'}
            </strong>
          </Link>

          <p>
            @{post.author?.username || 'user'}
          </p>
        </div>

        <FavouriteButton
          postId={post._id}
          initialFavourited={post.isFavourited}
          scope={scope}
        />

      </div>

      {post.imageUrl ? (
        <Link to={`/post/${post._id}`}>
          <img
            src={post.imageUrl}
            alt={post.title || 'Post image'}
            className="post-preview-image"
          />
        </Link>
      ) : (
        <div className="post-preview-image-placeholder">
          📷
        </div>
      )}

      <div className="post-preview-content">

        <h3>
          {post.title}
        </h3>

        <p className="post-preview-description">
          {post.description}
        </p>

        {post.hashtags?.length > 0 && (
          <div className="post-hashtags">
            {post.hashtags.map((tag) => (
              <Link
                key={tag}
                to={`/search?query=${encodeURIComponent(tag)}`}
                className="hashtag"
              >
                {tag} 
              </Link>
            ))}
          </div>
        )}

        <div className="post-preview-actions">

          <span>
            ❤️ {post.likes || 0}
          </span>

          <span>
            💬 {post.commentsCount || 0}
          </span>

          <Link
            to={`/post/${post._id}`}
            className="btn btn-outline"
          >
            View Post
          </Link>

        </div>

      </div>

    </article>
  );
}

export default PostPreview;