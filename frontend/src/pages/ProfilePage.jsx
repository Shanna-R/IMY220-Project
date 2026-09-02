import { useState } from 'react';
import { useParams } from 'react-router-dom';

import Header from '../components/Header';
import Profile from '../components/Profile';
import UserPosts from '../components/UserPosts';
import Friends from '../components/Friends';

function ProfilePage() {
  const { id } = useParams();

  const [tab, setTab] = useState('posts');

  return (
    <div>

      <Header />

      <main className="container">

        <Profile
          onEdit={() => setTab('edit')}
        />

        <div className="profile-tabs">

          <button
            className={tab === 'posts' ? 'active' : ''}
            onClick={() => setTab('posts')}
          >
            Posts
          </button>

          <button
            className={tab === 'friends' ? 'active' : ''}
            onClick={() => setTab('friends')}
          >
            Friends
          </button>

          <button
            onClick={() => setTab('edit')}
          >
            Edit Profile
          </button>

        </div>

        {tab === 'posts' && <UserPosts />}

        {tab === 'friends' && <Friends />}

        {tab === 'edit' && (
          <p>
            Use the Edit Profile page to update
            your profile information.
          </p>
        )}

      </main>

    </div>
  );
}

export default ProfilePage;