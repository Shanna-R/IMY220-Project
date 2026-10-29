import { useEffect, useState } from 'react';

function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  async function load() {
    try {
      const response = await fetch('/api/notifications', { credentials: 'include' });
      const data = await response.json();
      if (response.ok) setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Could not load notifications:', err);
    }
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, []);

  const unread = notifications.filter(item => !item.read).length;

  async function toggle() {
    const opening = !open;
    setOpen(opening);

    if (opening && unread > 0) {
      await fetch('/api/notifications/read', { method: 'POST', credentials: 'include' });
      setNotifications(current => current.map(item => ({ ...item, read: true })));
    }
  }

  async function dismiss(id) {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE', credentials: 'include' });
    setNotifications(current => current.filter(item => item._id !== id));
  }

  return (
    <div className="relative">
      <button
          type="button"
          onClick={toggle}
          aria-label={`Notifications (${unread} unread)`}
          className="header-icon relative"
      >
          🔔

          {unread > 0 && (
              <span className="notification-count">
                  {unread}
              </span>
          )}
      </button>

      {open && (
        <div className="notification-dropdown">
            <h3>Notifications</h3>

            {notifications.length === 0 ? (
                <p className="notification-empty">
                    You have no notifications.
                </p>
            ) : (
                <ul className="notification-dropdown-list">
                    {notifications.map(item => (
                        <li
                            key={item._id}
                            className={`notification ${
                                item.read ? '' : 'unread'
                            }`}
                        >
                            <div className="notification-content">
                                <p>{item.message}</p>

                                <small>
                                    {new Date(item.createdAt).toLocaleString()}
                                </small>
                            </div>

                            <button
                                type="button"
                                className="notification-dismiss"
                                onClick={() => dismiss(item._id)}
                            >
                                Dismiss
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )}
    </div>
  );
}

export default NotificationBell;