import { Navigate, Route, Routes } from 'react-router-dom';

import Splash from './pages/Splash';
import Home from './pages/Home';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import SearchPage from './pages/SearchPage';
import FriendsPage from './pages/FriendsPage';
import CreatePostPage from './pages/CreatePostPage';
import EditProfilePage from './pages/EditProfilePage';

import AlbumsPage from './pages/AlbumsPage';
import AlbumPage from './pages/AlbumPage';
import CreateAlbumPage from './pages/CreateAlbumPage';
import AdminPage from './pages/AdminPage';

import AdminProtectedRoute from './components/AdminProtectedRoute';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Splash />} />

      {/* Protected */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/:id"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/post/:id"
        element={
          <ProtectedRoute>
            <PostPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/friends"
        element={
          <ProtectedRoute>
            <FriendsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-post"
        element={
          <ProtectedRoute>
            <CreatePostPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/albums"
        element={
          <ProtectedRoute>
            <AlbumsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/album/:id"
        element={
          <ProtectedRoute>
            <AlbumPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/create-album"
        element={
          <ProtectedRoute>
            <CreateAlbumPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
            <AdminProtectedRoute>
                <AdminPage />
            </AdminProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;