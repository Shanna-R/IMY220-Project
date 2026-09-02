import { Link } from 'react-router-dom';
import '../index.css';

function PostPreview({ post }) {
  return (
    <article className="post-preview card">

      <div className="post-preview-header">
        <div className="avatar">
          👤
        </div>

        <div>
          <strong>{post.authorName}</strong>
          <p>{post.troop} • {post.timeAgo}</p>
        </div>
      </div>

      {post.imageUrl && (
        <img
          className="post-preview-image"
          src={post.imageUrl}
          alt={post.title}
        />
      )}

      <h3>{post.title}</h3>

      <p>{post.description}</p>

      <p className="hashtags">
        {post.hashtags?.join(' ')}
      </p>

      <div className="post-preview-footer">
        <span>❤️ {post.likes}</span>
        <span>💬 {post.comments} Comments</span>

        <Link to={`/post/${post.id}`}>
          View Post
        </Link>
      </div>

    </article>
  );
}

export default PostPreview;