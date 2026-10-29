import { useEffect, useState } from 'react';

const MAX_IMAGE_SIZE = 800;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

function EditProfile({ user, onCancel, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    location: user?.location || '',
    profileImage: user?.profileImage || ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      location: user?.location || '',
      profileImage: user?.profileImage || ''
    });
  }, [user]);

  function handleChange(field, value) {
    setForm(previous => ({ ...previous, [field]: value }));
  }

  async function processImage(file) {
    setError('');

    if (!file || !file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('Choose an image smaller than 10 MB.');
      return;
    }

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Could not read image.'));
        reader.readAsDataURL(file);
      });

      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Could not open image.'));
        img.src = dataUrl;
      });

      const scale = Math.min(
        1,
        MAX_IMAGE_SIZE / image.width,
        MAX_IMAGE_SIZE / image.height
      );

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext('2d');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      // Store a smaller JPEG data URL in the profile.
      const compressedImage = canvas.toDataURL('image/jpeg', 0.8);
      handleChange('profileImage', compressedImage);
    } catch (imageError) {
      setError(imageError.message || 'Could not process image.');
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    processImage(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch(`/api/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unable to save profile.');
      }

      await onSaved?.(data.user);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card edit-profile" onSubmit={handleSubmit}>
      <h1>Edit Profile</h1>

      {error && <p className="form-error">{error}</p>}

      <label htmlFor="profile-name">Name</label>
      <input
        id="profile-name"
        value={form.name}
        onChange={event => handleChange('name', event.target.value)}
        required
        maxLength={80}
      />

      <label htmlFor="profile-username">Username</label>
      <input
        id="profile-username"
        value={form.username}
        onChange={event => handleChange('username', event.target.value)}
        required
        maxLength={30}
      />

      <label htmlFor="profile-bio">Bio</label>
      <textarea
        id="profile-bio"
        value={form.bio}
        onChange={event => handleChange('bio', event.target.value)}
        rows={4}
        maxLength={500}
      />

      <label htmlFor="profile-location">Location</label>
      <input
        id="profile-location"
        value={form.location}
        onChange={event => handleChange('location', event.target.value)}
        maxLength={100}
      />

      <label htmlFor="profile-image-url">Profile image URL</label>
      <input
        id="profile-image-url"
        type="url"
        value={form.profileImage.startsWith('data:') ? '' : form.profileImage}
        onChange={event => handleChange('profileImage', event.target.value)}
        placeholder="Paste an image URL"
      />

      <div
        className={`image-drop-zone ${dragging ? 'dragging' : ''}`}
        onDragOver={event => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        <p>Drag and drop an image here, or choose a file below.</p>

        <input
          type="file"
          accept="image/*"
          onChange={event => processImage(event.target.files?.[0])}
        />

        {form.profileImage && (
          <img
            src={form.profileImage}
            alt="Profile preview"
            className="profile-image image-preview"
          />
        )}
      </div>

      <div className="profile-actions">
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
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}

export default EditProfile;