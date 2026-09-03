import Image from './Image';

function Post({ post }) {
  return (
    <article className="card post-detail">

      <div className="post-author">

        <div className="avatar">
          {post.authorName.charAt(0)}
        </div>

        <div>
          <strong>{post.authorName}</strong>

          <p>
            {post.troop}
          </p>
        </div>

      </div>

      <p>
        <strong>{post.title}</strong>
      </p>

      <Image alt={post.title} />

      <p>
        {post.description}
      </p>

      <p className="hashtags">
        {post.hashtags.join(' ')}
      </p>

      <div className="post-stats">

        <span>
          ❤️ {post.likes} likes
        </span>

        <span>
          💬 {post.comments} comments
        </span>

      </div>

    </article>
  );
}

export default Post;