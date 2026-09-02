import ProfilePreview from './ProfilePreview';

const friends = [
  {
    id: 2,
    name: 'Jemma Smith',
    troop: '8th Pretoria • South Africa',
    mutualFriends: 12
  },
  {
    id: 3,
    name: 'Alex Brown',
    troop: 'Troop 17 • South Africa',
    mutualFriends: 8
  },
  {
    id: 4,
    name: 'Sam Jones',
    troop: 'Cape Town Scouts • South Africa',
    mutualFriends: 4
  }
];

function Friends() {
  return (
    <div className="friends-list">
      {friends.map((friend) => (
        <ProfilePreview
          key={friend.id}
          user={friend}
          actionLabel="Remove Friend"
        />
      ))}
    </div>
  );
}

export default Friends;