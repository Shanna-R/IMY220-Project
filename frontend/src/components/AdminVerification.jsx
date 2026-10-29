import { useEffect, useState } from 'react';

function AdminVerification() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/verification-requests', {
          credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Could not load requests.');
        setRequests(data.users || []);
      } catch (err) {
        setError(err.message);
      }
    }
    load();
  }, []);

  async function decide(id, action) {
    try {
      setError('');
      setMessage('');
      const path = action === 'approve' ? 'verify' : 'reject-verification';

      const response = await fetch(`/api/admin/users/${id}/${path}`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Action failed.');

      setRequests(current => current.filter(item => item._id !== id));
      setMessage(action === 'approve' ? 'User verified.' : 'Request rejected.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section>
      {message && <p className="success-message">{message}</p>}
      {error && <p className="form-error">{error}</p>}

      {requests.length === 0 ? (
        <p>There are no pending verification requests.</p>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Requested</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>@{item.username}</td>
                  <td>{item.email}</td>
                  <td>{item.verificationRequestedAt
                    ? new Date(item.verificationRequestedAt).toLocaleDateString()
                    : '-'}</td>
                  <td>
                    <button type="button" className="admin-small-button" onClick={() => decide(item._id, 'approve')}>
                      Approve
                    </button>{' '}
                    <button type="button" className="admin-small-button" onClick={() => decide(item._id, 'reject')}>
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default AdminVerification;