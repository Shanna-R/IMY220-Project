import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Friends({ userId }) {
  const [friends, setFriends] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadFriends() {
      try {
        setLoading(true);
        setError('');

        const response =
          await fetch(
            `/api/users/${userId}/friends`,
            {
              credentials: 'include'
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
            'Unable to load friends.'
          );
        }

        setFriends(
          data.friends || []
        );

      } catch (error) {
        console.error(
          'Error loading friends:',
          error
        );

        setError(
          error.message
        );

      } finally {
        setLoading(false);
      }
    }

    loadFriends();
  }, [userId]);

  if (loading) {
    return (
      <p>
        Loading friends...
      </p>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p>
          {error}
        </p>
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <p>
        No friends to display.
      </p>
    );
  }

  return (
    <section className="friends-grid">

      {friends.map((friend) => (

        <article
          key={friend._id}
          className="card friend-card"
        >

          <div className="avatar">
            {friend.name
              ?.charAt(0)
              ?.toUpperCase()}
          </div>

          <h3>
            {friend.name}
          </h3>

          <p>
            @{friend.username}
          </p>

          <Link
            to={`/users/${friend._id}`}
            className="btn btn-outline"
          >
            View User
          </Link>

        </article>

      ))}

    </section>
  );
}

export default Friends;