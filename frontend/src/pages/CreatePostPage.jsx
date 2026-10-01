import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/Header';

function CreatePostPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    hashtags: ''
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Remove the previous preview URL when a new one is selected.
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  // Let the user choose an image from their device.
  function handleImageChange(event) {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      event.target.value = '';
      return;
    }

    // Limit the original upload to 10 MB.
    if (file.size > 10 * 1024 * 1024) {
      setError('The image must be smaller than 10 MB.');
      event.target.value = '';
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  // Resize and compress the image before sending it to the API.
  function compressImage(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const objectUrl = URL.createObjectURL(file);

      image.onload = () => {
        const maxWidth = 1600;
        const maxHeight = 1600;

        let width = image.width;
        let height = image.height;

        // Keep the original proportions.
        if (width > maxWidth || height > maxHeight) {
          const scale = Math.min(
            maxWidth / width,
            maxHeight / height
          );

          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');

        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error('Could not process this image.'));
          return;
        }

        context.drawImage(image, 0, 0, width, height);

        // Convert to a compressed JPEG data URL.
        const imageData = canvas.toDataURL(
          'image/jpeg',
          0.82
        );

        URL.revokeObjectURL(objectUrl);
        resolve(imageData);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Could not read the selected image.'));
      };

      image.src = objectUrl;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!form.title.trim() || !form.description.trim()) {
      setError('Please enter a title and description.');
      return;
    }

    if (!imageFile) {
      setError('Please select an image for your post.');
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await compressImage(imageFile);

      const hashtags = form.hashtags
        .split(',')
        .map((tag) => tag.trim().replace(/^#/, ''))
        .filter(Boolean);

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          imageUrl,
          hashtags
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not create post.'
        );
      }

      navigate(`/post/${data.post._id}`);
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
          className="card create-post-form"
          onSubmit={handleSubmit}
        >
          <h1>Create Post</h1>

          <p className="form-intro">
            Share a photo from your latest adventure.
          </p>

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          <label htmlFor="title">
            Title
          </label>

          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Give your post a title"
            required
          />

          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="What do you want to share?"
            required
          />

          <label>
            Photo
          </label>

          <div className="upload-area">

            {imagePreview ? (
              <div className="image-preview-container">
                <img
                  src={imagePreview}
                  alt="Selected post preview"
                  className="create-post-image-preview"
                />

                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                  }}
                >
                  Remove Image
                </button>
              </div>
            ) : (
              <>
                <div className="upload-icon">
                  📷
                </div>

                <p>
                  Select a photo from your device.
                </p>

                <p>
                  JPG, PNG or WebP. Maximum 10 MB.
                </p>
              </>
            )}

            <label
              htmlFor="post-image"
              className="btn btn-secondary upload-button"
            >
              {imageFile ? 'Choose Another Image' : 'Choose Image'}
            </label>

            <input
              id="post-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-file-input"
            />

          </div>

          <label htmlFor="hashtags">
            Hashtags
          </label>

          <input
            id="hashtags"
            name="hashtags"
            value={form.hashtags}
            onChange={handleChange}
            placeholder="camping, scouts, adventure"
          />

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Post...' : 'Share Post'}
          </button>

        </form>

      </main>
    </div>
  );
}

export default CreatePostPage;