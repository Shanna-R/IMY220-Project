import { Link } from 'react-router-dom';

const posts = [
  { id: 1, title: 'Kayaking Rapids', place: 'Surrey Hills' },
  { id: 2, title: 'Pioneering Tower', place: 'Surrey Hills' },
  { id: 3, title: 'First Aid Merit', place: 'Pretoria' },
  { id: 4, title: 'Shelter Build', place: 'Pretoria' },
  { id: 5, title: 'Night Navigation', place: 'Drakensberg' },
  { id: 6, title: 'Peak Summit', place: 'Drakensberg' }
];

function UserPosts() {
  return (
    <section>
      <h2 className="page-title">
        Adventure Log
      </h2>

      <div className="user-post-grid">

        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/post/${post.id}`}
            className="card user-post"
          >
            <div className="post-thumbnail">
              🏕️
            </div>

            <strong>{post.title}</strong>

            <small>{post.place}</small>
          </Link>
        ))}

      </div>
    </section>
  );
}

export default UserPosts;