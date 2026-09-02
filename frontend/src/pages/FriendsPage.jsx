import Header from '../components/Header';
import ProfilePreview from '../components/ProfilePreview';

const requests = [
  {
    id: 10,
    name: 'Taylor Green',
    troop: 'Pretoria Scouts • South Africa',
    mutualFriends: 3
  },
  {
    id: 11,
    name: 'Jamie Smith',
    troop: 'Centurion Scouts • South Africa',
    mutualFriends: 5
  }
];

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
  }
];

function FriendsPage() {
  return (
    <div>

      <Header />

      <main className="container">

        <h1 className="page-title">
          Friends
        </h1>

        <h2>Friend Requests (2)</h2>

        {requests.map((user) => (
          <ProfilePreview
            key={user.id}
            user={user}
            actionLabel="Accept"
          />
        ))}

        <h2>My Friends</h2>

        {friends.map((user) => (
          <ProfilePreview
            key={user.id}
            user={user}
            actionLabel="Remove Friend"
          />
        ))}

        <h2>Suggested Scouts</h2>

        <ProfilePreview
          user={{
            id: 20,
            name: 'Jordan Lee',
            troop: 'Cape Town Scouts',
            mutualFriends: 4
          }}
          actionLabel="Add Friend"
        />

      </main>

    </div>
  );
}

export default FriendsPage;