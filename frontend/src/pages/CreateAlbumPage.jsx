import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/Header';

function CreateAlbumPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    description: '',
    hashtags: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!form.name.trim()) {
      setError('Please enter an album name.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        '/api/albums',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            hashtags: form.hashtags
              .split(',')
              .map((tag) =>
                tag.trim().replace(/^#/, '')
              )
              .filter(Boolean),
            postIds: []
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not create album.'
        );
      }

      navigate(`/album/${data.album._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">

      <Header />

      <main className="container">

        <form
          className="card edit-profile"
          onSubmit={handleSubmit}
        >

          <h1>
            Create Album
          </h1>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <label>
            Album Name
          </label>

          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Summer Camp"
          />

          <label>
            Description
          </label>

          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Album description"
          />

          <label>
            Hashtags
          </label>

          <input
            name="hashtags"
            value={form.hashtags}
            onChange={handleChange}
            placeholder="camping, scouts"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading
              ? 'Creating...'
              : 'Create Album'}
          </button>

        </form>

      </main>

    </div>
  );
}

export default CreateAlbumPage;