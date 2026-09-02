import { Link } from 'react-router-dom';

function ProfilePreview({
  user,
  actionLabel = 'Add Friend'
}) {
  return (
    <div className="card profile-preview">

      <div className="avatar">
        👤
      </div>

      <div className="profile-preview-info">
        <Link to={`/profile/${user.id}`}>
          <strong>{user.name}</strong>
        </Link>

        <p>{user.troop}</p>

        <small>
          {user.mutualFriends} mutual friends
        </small>
      </div>

      <button className="btn btn-primary">
        {actionLabel}
      </button>

    </div>
  );
}

export default ProfilePreview;