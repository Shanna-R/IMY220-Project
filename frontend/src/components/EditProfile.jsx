import { useState } from 'react';

function EditProfile({
  user,
  onCancel,
  onSaved
}) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profileImage: user?.profileImage || ''
  });

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [message, setMessage] =
    useState('');

  function handleChange(field, value) {
    setForm({
      ...form,
      [field]: value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const response =
        await fetch(
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

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Unable to save User changes.'
        );
      }

      setMessage(
        'User changes saved.'
      );

      if (onSaved) {
        onSaved(data.user);
      }

    } catch (error) {
      console.error(
        'Edit User error:',
        error
      );

      setError(
        error.message
      );

    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      className="card edit-profile"
      onSubmit={handleSubmit}
    >

      <h1>
        Edit User Settings
      </h1>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      {message && (
        <p className="form-message">
          {message}
        </p>
      )}

      <label>
        Name
      </label>

      <input
        type="text"
        value={form.name}
        onChange={(event) =>
          handleChange(
            'name',
            event.target.value
          )
        }
        required
      />

      <label>
        Username
      </label>

      <input
        type="text"
        value={form.username}
        onChange={(event) =>
          handleChange(
            'username',
            event.target.value
          )
        }
        required
      />

      <label>
        Bio
      </label>

      <textarea
        value={form.bio}
        onChange={(event) =>
          handleChange(
            'bio',
            event.target.value
          )
        }
        rows="4"
      />

      <label>
        Location
      </label>

      <input
        type="text"
        value={form.location}
        onChange={(event) =>
          handleChange(
            'location',
            event.target.value
          )
        }
      />

      <label>
        Profile Image URL
      </label>

      <input
        type="text"
        value={form.profileImage}
        onChange={(event) =>
          handleChange(
            'profileImage',
            event.target.value
          )
        }
        placeholder="Optional image URL"
      />

      <div
        style={{
          marginTop: '15px',
          display: 'flex',
          gap: '10px'
        }}
      >

        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={saving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={saving}
        >
          {saving
            ? 'Saving...'
            : 'Save Changes'}
        </button>

      </div>

    </form>
  );
}

export default EditProfile;