import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Header from '../components/Header';

function FriendsPage() {
  const [data, setData] = useState({
    friends: [],
    received: [],
    sent: []
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadFriends() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        '/api/friends',
        {
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          'Could not load friends.'
        );
      }

      setData({
        friends: result.friends || [],
        received: result.received || [],
        sent: result.sent || []
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFriends();
  }, []);

  async function accept(id) {
    try {
      setError('');

      const response = await fetch(
        `/api/users/${id}/accept`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          'Could not accept request.'
        );
      }

      loadFriends();
    } catch (error) {
      setError(error.message);
    }
  }

  async function decline(id) {
    try {
      setError('');

      const response = await fetch(
        `/api/users/${id}/decline`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          'Could not decline request.'
        );
      }

      loadFriends();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="page">

      <Header />

      <main className="container">

        <h1 className="page-title">
          Friends
        </h1>

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        {loading ? (
          <p className="loading">
            Loading friends...
          </p>
        ) : (
          <>

            <section className="friends-section">

              <h2>
                Friend Requests
              </h2>

              {data.received.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No pending requests.
                  </p>
                </div>
              ) : (
                <div className="friends-grid">

                  {data.received.map((person) => (
                    <article
                      className="card friend-card"
                      key={person._id}
                    >

                      <div className="avatar">
                        {person.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <h3>
                        {person.name}
                      </h3>

                      <p>
                        @{person.username}
                      </p>

                      <div className="friend-actions">

                        <Link
                          to={`/users/${person._id}`}
                          className="btn btn-outline"
                        >
                          View
                        </Link>

                        <button
                          className="btn btn-success"
                          onClick={() =>
                            accept(person._id)
                          }
                        >
                          Accept
                        </button>

                        <button
                          className="btn btn-danger"
                          onClick={() =>
                            decline(person._id)
                          }
                        >
                          Decline
                        </button>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </section>


            <section className="friends-section">

              <h2>
                Your Friends
              </h2>

              {data.friends.length === 0 ? (
                <div className="empty-state">
                  <p>
                    You don't have any friends yet.
                  </p>
                </div>
              ) : (
                <div className="friends-grid">

                  {data.friends.map((friend) => (
                    <article
                      className="card friend-card"
                      key={friend._id}
                    >

                      <div className="avatar">
                        {friend.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </div>

                      <h3>
                        {friend.name}
                      </h3>

                      <p>
                        @{friend.username}
                      </p>

                      <div className="friend-actions">

                        <Link
                          to={`/users/${friend._id}`}
                          className="btn btn-outline"
                        >
                          View User
                        </Link>

                      </div>

                    </article>
                  ))}

                </div>
              )}

            </section>

          </>
        )}

      </main>

    </div>
  );
}

export default FriendsPage;