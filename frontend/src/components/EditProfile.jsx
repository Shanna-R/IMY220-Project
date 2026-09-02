import { useState } from 'react';

function EditProfile() {
  const [form, setForm] = useState({
    fullName: 'Shanna Reinecke',
    bio: 'Hiking enthusiast and Patrol Leader.',
    username: '@shanna',
    troop: '8th Pretoria St Albans',
    activity: 'Camping',
    pronouns: 'She / Her',
    website: 'https://troop.org'
  });

  function handleChange(field, value) {
    setForm({
      ...form,
      [field]: value
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    alert('Profile changes saved!');
  }

  return (
    <form
      className="card edit-profile"
      onSubmit={handleSubmit}
    >

      <h1>Edit Profile Settings</h1>

      <label>Full Name</label>
      <input
        value={form.fullName}
        onChange={(e) =>
          handleChange('fullName', e.target.value)
        }
      />

      <label>Bio</label>
      <textarea
        value={form.bio}
        onChange={(e) =>
          handleChange('bio', e.target.value)
        }
      />

      <label>Username</label>
      <input
        value={form.username}
        onChange={(e) =>
          handleChange('username', e.target.value)
        }
      />

      <label>Troop</label>
      <input
        value={form.troop}
        onChange={(e) =>
          handleChange('troop', e.target.value)
        }
      />

      <label>Favourite Activity</label>
      <input
        value={form.activity}
        onChange={(e) =>
          handleChange('activity', e.target.value)
        }
      />

      <label>Pronouns</label>
      <input
        value={form.pronouns}
        onChange={(e) =>
          handleChange('pronouns', e.target.value)
        }
      />

      <label>Troop Website Link</label>
      <input
        value={form.website}
        onChange={(e) =>
          handleChange('website', e.target.value)
        }
      />

      <button
        type="submit"
        className="btn btn-primary"
      >
        Save Changes
      </button>

    </form>
  );
}

export default EditProfile;