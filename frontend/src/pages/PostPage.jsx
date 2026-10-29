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

            const response = await fetch(`/api/posts/${id}`, {
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Could not load post.');
            }

            setPost(data.post);
            setDescription(data.post.description || '');
            setHashtags(data.post.hashtags?.join(', ') || '');
        } catch (err) {
            setError(err.message);
        }
    }

    async function loadReportReasons() {
        try {
            const response = await fetch('/api/report-reasons', {
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not load report reasons.');
            }

            setReportReasons(data.reasons || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        }
    }

    useEffect(() => {
        loadPost();
    }, [id]);

    useEffect(() => {
        loadReportReasons();
    }, []);

    async function updatePost(event) {
        event.preventDefault();

        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/posts/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    description,
                    hashtags: hashtags
                        .split(',')
                        .map(tag => tag.trim().replace(/^#/, ''))
                        .filter(Boolean)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Could not update post.');
            }

            setPost(data.post);
            setEditing(false);
            setMessage('Post updated successfully.');
        } catch (err) {
            setError(err.message);
        }
    }

    async function deletePost() {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            setError('');

            const response = await fetch(`/api/posts/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Could not delete post.');
            }

            navigate('/home');
        } catch (err) {
            setError(err.message);
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
            const response = await fetch(`/api/posts/${id}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason: reportReason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Could not report post.');
            }

            setMessage('Thank you. The post has been reported.');
            setReportReason('');
        } catch (err) {
            setError(err.message);
        }
    }

    if (!post) {
        return (
            <>
                <Header />
                <main className="container">
                    {error ? (
                        <p className="form-error">{error}</p>
                    ) : (
                        <p className="loading">Loading post...</p>
                    )}
                </main>
            </>
        );
    }

    const ownPost = user?._id === post.authorId;

    return (
        <div className="page">
            <Header />

            <main className="container">
                <div className="post-page">
                    <Link to="/home" className="btn btn-outline">
                        ← Back to Feed
                    </Link>

                    {error && <p className="form-error">{error}</p>}
                    {message && <p className="success-message">{message}</p>}

                    {!editing ? (
                        <>
                            <Post post={post} />

                            <section className="post-albums">
                              <h3>Albums</h3>

                              {post.albums?.length > 0 ? (
                                  <div className="post-albums-list">
                                      {post.albums.map(album => (
                                          <Link
                                              key={album._id}
                                              to={`/album/${album._id}`}
                                              className="post-album-link"
                                          >
                                              {album.name}
                                          </Link>
                                      ))}
                                  </div>
                              ) : (
                                  <p>This post does not belong to any albums yet.</p>
                              )}
                          </section>

                            {ownPost && (
                                <div className="post-edit-actions">
                                    <button className="btn btn-secondary" onClick={() => setEditing(true)}>
                                        Edit Post
                                    </button>
                                    <button className="btn btn-danger" onClick={deletePost}>
                                        Delete Post
                                    </button>
                                </div>
                            )}

                            <Comments postId={id} />

                            <br />
                            <br />

                            {!ownPost && (
                                <form onSubmit={reportPost}>
                                    <h3 className="section-title">Report Post</h3>

                                    <label htmlFor="reportReason">Reason</label>

                                    <select
                                        id="reportReason"
                                        value={reportReason}
                                        onChange={event => setReportReason(event.target.value)}
                                        required
                                    >
                                        <option value="">Select a reason</option>

                                        {reportReasons.map(reason => (
                                            <option key={reason._id} value={reason.reason}>
                                                {reason.reason}
                                            </option>
                                        ))}
                                    </select>

                                    {reportReasons.length === 0 && (
                                        <p>No report reasons are currently available.</p>
                                    )}

                                    <button
                                        type="submit"
                                        className="btn btn-danger"
                                        disabled={reportReasons.length === 0}
                                    >
                                        Report
                                    </button>
                                </form>
                            )}
                        </>
                    ) : (
                        <form className="card create-post-form" onSubmit={updatePost}>
                            <h1>Edit Post</h1>

                            <label>Description</label>
                            <textarea
                                value={description}
                                onChange={event => setDescription(event.target.value)}
                            />

                            <label>Hashtags</label>
                            <input
                                value={hashtags}
                                onChange={event => setHashtags(event.target.value)}
                            />

                            <p>The image cannot be changed when editing a post.</p>

                            <button type="submit" className="btn btn-primary">
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

export default PostPage