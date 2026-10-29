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
          data.message || 'Could not load comments.'
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
          data.message || 'Could not add comment.'
        );
      }

      setText('');

      loadComments();
    } catch (error) {
      setError(error.message);
    }
  }

  async function deleteComment(commentId) {
  setError('');

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
        data.message || 'Could not delete comment.'
      );
    }

    await loadComments();
  } catch (error) {
    setError(error.message);
  }
}

  
  return (
    <section className="comments">
      <h2>Comments</h2>

      {error && (
        <p className="form-error">{error}</p>
      )}

      {/* Existing comments */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <article className="comment" key={comment._id}>
              <div className="comment-content">
                <strong className="comment-username">
                  @{comment.author?.username || 'unknown'}
                </strong>

                <p>{comment.text}</p>

                {comment.authorId === user?._id && (
                  <button
                    type="button"
                    className="comment-delete"
                    onClick={() => deleteComment(comment._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {/* Add comment at the bottom */}
      <form className="comment-form" onSubmit={addComment}>
        <textarea
          id="comment-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add a comment..."
          rows={1}
        />

        <button
          type="submit"
          className="comment-submit"
          disabled={!text.trim()}
        >
          Post
        </button>
      </form>
    </section>
  );

}

export default Comments;