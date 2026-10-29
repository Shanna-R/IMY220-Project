export function getAvatarUrl(user) {
  const seed = user?._id || user?.name || 'scout';

  return (
    user?.profileImage ||
    `https://api.dicebear.com/10.x/sprouts/svg?tags=animation&seed=${encodeURIComponent(seed)}`
  );
}