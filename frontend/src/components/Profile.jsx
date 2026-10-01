import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Profile({
  profile,
  onEdit,
  onFriendUpdated
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [friendLoading, setFriendLoading] =
    useState(false);

  const [friendError, setFriendError] =
    useState('');

  if (!profile) {
    return (
      <section className="card profile-card">
        <p>Loading User...</p>
      </section>
    );
  }

  const isOwnProfile =
    user &&
    user._id === profile._id;

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  async function sendFriendRequest() {
    try {
      setFriendLoading(true);
      setFriendError('');

      const response = await fetch(
        `/api/users/${profile._id}/friend-request`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Unable to send friend request.'
        );
      }

      await onFriendUpdated();
    } catch (error) {
      console.error(
        'Could not send friend request:',
        error
      );

      setFriendError(error.message);
    } finally {
      setFriendLoading(false);
    }
  }

  async function acceptFriendRequest() {
    try {
      setFriendLoading(true);
      setFriendError('');

      const response = await fetch(
        `/api/users/${profile._id}/accept`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Unable to accept friend request.'
        );
      }

      await onFriendUpdated();
    } catch (error) {
      console.error(
        'Could not accept friend request:',
        error
      );

      setFriendError(error.message);
    } finally {
      setFriendLoading(false);
    }
  }

  async function unfriend() {
    try {
      setFriendLoading(true);
      setFriendError('');

      const response = await fetch(
        `/api/users/${profile._id}/friend`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Unable to unfriend User.'
        );
      }

      await onFriendUpdated();
    } catch (error) {
      console.error(
        'Could not unfriend User:',
        error
      );

      setFriendError(error.message);
    } finally {
      setFriendLoading(false);
    }
  }

  function renderFriendButton() {
    if (isOwnProfile) {
      return (
        <>
          <button
            type="button"
            className="btn btn-primary"
            onClick={onEdit}
          >
            Edit User
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleLogout}
          >
            Logout
          </button>
        </>
      );
    }

    if (profile.isFriend) {
      return (
        <button
          type="button"
          className="btn btn-outline"
          onClick={unfriend}
          disabled={friendLoading}
        >
          {friendLoading
            ? 'Updating...'
            : 'Unfriend'}
        </button>
      );
    }

    if (profile.friendRequestReceived) {
      return (
        <button
          type="button"
          className="btn btn-primary"
          onClick={acceptFriendRequest}
          disabled={friendLoading}
        >
          {friendLoading
            ? 'Updating...'
            : 'Accept Friend Request'}
        </button>
      );
    }

    if (profile.friendRequestSent) {
      return (
        <button
          type="button"
          className="btn btn-outline"
          disabled
        >
          Request Sent
        </button>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-primary"
        onClick={sendFriendRequest}
        disabled={friendLoading}
      >
        {friendLoading
          ? 'Sending...'
          : 'Add Friend'}
      </button>
    );
  }

  return (
    <section className="card profile-card">

      <div className="profile-header">

        <div className="avatar profile-avatar">
          {profile.name
            ? profile.name.charAt(0).toUpperCase()
            : '?'}
        </div>

        <div className="profile-info">

          <h1>{profile.name}</h1>

          {profile.username && (
            <p className="profile-username">
              @{profile.username}
            </p>
          )}

          {profile.location && (
            <p>{profile.location}</p>
          )}

          {profile.bio && (
            <p>{profile.bio}</p>
          )}

        </div>

      </div>

      <div className="profile-stats">

        <div>
          <strong>
            {profile.postsCount || 0}
          </strong>
          <span>Posts</span>
        </div>

        <div>
          <strong>
            {profile.friendsCount ||
              profile.friends?.length ||
              0}
          </strong>
          <span>Friends</span>
        </div>

      </div>

      {friendError && (
        <p className="form-error">
          {friendError}
        </p>
      )}

      <div className="profile-actions">
        {renderFriendButton()}
      </div>

    </section>
  );
}

export default Profile;