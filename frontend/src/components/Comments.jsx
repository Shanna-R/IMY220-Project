import { useEffect, useState } from 'react';

import { useAuth } from '../context/AuthContext';

function Comments({ postId }) {
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');

  const [error, setError] = useState('');

  async function loadComments() {
    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not load comments.'
        );
      }

      setComments(data.comments || []);
    } catch (error) {
      setError(error.message);
    }
  }

  useEffect(() => {
    loadComments();
  }, [postId]);

  async function addComment(event) {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            text
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not add comment.'
        );
      }

      setText('');

      loadComments();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteComment(commentId) {
    try {
      const response = await fetch(
        `/api/comments/${commentId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not delete comment.'
        );
      }

      loadComments();
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <section >
      <h2>
        Comments
      </h2>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <form onSubmit={addComment}>
        <label htmlFor="comment-text">
          Add a comment
        </label>

        <textarea
          id="comment-text"
          value={text}
          onChange={(event) =>
            setText(event.target.value)
          }
          placeholder="Write a comment..."
        />

        <button
          type="submit"
          className="btn"
        >
          Comment
        </button>
      </form>

      <div className="comments-list">
        {comments.length === 0 ? (
          <p>
            No comments yet.
          </p>
        ) : (
          comments.map((comment) => (
            <article
              className="comment"
              key={comment._id}
            >
              <strong>
                {comment.author?.name ||
                  'Unknown User'}
              </strong>

              <p>
                {comment.text}
              </p>

              {comment.userId === user?._id && (
                <button
                  className="btn btn-outline"
                  onClick={() =>
                    deleteComment(comment._id)
                  }
                >
                  Delete
                </button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default Comments;