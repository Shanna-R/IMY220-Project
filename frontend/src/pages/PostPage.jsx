import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import Header from '../components/Header';
import Post from '../components/Post';
import Comments from '../components/Comments';
import { useAuth } from '../context/AuthContext';

function PostPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [editing, setEditing] = useState(false);

  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState('');

  const [reportReason, setReportReason] = useState('');
  const [reportReasons, setReportReasons] = useState([]);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  async function loadPost() {
    try {
      setError('');

      const response = await fetch(
        `/api/posts/${id}`,
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not load post.'
        );
      }

      setPost(data.post);
      setDescription(data.post.description || '');
      setHashtags(
        data.post.hashtags?.join(', ') || ''
      );
    } catch (error) {
      setError(error.message);
    }
  }

  async function loadReportReasons() {
    try {
      const response = await fetch(
        '/api/report-reasons',
        {
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not load report reasons.'
        );
      }

      setReportReasons(data.reasons || []);
    } catch (error) {
      console.error(
        'Could not load report reasons:',
        error
      );
    }
  }

  useEffect(() => {
    loadPost();
    loadReportReasons();
  }, [id]);

  async function updatePost(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `/api/posts/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            description,
            hashtags: hashtags
              .split(',')
              .map((tag) =>
                tag.trim().replace(/^#/, '')
              )
              .filter(Boolean)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not update post.'
        );
      }

      setPost(data.post);
      setEditing(false);
      setMessage('Post updated successfully.');
    } catch (error) {
      setError(error.message);
    }
  }

  async function deletePost() {
    const confirmed = window.confirm(
      'Are you sure you want to delete this post?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const response = await fetch(
        `/api/posts/${id}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not delete post.'
        );
      }

      navigate('/home');
    } catch (error) {
      setError(error.message);
    }
  }

  async function reportPost(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!reportReason) {
      setError('Please select a report reason.');
      return;
    }

    try {
      const response = await fetch(
        `/api/posts/${id}/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            reason: reportReason
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Could not report post.'
        );
      }

      setMessage(
        'Thank you. The post has been reported.'
      );

      setReportReason('');
    } catch (error) {
      setError(error.message);
    }
  }

  if (!post) {
    return (
      <>
        <Header />

        <main className="container">

          {error ? (
            <p className="form-error">
              {error}
            </p>
          ) : (
            <p className="loading">
              Loading post...
            </p>
          )}

        </main>
      </>
    );
  }

  const ownPost =
    user?._id === post.authorId;

  return (
    <div className="page">

      <Header />

      <main className="container">

        <div className="post-page">

          <Link
            to="/home"
            className="btn btn-outline"
          >
            ← Back to Feed
          </Link>

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

          {!editing ? (
            <>

              <Post post={post} />

              {ownPost && (
                <div className="post-edit-actions">

                  <button
                    className="btn btn-secondary"
                    onClick={() => setEditing(true)}
                  >
                    Edit Post
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={deletePost}
                  >
                    Delete Post
                  </button>

                </div>
              )}

              <Comments postId={id} />
              <br/>
              <br/>

              {!ownPost && (
                <form
                  
                  onSubmit={reportPost}
                >
                  <h3 className="section-title">
                    Report Post
                  </h3>

                  <label>
                    Reason
                  </label>

                  <select
                    value={reportReason}
                    onChange={(event) =>
                      setReportReason(event.target.value)
                    }
                  >
                    <option value="">
                      Select a reason
                    </option>

                    {reportReasons.map((reason) => (
                      <option
                        key={reason}
                        value={reason}
                      >
                        {reason}
                      </option>
                    ))}
                  </select>

                  <button
                    type="submit"
                    className="btn btn-danger"
                  >
                    Report
                  </button>
                </form>
              )}

              

            </>
          ) : (

            <form
              className="card create-post-form"
              onSubmit={updatePost}
            >

              <h1>
                Edit Post
              </h1>

              <label>
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />

              <label>
                Hashtags
              </label>

              <input
                value={hashtags}
                onChange={(event) =>
                  setHashtags(event.target.value)
                }
              />

              <p>
                The image cannot be changed when editing
                a post.
              </p>

              <button
                type="submit"
                className="btn btn-primary"
              >
                Save Changes
              </button>

              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>

            </form>

          )}

        </div>

      </main>

    </div>
  );
}

export default PostPage;