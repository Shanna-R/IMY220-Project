import { useEffect, useState } from 'react';

import PostPreview from './PostPreview';

function UserPosts({ userId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const response = await fetch(
          `/api/users/${userId}/posts`,
          {
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (response.ok) {
          setPosts(data.posts || []);
        }
      } catch (error) {
        console.error('Error loading user posts:', error);
      } finally {
        setLoading(false);
      }
    }

    loadPosts();
  }, [userId]);

  if (loading) {
    return <p>Loading posts...</p>;
  }

  if (posts.length === 0) {
    return (
      <p>
        This user has not created any posts yet.
      </p>
    );
  }

  return (
    <section className="feed">
      {posts.map((post) => (
        <PostPreview
          key={post._id}
          post={post}
        />
      ))}
    </section>
  );
}

export default UserPosts;