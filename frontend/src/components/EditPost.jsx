import { useState } from 'react';

function EditPost({ onCancel, onSave }) {
  const [description, setDescription] =
    useState(
      'We had an amazing winter camp and spent the weekend hiking through the mountains.'
    );

  const [hashtags, setHashtags] =
    useState(
      '#Camping #Hiking #Adventure'
    );

  function handleSubmit(event) {
    event.preventDefault();

    onSave({
      description,
      hashtags
    });
  }

  return (
    <form
      className="card"
      style={{
        padding: '20px',
        maxWidth: '600px',
        margin: '20px auto'
      }}
      onSubmit={handleSubmit}
    >

      <h2>Edit Post</h2>

      <label>Description</label>

      <textarea
        value={description}
        onChange={(event) =>
          setDescription(event.target.value)
        }
        style={{
          width: '100%',
          minHeight: '120px',
          padding: '10px'
        }}
      />

      <label>Hashtags</label>

      <input
        value={hashtags}
        onChange={(event) =>
          setHashtags(event.target.value)
        }
        style={{
          width: '100%',
          padding: '10px'
        }}
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
        >
          Cancel
        </button>

        <button
          className="btn btn-primary"
          type="submit"
        >
          Save Changes
        </button>
      </div>

    </form>
  );
}

export default EditPost;