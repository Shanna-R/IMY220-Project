import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import Header from '../components/Header';
import Profile from '../components/Profile';
import UserPosts from '../components/UserPosts';
import Friends from '../components/Friends';
import EditProfile from '../components/EditProfile';

function ProfilePage() {
  const { id } = useParams();

  const { user } = useAuth();

  const [profile, setProfile] =
    useState(null);

  const [activeTab, setActiveTab] =
    useState('posts');

  const [editing, setEditing] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');

      const response =
        await fetch(
          `/api/users/${id}`,
          {
            credentials: 'include'
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Unable to load user.'
        );
      }

      setProfile(data.user);

    } catch (error) {
      console.error(
        'Could not load user:',
        error
      );

      setError(
        error.message
      );

    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="container">

            <div className="loading">
              Loading User...
            </div>

          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="container">

            <div className="card">
              <p>{error}</p>
            </div>

          </div>
        </main>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="container">

            <div className="card">
              <p>
                User not found.
              </p>
            </div>

          </div>
        </main>
      </>
    );
  }

  const isOwnProfile =
    user &&
    user._id === profile._id;

  const canViewFriends =
    isOwnProfile ||
    profile.isFriend;

  /*
    Show the edit form instead of
    the normal User information.
  */

  if (editing && isOwnProfile) {
    return (
      <>
        <Header />

        <main className="page">
          <div className="container">

            <EditProfile
              user={profile}

              onCancel={() =>
                setEditing(false)
              }

              onSaved={async () => {
                await loadProfile();
                setEditing(false);
              }}
            />

          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="page">
        <div className="container">

          <Profile
            profile={profile}

            onEdit={() =>
              setEditing(true)
            }

            onFriendUpdated={
              loadProfile
            }
          />

          <div className="profile-tabs">

            <button
              type="button"
              className={
                activeTab === 'posts'
                  ? 'active'
                  : ''
              }
              onClick={() =>
                setActiveTab('posts')
              }
            >
              Posts
            </button>

            {canViewFriends && (
              <button
                type="button"
                className={
                  activeTab === 'friends'
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setActiveTab('friends')
                }
              >
                Friends
              </button>
            )}

          </div>

          {activeTab === 'posts' && (
            <UserPosts
              userId={id}
            />
          )}

          {activeTab === 'friends' &&
            canViewFriends && (
              <Friends
                userId={id}
              />
            )}

        </div>
      </main>
    </>
  );
}

export default ProfilePage;