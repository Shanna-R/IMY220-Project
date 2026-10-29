import { useState } from 'react';
import { getAvatarUrl } from '../assets/avatar';

function UserAvatar({ user, className = 'user-avatar' }) {
  const [imageFailed, setImageFailed] = useState(false);

  const avatarUser = imageFailed
    ? { _id: user?._id || user?.name || 'scout' }
    : user;

  return (
    <img
      src={getAvatarUrl(avatarUser)}
      alt={user?.name || 'User'}
      className={className}
      onError={() => setImageFailed(true)}
    />
  );
}

export default UserAvatar;