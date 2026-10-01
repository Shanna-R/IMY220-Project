import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

function SignupForm() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (
      !form.name ||
      !form.username ||
      !form.email ||
      !form.password
    ) {
      setError('Please complete all fields.');
      return;
    }

    try {
      setLoading(true);

      await signup(form);

      navigate('/home');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="form-card">
      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <label htmlFor="signup-name">
        Full Name
      </label>

      <input
        id="signup-name"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Full name"
      />

      <label htmlFor="signup-username">
        Username
      </label>

      <input
        id="signup-username"
        name="username"
        value={form.username}
        onChange={handleChange}
        placeholder="Username"
      />

      <label htmlFor="signup-email">
        Email
      </label>

      <input
        id="signup-email"
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        placeholder="you@example.com"
      />

      <label htmlFor="signup-password">
        Password
      </label>

      <input
        id="signup-password"
        name="password"
        type="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Password"
      />

      <button
        type="submit"
        className="btn"
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Register'}
      </button>
    </form>
  );
}

export default SignupForm;