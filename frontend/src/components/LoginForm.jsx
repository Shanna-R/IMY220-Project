import { useState } from 'react';

function LoginForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  function validate() {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    }

    if (!password) {
      newErrors.password =
        'Password is required.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:5000/api/auth/signin',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      setMessage(data.message);

      if (data.success && onSuccess) {
        onSuccess();
      }

    } catch (error) {
      setMessage(
        'Could not connect to the server.'
      );
    }
  }

  return (
    <form
      className="card auth-form"
      onSubmit={handleSubmit}
    >

      <h2>Login</h2>

      <label>Email</label>

      <input
        type="email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      {errors.email && (
        <p className="form-error">
          {errors.email}
        </p>
      )}

      <label>Password</label>

      <input
        type="password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      {errors.password && (
        <p className="form-error">
          {errors.password}
        </p>
      )}

      <button
        className="btn btn-primary"
        type="submit"
      >
        Login
      </button>

      {message && (
        <p>{message}</p>
      )}

    </form>
  );
}

export default LoginForm;