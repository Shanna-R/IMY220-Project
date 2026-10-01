import { Link } from 'react-router-dom';
import { useState } from 'react';

function Post({ post }) {
  const [liked, setLiked] = useState(
    Boolean(post.liked)
  );

  const [likesCount, setLikesCount] = useState(
    post.likes || 0
  );

  const [liking, setLiking] = useState(false);

  async function toggleLike() {
    if (liking) {
      return;
    }

    try {
      setLiking(true);

      const response = await fetch(
        `/api/posts/${post._id}/like`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || 'Unable to like post.'
        );
      }

      setLiked(data.liked);
      setLikesCount(data.likesCount);

    } catch (error) {
      console.error(
        'Like error:',
        error
      );
    } finally {
      setLiking(false);
    }
  }

  return (
    <article className="card post-detail">

      <div className="post-author">

        <div className="avatar">
          {post.author?.name
            ?.charAt(0)
            ?.toUpperCase() || '?'}
        </div>

        <div>
          <Link
            to={`/users/${post.author?._id}`}
          >
            <strong>
              {post.author?.name ||
                'Unknown User'}
            </strong>
          </Link>

          <p>
            @{post.author?.username || 'user'}
          </p>
        </div>

      </div>

      <h1>
        {post.title}
      </h1>

      {post.imageUrl && (
        <img
          src={post.imageUrl}
          alt={post.title || 'Post image'}
          className="post-detail-image"
        />
      )}

      <p>
        {post.description}
      </p>

      {post.hashtags?.length > 0 && (
        <p className="hashtags">
          {post.hashtags.map((tag) => (
            <Link
              key={tag}
              to={`/search?q=${encodeURIComponent(tag)}`}
            >
              {tag} 
            </Link>
          ))}
        </p>
      )}

      <div className="post-stats">

        <button
          type="button"
          className={`like-button ${
            liked ? 'liked' : ''
          }`}
          onClick={toggleLike}
          disabled={liking}
          aria-label={
            liked
              ? 'Unlike post'
              : 'Like post'
          }
        >
          {liked ? '♥' : '♡'}
        </button>

        <span>
          {likesCount} likes
        </span>

        <span>
          💬 {post.commentsCount || 0} comments
        </span>

      </div>

    </article>
  );
}

export default Post;