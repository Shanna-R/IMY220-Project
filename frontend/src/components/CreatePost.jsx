import { useState } from 'react';

function CreatePost() {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [hashtags, setHashtags] = useState('');
  const [album, setAlbum] = useState('');

  const [errors, setErrors] = useState({});

  function validate() {
    const newErrors = {};

    if(!caption.trim()) {
      newErrors.caption = 'Caption is required.';
    }

    if(!image) {
      newErrors.image = 'Please select an image.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(event) {
    event.preventDefault();

    if(!validate()) {
      return;
    }

    alert('Post created successfully!');

    setCaption('');
    setImage(null);
    setHashtags('');
    setAlbum('');
  }

  return (
    <form
      className="card create-post-form"
      onSubmit={handleSubmit}
    >

      <h1>Share Your Adventure</h1>

      <p>
        Publish campfires, hiking routes,
        and new scouting memories.
      </p>

      <label>Adventure Photo</label>

      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={(event) =>
          setImage(event.target.files[0])
        }
      />

      {errors.image && (
        <p className="form-error">
          {errors.image}
        </p>
      )}

      <label>Caption</label>

      <textarea
        value={caption}
        onChange={(event) =>
          setCaption(event.target.value)
        }
        placeholder="Tell the troop about your adventure..."
      />

      {errors.caption && (
        <p className="form-error">
          {errors.caption}
        </p>
      )}

      <label>Hashtags</label>

      <input
        value={hashtags}
        onChange={(event) =>
          setHashtags(event.target.value)
        }
        placeholder="#Camping #Hiking"
      />

      <label>Add to Album</label>

      <select
        value={album}
        onChange={(event) =>
          setAlbum(event.target.value)
        }
      >
        <option value="">
          Select Album
        </option>

        <option value="summer">
          Summer Camp 2025
        </option>

        <option value="winter">
          Winter Camp 2026
        </option>
      </select>

      <button
        type="submit"
        className="btn btn-primary"
      >
        Post
      </button>

    </form>
  );
}

export default CreatePost;