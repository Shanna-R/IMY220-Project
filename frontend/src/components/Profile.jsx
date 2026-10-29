import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAvatarUrl } from '../assets/avatar';
import VerifiedBadge from './VerifiedBadge';
import VerificationRequest from './VerificationRequest';

function Profile({ profile, onEdit, onFriendUpdated }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [friendLoading, setFriendLoading] = useState(false);
  const [friendError, setFriendError] = useState('');

  if (!profile) {
    return <section className="card profile-card">Loading profile...</section>;
  }

  const isOwnProfile = Boolean(user && user._id === profile._id);
  const canViewFullProfile = isOwnProfile || profile.isFriend;

  // Each user gets a different generated avatar if they have no uploaded image.
  <img
    src={getAvatarUrl(profile)}
    alt={`${profile.name || 'User'}'s profile`}
    className="profile-image profile-avatar"
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src =
        `https://api.dicebear.com/10.x/sprouts/svg?seed=scout`;
    }}
  />

  async function handleFriendAction(endpoint, method, fallbackMessage) {
    try {
      setFriendLoading(true);
      setFriendError('');

      const response = await fetch(endpoint, {
        method,
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || fallbackMessage);
      }

      await onFriendUpdated?.();
    } catch (error) {
      console.error(error);
      setFriendError(error.message);
    } finally {
      setFriendLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  function renderActions() {
    if (isOwnProfile) {
      return (
        <>
          <button type="button" className="btn btn-primary" onClick={onEdit}>
            Edit Profile
          </button>
          <button type="button" className="btn btn-outline" onClick={handleLogout}>
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
          disabled={friendLoading}
          onClick={() =>
            handleFriendAction(
              `/api/users/${profile._id}/friend`,
              'DELETE',
              'Unable to remove friend.'
            )
          }
        >
          {friendLoading ? 'Updating...' : 'Unfriend'}
        </button>
      );
    }

    if (profile.friendRequestReceived) {
      return (
        <button
          type="button"
          className="btn btn-primary"
          disabled={friendLoading}
          onClick={() =>
            handleFriendAction(
              `/api/users/${profile._id}/accept`,
              'POST',
              'Unable to accept friend request.'
            )
          }
        >
          {friendLoading ? 'Updating...' : 'Accept Friend Request'}
        </button>
      );
    }

    if (profile.friendRequestSent) {
      return (
        <button type="button" className="btn btn-outline" disabled>
          Request Sent
        </button>
      );
    }

    return (
      <button
        type="button"
        className="btn btn-primary"
        disabled={friendLoading}
        onClick={() =>
          handleFriendAction(
            `/api/users/${profile._id}/friend-request`,
            'POST',
            'Unable to send friend request.'
          )
        }
      >
        {friendLoading ? 'Sending...' : 'Add Friend'}
      </button>
    );
  }

  return (
    <section className="card profile-card">
      <div className="profile-user-row">
        <img
          src={getAvatarUrl(profile)}
          alt={profile?.name || 'User'}
          className="profile-user-avatar"
        />

        <div className="profile-user-info">
          <h2 className="profile-user-name">
            {profile?.name || 'User'}
            {profile?.verified && <VerifiedBadge />}
          </h2>

          {profile?.username && (
            <p className="profile-user-username">
              @{profile.username}
            </p>
          )}

          {profile?.bio && (
            <p className="profile-user-bio">
              {profile.bio}
            </p>
          )}

          {isOwnProfile && !profile?.verified && <VerificationRequest />}
        </div>
      </div>

      {canViewFullProfile && (
        <div className="profile-stats">
          <div>
            <strong>{profile.postsCount ?? 0}</strong>
            <span>Posts</span>
          </div>

          <div>
            <strong>
              {profile.friendsCount ?? profile.friends?.length ?? 0}
            </strong>
            <span>Friends</span>
          </div>
        </div>
      )}

      {friendError && <p className="form-error">{friendError}</p>}

      <div className="profile-actions">{renderActions()}</div>
    </section>
  );
}

export default Profile;