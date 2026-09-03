import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import Header from '../components/Header';
import Post from '../components/Post';
import Comments from '../components/Comments';
import EditPost from '../components/EditPost';

function PostPage() {
  const { id } = useParams();

  const [editing, setEditing] = useState(false);
  const [post, setPost] = useState(null);

  useEffect(() => {
    fetch(`/api/posts/${id}`)
      .then(response => response.json())
      .then(data => {
        setPost(data.post);
      })
      .catch(error => {
        console.error('Error loading post:', error);
      });
  }, [id]);

  if (!post) {
    return (
      <>
        <Header />

        <main className="container">
          <p>Loading post...</p>
        </main>
      </>
    );
  }

  return (
    <div>

      <Header />

      <main className="container">

        <Link to="/home">
          ← Back
        </Link>

        <p>
          Post ID: {id}
        </p>

        {!editing ? (
          <>
            <Post post={post} />

            <div style={{ margin: '15px 0' }}>
              <button
                className="btn btn-outline"
                onClick={() => setEditing(true)}
              >
                Edit Post
              </button>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <Comments />
            </div>
          </>
        ) : (
          <EditPost
            onCancel={() => setEditing(false)}
            onSave={() => setEditing(false)}
          />
        )}

      </main>

    </div>
  );
}

export default PostPage;