import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

import AdminVerification from '../components/AdminVerification';

function AdminPage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('dashboard');

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [albums, setAlbums] = useState([]);
    const [reports, setReports] = useState([]);
    const [reasons, setReasons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [newReason, setNewReason] = useState('');

    useEffect(() => {
        loadAdminData();
    }, []);

    async function loadAdminData() {
        try {
            setLoading(true);
            setError('');

            const responses = await Promise.all([
                fetch('/api/admin/users', { credentials: 'include' }),
                fetch('/api/admin/posts', { credentials: 'include' }),
                fetch('/api/admin/reports', { credentials: 'include' }),
                fetch('/api/admin/albums', { credentials: 'include' }),
                fetch('/api/admin/report-reasons', { credentials: 'include' })
            ]);

            const [
                usersResponse,
                postsResponse,
                reportsResponse,
                albumsResponse,
                reasonsResponse
            ] = responses;

            if (!usersResponse.ok) throw new Error('Could not load users.');
            if (!postsResponse.ok) throw new Error('Could not load posts.');
            if (!reportsResponse.ok) throw new Error('Could not load reports.');
            if (!albumsResponse.ok) throw new Error('Could not load albums.');
            if (!reasonsResponse.ok) throw new Error('Could not load report reasons.');

            const [
                usersData,
                postsData,
                reportsData,
                albumsData,
                reasonsData
            ] = await Promise.all(
                responses.map(response => response.json())
            );

            setUsers(usersData.users || []);
            setPosts(postsData.posts || []);
            setReports(reportsData.reports || []);
            setAlbums(albumsData.albums || []);
            setReasons(reasonsData.reasons || []);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await logout();
        navigate('/');
    }

    function clearMessages() {
        setMessage('');
        setError('');
    }

    function changeSection(section) {
        clearMessages();
        setActiveSection(section);
    }

    async function deleteUser(id) {
        if (id === user?._id) {
            setError('You cannot delete your own admin account.');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not delete user.');
            }

            setUsers(current => current.filter(item => item._id !== id));
            setMessage('User deleted successfully.');
            setError('');
        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    }

    async function deletePost(id) {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/posts/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not delete post.');
            }

            setPosts(current => current.filter(post => post._id !== id));

            setReports(current =>
                current.filter(report =>
                    !(report.targetType === 'post' && report.targetId === id)
                )
            );

            setMessage('Post deleted successfully.');
            setError('');
        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    }

    async function deleteAlbum(id) {
        if (!window.confirm('Are you sure you want to delete this album?')) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/albums/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not delete album.');
            }

            setAlbums(current => current.filter(album => album._id !== id));
            setMessage('Album deleted successfully.');
            setError('');
        } catch (err) {
            setError(err.message);
            setMessage('');
        }
    }

    async function addReason(event) {
        event.preventDefault();
        clearMessages();

        const reason = newReason.trim();

        if (!reason) {
            setError('Please enter a report reason.');
            return;
        }

        try {
            const response = await fetch('/api/admin/report-reasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ reason })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not add report reason.');
            }

            setReasons(current => [...current, data.reason]);
            setNewReason('');
            setMessage('Report reason added successfully.');
        } catch (err) {
            setError(err.message);
        }
    }

    async function deleteReason(reason) {
        const reasonText = typeof reason === 'string'
            ? reason
            : reason.reason;

        const reasonId = typeof reason === 'string'
            ? null
            : reason._id;

        if (!reasonId) {
            setError('This reason has no ID. Refresh the page and try again.');
            return;
        }

        if (!window.confirm(`Delete the report reason "${reasonText}"?`)) {
            return;
        }

        clearMessages();

        try {
            const response = await fetch(
                `/api/admin/report-reasons/${reasonId}`,
                {
                    method: 'DELETE',
                    credentials: 'include'
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Could not delete report reason.');
            }

            setReasons(current =>
                current.filter(item => item._id !== reasonId)
            );

            setMessage('Report reason deleted successfully.');
        } catch (err) {
            setError(err.message);
        }
    }

    const totalUsers = users.length;
    const totalPosts = posts.length;
    const totalAlbums = albums.length;
    const totalReports = reports.length;

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="admin-loading-card">
                    <div className="admin-spinner"></div>
                    <p>Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <div className="admin-brand-icon">🏕️</div>
                    <div>
                        <h1>Woggle</h1>
                        <span>Administration</span>
                    </div>
                </div>

                <nav className="admin-nav">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: '▦' },
                        { id: 'users', label: 'Users', icon: '♙' },
                        { id: 'posts', label: 'Posts', icon: '▤' },
                        { id: 'albums', label: 'Albums', icon: '▣' },
                        { id: 'verification', label: 'Verification', icon: '✓' },
                        { id: 'reports', label: 'Reports', icon: '⚑' },
                        { id: 'reasons', label: 'Report Reasons', icon: '☰' }
                    ].map(item => (
                        <button
                            key={item.id}
                            type="button"
                            className={
                                activeSection === item.id
                                    ? 'admin-nav-item active'
                                    : 'admin-nav-item'
                            }
                            onClick={() => changeSection(item.id)}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-user-card">
                        <div className="admin-avatar">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div className="admin-user-info">
                            <strong>{user?.name || 'Administrator'}</strong>
                            <span>Administrator</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="admin-logout"
                        onClick={handleLogout}
                    >
                        ⇥ <span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <div>
                        <p className="admin-eyebrow">WOGGLE ADMINISTRATION</p>
                        <h2>
                            {{
                                dashboard: 'Dashboard',
                                users: 'Manage Users',
                                posts: 'Manage Posts',
                                albums: 'Manage Albums',
                                verification: 'Verification Requests',
                                reports: 'Reported Content',
                                reasons: 'Report Reasons'
                            }[activeSection]}
                        </h2>
                    </div>

                    <div className="admin-topbar-user">
                        <span>Logged in as</span>
                        <strong>{user?.name}</strong>
                    </div>
                </header>

                {message && <div className="admin-alert success">{message}</div>}
                {error && <div className="admin-alert error">{error}</div>}

                {activeSection === 'dashboard' && (
                    <section className="admin-section">
                        <div className="admin-welcome-card">
                            <div>
                                <p className="admin-card-label">ADMIN OVERVIEW</p>
                                <h3>Welcome back, {user?.name || 'Administrator'}</h3>
                                <p>Manage users, posts, albums and reports from one place.</p>
                            </div>
                            <div className="admin-welcome-icon">🏕️</div>
                        </div>

                        <div className="admin-stats-grid">
                            {[
                                { label: 'Users', count: totalUsers, detail: 'Registered users', section: 'users', icon: '♙', colour: 'purple' },
                                { label: 'Posts', count: totalPosts, detail: 'Total posts', section: 'posts', icon: '▤', colour: 'green' },
                                { label: 'Albums', count: totalAlbums, detail: 'Total albums', section: 'albums', icon: '▣', colour: 'purple' },
                                { label: 'Reports', count: totalReports, detail: 'Submitted reports', section: 'reports', icon: '⚑', colour: 'gold' }
                            ].map(stat => (
                                <button
                                    type="button"
                                    className="admin-stat-card"
                                    key={stat.label}
                                    onClick={() => changeSection(stat.section)}
                                    style={{ cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
                                >
                                    <div className={`admin-stat-icon ${stat.colour}`}>{stat.icon}</div>
                                    <div>
                                        <span>{stat.label}</span>
                                        <strong>{stat.count}</strong>
                                        <small>{stat.detail}</small>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="admin-dashboard-grid">
                            <div className="admin-panel">
                                <div className="admin-panel-header">
                                    <div>
                                        <p className="admin-card-label">USERS</p>
                                        <h3>Recent Users</h3>
                                    </div>
                                    <button type="button" className="admin-small-button" onClick={() => changeSection('users')}>View All</button>
                                </div>

                                {users.length === 0 ? (
                                    <div className="admin-empty">No users found.</div>
                                ) : (
                                    <div className="admin-user-list">
                                        {users.slice(0, 5).map(item => (
                                            <div className="admin-list-row" key={item._id}>
                                                <div className="admin-list-avatar">{item.name?.charAt(0).toUpperCase() || '?'}</div>
                                                <div className="admin-list-info">
                                                    <strong>{item.name || 'Unnamed User'}</strong>
                                                    <span>{item.email}</span>
                                                </div>
                                                <span className={item.isAdmin ? 'admin-badge admin' : 'admin-badge'}>
                                                    {item.isAdmin ? 'Admin' : 'User'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="admin-panel">
                                <div className="admin-panel-header">
                                    <div>
                                        <p className="admin-card-label">POSTS</p>
                                        <h3>Recent Posts</h3>
                                    </div>
                                    <button type="button" className="admin-small-button" onClick={() => changeSection('posts')}>View All</button>
                                </div>

                                {posts.length === 0 ? (
                                    <div className="admin-empty">No posts found.</div>
                                ) : (
                                    <div className="admin-post-list">
                                        {posts.slice(0, 5).map(post => (
                                            <div className="admin-post-row" key={post._id}>
                                                <div className="admin-post-icon">▤</div>
                                                <div className="admin-list-info">
                                                    <strong>{post.title || 'Untitled Post'}</strong>
                                                    <span>{post.author?.name || post.authorId || 'Unknown User'}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                {activeSection === 'users' && (
                    <section className="admin-section">
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">USER MANAGEMENT</p>
                                    <h3>All Users</h3>
                                </div>
                                <span className="admin-count">{users.length} users</span>
                            </div>

                            {users.length === 0 ? (
                                <div className="admin-empty">No users found.</div>
                            ) : (
                                <div className="admin-table-wrapper">
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>User</th><th>Email</th><th>Role</th><th>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {users.map(item => (
                                                <tr key={item._id}>
                                                    <td>
                                                        <div className="admin-table-user">
                                                            <div className="admin-list-avatar">{item.name?.charAt(0).toUpperCase() || '?'}</div>
                                                            <div>
                                                                <strong>{item.name || 'Unnamed User'}</strong>
                                                                <span>{item.username ? `@${item.username}` : ''}</span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{item.email}</td>
                                                    <td>
                                                        <span className={item.isAdmin ? 'admin-badge admin' : 'admin-badge'}>
                                                            {item.isAdmin ? 'Admin' : 'User'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {!item.isAdmin && (
                                                            <button type="button" className="admin-delete-button" onClick={() => deleteUser(item._id)}>
                                                                Delete User
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'posts' && (
                    <section className="admin-section">
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">CONTENT MANAGEMENT</p>
                                    <h3>All Posts</h3>
                                    <p className="admin-panel-description">View and delete posts across Woggle.</p>
                                </div>
                                <span className="admin-count">{posts.length} posts</span>
                            </div>

                            {posts.length === 0 ? (
                                <div className="admin-empty">No posts found.</div>
                            ) : (
                                <div className="admin-reported-list">
                                    {posts.map(post => (
                                        <div className="admin-reported-card" key={post._id}>
                                            <div className="admin-reported-icon">▤</div>
                                            <div className="admin-reported-content">
                                                <div className="admin-reported-top">
                                                    <div>
                                                        <h4>{post.title || 'Untitled Post'}</h4>
                                                        <span>Posted by <strong>{post.author?.name || post.authorId || 'Unknown User'}</strong></span>
                                                    </div>
                                                    <button type="button" className="admin-delete-button" onClick={() => deletePost(post._id)}>Delete Post</button>
                                                </div>

                                                {post.description && <p className="admin-post-description">{post.description}</p>}

                                                {post.hashtags?.length > 0 && (
                                                    <div className="admin-hashtags">
                                                        {post.hashtags.map((tag, index) => <span key={`${tag}-${index}`}>#{tag}</span>)}
                                                    </div>
                                                )}

                                                {post.createdAt && <p className="admin-panel-description">Posted: {new Date(post.createdAt).toLocaleString()}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'albums' && (
                    <section className="admin-section">
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">CONTENT MANAGEMENT</p>
                                    <h3>All Albums</h3>
                                    <p className="admin-panel-description">View and delete albums across Woggle.</p>
                                </div>
                                <span className="admin-count">{albums.length} albums</span>
                            </div>

                            {albums.length === 0 ? (
                                <div className="admin-empty">No albums found.</div>
                            ) : (
                                <div className="admin-reported-list">
                                    {albums.map(album => (
                                        <div className="admin-reported-card" key={album._id}>
                                            <div className="admin-reported-icon">▣</div>
                                            <div className="admin-reported-content">
                                                <div className="admin-reported-top">
                                                    <div>
                                                        <h4>{album.name || album.title || 'Untitled Album'}</h4>
                                                        <span>Created by <strong>{album.owner?.name || album.ownerId || 'Unknown User'}</strong></span>
                                                    </div>
                                                    <button type="button" className="admin-delete-button" onClick={() => deleteAlbum(album._id)}>Delete Album</button>
                                                </div>
                                                {album.description && <p className="admin-post-description">{album.description}</p>}
                                                <p className="admin-post-description">{album.postIds?.length || 0} posts</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'reports' && (
                    <section className="admin-section">
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">MODERATION</p>
                                    <h3>Submitted Reports</h3>
                                    <p className="admin-panel-description">Review reports submitted by users.</p>
                                </div>
                                <span className="admin-count">{reports.length} reports</span>
                            </div>

                            {reports.length === 0 ? (
                                <div className="admin-empty">No reports found.</div>
                            ) : (
                                <div className="admin-reported-list">
                                    {reports.map(report => (
                                        <div className="admin-reported-card" key={report._id}>
                                            <div className="admin-reported-icon">⚑</div>
                                            <div className="admin-reported-content">
                                                <div className="admin-reported-top">
                                                    <div>
                                                        <h4>{report.targetType === 'post' ? 'Reported Post' : 'Reported User'}</h4>
                                                        <span>Reported by <strong>{report.reporter?.name || report.reporterId || 'Unknown User'}</strong></span>
                                                    </div>
                                                    <span className="admin-badge">{report.reason}</span>
                                                </div>

                                                {report.targetType === 'post' && report.target && (
                                                    <div>
                                                        <p><strong>Post:</strong> {report.target.title || 'Untitled Post'}</p>
                                                        <p><strong>Posted by:</strong> {report.target.author?.name || report.target.authorId || 'Unknown User'}</p>
                                                        {report.target.description && <p className="admin-post-description">{report.target.description}</p>}
                                                    </div>
                                                )}

                                                {report.targetType === 'user' && report.target && (
                                                    <div>
                                                        <p><strong>User:</strong> {report.target.name}</p>
                                                        <p><strong>Username:</strong> @{report.target.username}</p>
                                                    </div>
                                                )}

                                                <p><strong>Reason:</strong> {report.reason}</p>
                                                <p><strong>Date:</strong> {report.createdAt ? new Date(report.createdAt).toLocaleString() : 'Unknown'}</p>

                                                {report.targetType === 'post' && report.targetId && (
                                                    <button type="button" className="admin-delete-button" onClick={() => deletePost(report.targetId)}>
                                                        Delete Reported Post
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {activeSection === 'verification' && <AdminVerification />}

                {activeSection === 'reasons' && (
                    <section className="admin-section">
                        <div className="admin-panel">
                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">MODERATION SETTINGS</p>
                                    <h3>Report Reasons</h3>
                                    <p className="admin-panel-description">
                                        Add, view or delete the reasons users can select when reporting content.
                                    </p>
                                </div>
                                <span className="admin-count">{reasons.length} reasons</span>
                            </div>

                            <form className="admin-add-reason" onSubmit={addReason}>
                                <input
                                    type="text"
                                    value={newReason}
                                    onChange={event => setNewReason(event.target.value)}
                                    placeholder="Enter a new report reason"
                                    aria-label="New report reason"
                                    maxLength={100}
                                    required
                                />
                                <button type="submit" className="admin-primary-button">
                                    Add Reason
                                </button>
                            </form>

                            {reasons.length === 0 ? (
                                <div className="admin-empty">No report reasons have been added yet.</div>
                            ) : (
                                <div className="admin-reasons-list">
                                    {reasons.map((reason, index) => (
                                        <div className="admin-reason-row" key={reason._id}>
                                            <div className="admin-reason-number">{index + 1}</div>
                                            <span>{reason.reason}</span>
                                            <button
                                                type="button"
                                                className="admin-delete-button"
                                                onClick={() => deleteReason(reason)}
                                            >
                                                Delete Reason
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default AdminPage;