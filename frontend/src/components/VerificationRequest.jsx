import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function VerificationRequest() {
  const { user } = useAuth();
  const [status, setStatus] = useState(user?.verificationStatus || 'none');
  const [error, setError] = useState('');

  async function requestVerification() {
    try {
      setError('');
      const response = await fetch('/api/verification-request', {
        method: 'POST',
        credentials: 'include'
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Request failed.');
      setStatus('pending');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="mt-3">
      {error && <p className="form-error">{error}</p>}

      {status === 'pending' ? (
        <p className="text-sm">Your verification request is awaiting admin review.</p>
      ) : (
        <>
          {status === 'rejected' && (
            <p className="text-sm">Your last request was not approved. You may request again.</p>
          )}
          <button type="button" className="btn btn-outline" onClick={requestVerification}>
            Request verification
          </button>
        </>
      )}
    </div>
  );
}

export default VerificationRequest;