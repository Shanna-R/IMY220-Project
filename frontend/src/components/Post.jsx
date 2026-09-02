import Image from './Image';

function Post() {
  const post = {
    authorName: 'Leara Gangadin',
    troop: 'Troop 17',
    date: 'January 15, 2026',
    description:
      'We had an amazing winter camp and spent the weekend hiking through the mountains.',
    hashtags: [
      '#Camping',
      '#Hiking',
      '#Adventure',
      '#WinterSurvival'
    ],
    likes: 42,
    views: 1240
  };

  return (
    <article className="card post-detail">

      <div className="post-author">

        <div className="avatar">
          👤
        </div>

        <div>
          <strong>{post.authorName}</strong>
          <p>
            {post.troop} • {post.date}
          </p>
        </div>

      </div>

      <p>
        <strong>Part of:</strong> Winter Camp
      </p>

      <Image alt="Winter camp" />

      <p>{post.description}</p>

      <p className="hashtags">
        {post.hashtags.join(' ')}
      </p>

      <div className="post-stats">
        <span>❤️ {post.likes} likes</span>
        <span>👁️ {post.views} views</span>
      </div>

    </article>
  );
}

export default Post;