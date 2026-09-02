import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import Header from '../components/Header';
import Post from '../components/Post';
import Comments from '../components/Comments';
import EditPost from '../components/EditPost';

function PostPage() {
  const { id } = useParams();

  const [editing, setEditing] =
    useState(false);

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
            <Post />

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