import { Routes, Route } from 'react-router-dom';

import Splash from './pages/Splash';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import SearchPage from './pages/SearchPage';
import FriendsPage from './pages/FriendsPage';
import CreatePostPage from './pages/CreatePostPage';
import EditProfilePage from './pages/EditProfilePage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/home" element={<Home />} />
      <Route path="/profile/:id" element={<ProfilePage />} />
      <Route path="/post/:id" element={<PostPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/create-post" element={<CreatePostPage />} />
      <Route path="/edit-profile" element={<EditProfilePage />} />
    </Routes>
  );
}

export default App;