import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

function EditProfilePage() {
  const { user, checkLogin } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    location: '',
    profileImage: ''
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/users/${user._id}`,
          {
            credentials: 'include'
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || 'Could not load user.'
          );
        }

        const currentUser = data.user;

        setForm({
          name: currentUser.name || '',
          username: currentUser.username || '',
          bio: currentUser.bio || '',
          location: currentUser.location || '',
          profileImage: currentUser.profileImage || ''
        });
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadUser();
    }
  }, [user]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/users/${user._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not update user.'
        );
      }

      await checkLogin();

      setMessage(
        'User information updated successfully.'
      );

      setTimeout(() => {
        navigate(`/users/${user._id}`);
      }, 500);
    } catch (error) {
      setError(error.message);
    }
  }

  if (loading) {
    return (
      <>
        <Header />

        <main className="container">
          <p className="loading">
            Loading user...
          </p>
        </main>
      </>
    );
  }

  return (
    <div className="page">

      <Header />

      <main className="container">

        <form
          onSubmit={handleSubmit}
          className="card edit-profile"
        >

          <h1>
            Edit User
          </h1>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {message && (
            <p className="success-message">
              {message}
            </p>
          )}

          <label>
            Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <label>
            Username
          </label>

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <label>
            Bio
          </label>

          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
          />

          <label>
            Location
          </label>

          <input
            name="location"
            value={form.location}
            onChange={handleChange}
          />

          <label>
            User Image URL
          </label>

          <input
            name="profileImage"
            value={form.profileImage}
            onChange={handleChange}
            placeholder="/images/profile.jpg"
          />

          <div className="edit-profile-actions">

            <button
              type="submit"
              className="btn btn-primary"
            >
              Save Changes
            </button>

            <button
              type="button"
              className="btn btn-outline"
              onClick={() =>
                navigate(`/users/${user._id}`)
              }
            >
              Cancel
            </button>

          </div>

        </form>

      </main>

    </div>
  );
}

export default EditProfilePage;