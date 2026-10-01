import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminPage()
{
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [activeSection, setActiveSection] = useState('dashboard');

    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [reports, setReports] = useState([]);

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [newReason, setNewReason] = useState('');

    useEffect(() =>
    {
        loadAdminData();
    }, []);


    async function loadAdminData()
    {
        try
        {
            setLoading(true);
            setError('');

            const [
                usersResponse,
                postsResponse,
                reportsResponse
            ] = await Promise.all([
                fetch('/api/admin/users', {
                    credentials: 'include'
                }),

                fetch('/api/admin/posts', {
                    credentials: 'include'
                }),

                fetch('/api/admin/reports', {
                    credentials: 'include'
                })
            ]);

            if (!usersResponse.ok)
            {
                throw new Error(
                    'Could not load users.'
                );
            }

            if (!postsResponse.ok)
            {
                throw new Error(
                    'Could not load posts.'
                );
            }

            if (!reportsResponse.ok)
            {
                throw new Error(
                    'Could not load reports.'
                );
            }

            const usersData =
                await usersResponse.json();

            const postsData =
                await postsResponse.json();

            const reportsData =
                await reportsResponse.json();

            setUsers(
                usersData.users || []
            );

            setPosts(
                postsData.posts || []
            );

            setReports(
                reportsData.reports || []
            );
        }
        catch (err)
        {
            console.error(err);
            setError(err.message);
        }
        finally
        {
            setLoading(false);
        }
    }


    async function handleLogout()
    {
        await logout();
        navigate('/');
    }

    async function deleteUser(id)
    {
        const confirmed = window.confirm(
            'Are you sure you want to delete this user?'
        );

        if (!confirmed)
        {
            return;
        }

        try
        {
            const response = await fetch(`/api/admin/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok)
            {
                throw new Error(data.message || 'Could not delete user.');
            }

            setUsers(users.filter(currentUser => currentUser._id !== id));
            setMessage('User deleted successfully.');
        }
        catch (err)
        {
            setError(err.message);
        }
    }

    async function deletePost(id)
    {
        const confirmed = window.confirm(
            'Are you sure you want to delete this post?'
        );

        if (!confirmed)
        {
            return;
        }

        try
        {
            const response = await fetch(`/api/admin/posts/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok)
            {
                throw new Error(data.message || 'Could not delete post.');
            }

            setPosts(posts.filter(post => post._id !== id));
            setMessage('Post deleted successfully.');
        }
        catch (err)
        {
            setError(err.message);
        }
    }

    async function addReason(event)
    {
        event.preventDefault();

        if (!newReason.trim())
        {
            return;
        }

        try
        {
            const response = await fetch('/api/admin/report-reasons', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    reason: newReason.trim()
                })
            });

            const data = await response.json();

            if (!response.ok)
            {
                throw new Error(
                    data.message || 'Could not add report reason.'
                );
            }

            setReasons([...reasons, data.reason]);
            setNewReason('');
            setMessage('Report reason added successfully.');
        }
        catch (err)
        {
            setError(err.message);
        }
    }

    function clearMessages()
    {
        setMessage('');
        setError('');
    }

    function changeSection(section)
    {
        clearMessages();
        setActiveSection(section);
    }

    const totalUsers = users.length;
    const totalPosts = posts.length;
    const totalReports = reports.length;

    if (loading)
    {
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

            {/* SIDEBAR */}
            <aside className="admin-sidebar">

                <div className="admin-brand">
                    <div className="admin-brand-icon">
                        🏕️
                    </div>

                    <div>
                        <h1>Woggle</h1>
                        <span>Administration</span>
                    </div>
                </div>

                <nav className="admin-nav">

                    <button
                        type="button"
                        className={
                            activeSection === 'dashboard'
                                ? 'admin-nav-item active'
                                : 'admin-nav-item'
                        }
                        onClick={() => changeSection('dashboard')}
                    >
                        <span className="admin-nav-icon">▦</span>
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'users'
                                ? 'admin-nav-item active'
                                : 'admin-nav-item'
                        }
                        onClick={() => changeSection('users')}
                    >
                        <span className="admin-nav-icon">♙</span>
                        Users
                    </button>

                    <button
                        type="button"
                        className={
                            activeSection === 'reports'
                                ? 'admin-nav-item active'
                                : 'admin-nav-item'
                        }
                        onClick={() => changeSection('reports')}
                    >
                        <span className="admin-nav-icon">⚑</span>
                        Reports
                    </button>

                </nav>

                <div className="admin-sidebar-bottom">

                    <div className="admin-user-card">

                        <div className="admin-avatar">
                            {user?.name
                                ? user.name.charAt(0).toUpperCase()
                                : 'A'}
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
                        ⇥
                        <span>Logout</span>
                    </button>

                </div>

            </aside>

            {/* MAIN ADMIN AREA */}
            <main className="admin-main">

                <header className="admin-topbar">

                    <div>
                        <p className="admin-eyebrow">
                            WOGGLE ADMINISTRATION
                        </p>

                        <h2>
                            {activeSection === 'dashboard' && 'Dashboard'}
                            {activeSection === 'users' && 'Users'}
                            {activeSection === 'posts' && 'Reported Posts'}
                            {activeSection === 'reasons' && 'Reports'}
                        </h2>
                    </div>

                    <div className="admin-topbar-user">
                        <span>Logged in as</span>
                        <strong>{user?.name}</strong>
                    </div>

                </header>

                {message && (
                    <div className="admin-alert success">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="admin-alert error">
                        {error}
                    </div>
                )}

                {/* DASHBOARD */}
                {activeSection === 'dashboard' && (
                    <section className="admin-section">

                        <div className="admin-welcome-card">

                            <div>
                                <p className="admin-card-label">
                                    ADMIN OVERVIEW
                                </p>

                                <h3>
                                    Welcome back, {user?.name || 'Administrator'}
                                </h3>

                                <p>
                                    Manage Woggle users, posts and report
                                    settings from this dashboard.
                                </p>
                            </div>

                            <div className="admin-welcome-icon">
                                🏕️
                            </div>

                        </div>

                        <div className="admin-stats-grid">

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon purple">
                                    ♙
                                </div>

                                <div>
                                    <span>Users</span>
                                    <strong>{totalUsers}</strong>
                                    <small>Registered users</small>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon green">
                                    ▤
                                </div>

                                <div>
                                    <span>Posts</span>
                                    <strong>{totalPosts}</strong>
                                    <small>Total posts</small>
                                </div>
                            </div>

                            <div className="admin-stat-card">
                                <div className="admin-stat-icon gold">
                                    ⚑
                                </div>

                                <div>
                                    <span>Reports</span>
                                    <strong>{totalReports}</strong>
                                    <small>Total reports</small>
                                </div>
                            </div>

                        </div>

                        <div className="admin-dashboard-grid">

                            <div className="admin-panel">

                                <div className="admin-panel-header">
                                    <div>
                                        <p className="admin-card-label">
                                            USERS
                                        </p>

                                        <h3>Manage Users</h3>
                                    </div>

                                    <button
                                        type="button"
                                        className="admin-small-button"
                                        onClick={() =>
                                            changeSection('users')
                                        }
                                    >
                                        View All
                                    </button>
                                </div>

                                {users.length === 0 ? (
                                    <div className="admin-empty">
                                        No users found.
                                    </div>
                                ) : (
                                    <div className="admin-user-list">

                                        {users.slice(0, 5).map(currentUser => (
                                            <div
                                                className="admin-list-row"
                                                key={currentUser._id}
                                            >

                                                <div className="admin-list-avatar">
                                                    {currentUser.name
                                                        ? currentUser.name
                                                            .charAt(0)
                                                            .toUpperCase()
                                                        : '?'}
                                                </div>

                                                <div className="admin-list-info">
                                                    <strong>
                                                        {currentUser.name}
                                                    </strong>

                                                    <span>
                                                        {currentUser.email}
                                                    </span>
                                                </div>

                                                <span
                                                    className={
                                                        currentUser.isAdmin
                                                            ? 'admin-badge admin'
                                                            : 'admin-badge'
                                                    }
                                                >
                                                    {currentUser.isAdmin
                                                        ? 'Admin'
                                                        : 'User'}
                                                </span>

                                            </div>
                                        ))}

                                    </div>
                                )}

                            </div>

                            <div className="admin-panel">

                                <div className="admin-panel-header">
                                    <div>
                                        <p className="admin-card-label">
                                            POSTS
                                        </p>

                                        <h3>Recent Activity</h3>
                                    </div>

                                    <button
                                        type="button"
                                        className="admin-small-button"
                                        onClick={() =>
                                            changeSection('posts')
                                        }
                                    >
                                        View All
                                    </button>
                                </div>

                                {posts.length === 0 ? (
                                    <div className="admin-empty">
                                        No posts found.
                                    </div>
                                ) : (
                                    <div className="admin-post-list">

                                        {posts.slice(0, 5).map(post => (
                                            <div
                                                className="admin-post-row"
                                                key={post._id}
                                            >

                                                <div className="admin-post-icon">
                                                    ▤
                                                </div>

                                                <div className="admin-list-info">
                                                    <strong>
                                                        {post.title ||
                                                            'Untitled Post'}
                                                    </strong>

                                                    <span>
                                                        {post.author?.name ||
                                                            post.authorId ||
                                                            'Unknown User'}
                                                    </span>
                                                </div>

                                            </div>
                                        ))}

                                    </div>
                                )}

                            </div>

                        </div>

                    </section>
                )}

                {/* USERS */}
                {activeSection === 'users' && (
                    <section className="admin-section">

                        <div className="admin-panel">

                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">
                                        USER MANAGEMENT
                                    </p>

                                    <h3>All Users</h3>
                                </div>

                                <span className="admin-count">
                                    {users.length} users
                                </span>
                            </div>

                            {users.length === 0 ? (
                                <div className="admin-empty">
                                    No users found.
                                </div>
                            ) : (
                                <div className="admin-table-wrapper">

                                    <table className="admin-table">

                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>

                                        <tbody>

                                            {users.map(currentUser => (
                                                <tr key={currentUser._id}>

                                                    <td>
                                                        <div className="admin-table-user">

                                                            <div className="admin-list-avatar">
                                                                {currentUser.name
                                                                    ? currentUser.name
                                                                        .charAt(0)
                                                                        .toUpperCase()
                                                                    : '?'}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {currentUser.name}
                                                                </strong>

                                                                <span>
                                                                    {currentUser.username
                                                                        ? `@${currentUser.username}`
                                                                        : ''}
                                                                </span>
                                                            </div>

                                                        </div>
                                                    </td>

                                                    <td>
                                                        {currentUser.email}
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={
                                                                currentUser.isAdmin
                                                                    ? 'admin-badge admin'
                                                                    : 'admin-badge'
                                                            }
                                                        >
                                                            {currentUser.isAdmin
                                                                ? 'Admin'
                                                                : 'User'}
                                                        </span>
                                                    </td>

                                                    <td>

                                                        {!currentUser.isAdmin && (
                                                            <button
                                                                type="button"
                                                                className="admin-delete-button"
                                                                onClick={() =>
                                                                    deleteUser(
                                                                        currentUser._id
                                                                    )
                                                                }
                                                            >
                                                                Delete
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

                {/* POSTS */}
                {activeSection === 'posts' && (
                    <section className="admin-section">

                        <div className="admin-panel">

                            <div className="admin-panel-header">
                                <div>
                                    <p className="admin-card-label">
                                        MODERATION
                                    </p>

                                    <h3>Reported Posts</h3>
                                </div>

                                <span className="admin-count">
                                    {posts.length} posts
                                </span>
                            </div>

                            {posts.length === 0 ? (
                                <div className="admin-empty">
                                    No posts found.
                                </div>
                            ) : (
                                <div className="admin-reported-list">

                                    {posts.map(post => (
                                        <div
                                            className="admin-reported-card"
                                            key={post._id}
                                        >

                                            <div className="admin-reported-icon">
                                                ⚑
                                            </div>

                                            <div className="admin-reported-content">

                                                <div className="admin-reported-top">

                                                    <div>
                                                        <h4>
                                                            {post.title ||
                                                                'Untitled Post'}
                                                        </h4>

                                                        <span>
                                                            Posted by{' '}
                                                            <strong>
                                                                {post.author?.name ||
                                                                    post.authorId ||
                                                                    'Unknown User'}
                                                            </strong>
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className="admin-delete-button"
                                                        onClick={() =>
                                                            deletePost(post._id)
                                                        }
                                                    >
                                                        Delete Post
                                                    </button>

                                                </div>

                                                {post.description && (
                                                    <p className="admin-post-description">
                                                        {post.description}
                                                    </p>
                                                )}

                                                {post.hashtags &&
                                                    post.hashtags.length > 0 && (
                                                        <div className="admin-hashtags">
                                                            {post.hashtags.map(
                                                                hashtag => (
                                                                    <span
                                                                        key={hashtag}
                                                                    >
                                                                        #{hashtag}
                                                                    </span>
                                                                )
                                                            )}
                                                        </div>
                                                    )}

                                            </div>

                                        </div>
                                    ))}

                                </div>
                            )}

                        </div>

                    </section>
                )}


                {/* REPORTS */}
                {activeSection === 'reports' && (
                    <section className="admin-section">

                        <div className="admin-panel">

                            <div className="admin-panel-header">

                                <div>
                                    <p className="admin-card-label">
                                        MODERATION
                                    </p>

                                    <h3>
                                        Submitted Reports
                                    </h3>

                                    <p className="admin-panel-description">
                                        View reports submitted by Users.
                                    </p>
                                </div>

                                <span className="admin-count">
                                    {reports.length} reports
                                </span>

                            </div>

                            {reports.length === 0 ? (

                                <div className="admin-empty">
                                    No reports found.
                                </div>

                            ) : (

                                <div className="admin-reported-list">

                                    {reports.map(report => (

                                        <div
                                            className="admin-reported-card"
                                            key={report._id}
                                        >

                                            <div className="admin-reported-icon">
                                                ⚑
                                            </div>

                                            <div className="admin-reported-content">

                                                <div className="admin-reported-top">

                                                    <div>

                                                        <h4>
                                                            {report.targetType === 'post'
                                                                ? 'Reported Post'
                                                                : 'Reported User'}
                                                        </h4>

                                                        <span>
                                                            Reported by{' '}
                                                            <strong>
                                                                {report.reporter?.name ||
                                                                    report.reporterId ||
                                                                    'Unknown User'}
                                                            </strong>
                                                        </span>

                                                    </div>

                                                    <span className="admin-badge">
                                                        {report.reason}
                                                    </span>

                                                </div>

                                                {report.targetType === 'post' &&
                                                    report.target && (
                                                        <div>

                                                            <p>
                                                                <strong>
                                                                    Post:
                                                                </strong>{' '}
                                                                {report.target.title ||
                                                                    'Untitled Post'}
                                                            </p>

                                                            <p>
                                                                <strong>
                                                                    Posted by:
                                                                </strong>{' '}
                                                                {report.target.author?.name ||
                                                                    report.target.authorId ||
                                                                    'Unknown User'}
                                                            </p>

                                                            {report.target.description && (
                                                                <p className="admin-post-description">
                                                                    {report.target.description}
                                                                </p>
                                                            )}

                                                        </div>
                                                    )}

                                                {report.targetType === 'user' &&
                                                    report.target && (
                                                        <div>

                                                            <p>
                                                                <strong>
                                                                    User:
                                                                </strong>{' '}
                                                                {report.target.name}
                                                            </p>

                                                            <p>
                                                                <strong>
                                                                    Username:
                                                                </strong>{' '}
                                                                @{report.target.username}
                                                            </p>

                                                        </div>
                                                    )}

                                                <p>
                                                    <strong>
                                                        Reason:
                                                    </strong>{' '}
                                                    {report.reason}
                                                </p>

                                                <p>
                                                    <strong>
                                                        Date:
                                                    </strong>{' '}
                                                    {new Date(
                                                        report.createdAt
                                                    ).toLocaleString()}
                                                </p>

                                            </div>

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