import { useState } from 'react';

function SignUpForm({ onSuccess }) {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] =
    useState({});

  const [message, setMessage] =
    useState('');

  function update(field, value) {
    setForm({
      ...form,
      [field]: value
    });
  }

  function validate() {
    const newErrors = {};

    if (!form.fullName.trim()) {
      newErrors.fullName =
        'Full name is required.';
    }

    if (!form.username.trim()) {
      newErrors.username =
        'Username is required.';
    }

    if (!form.email.trim()) {
      newErrors.email =
        'Email is required.';
    } else if (
      !form.email.includes('@')
    ) {
      newErrors.email =
        'Enter a valid email.';
    }

    if (!form.password) {
      newErrors.password =
        'Password is required.';
    } else if (
      form.password.length < 6
    ) {
      newErrors.password =
        'Password must be at least 6 characters.';
    }

    if (
      form.password !==
      form.confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwords do not match.';
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
        'http://localhost:5000/api/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
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

      <h2>Sign Up</h2>

      <label>Full Name</label>
      <input
        value={form.fullName}
        onChange={(e) =>
          update('fullName', e.target.value)
        }
      />

      {errors.fullName && (
        <p className="form-error">
          {errors.fullName}
        </p>
      )}

      <label>Username</label>
      <input
        value={form.username}
        onChange={(e) =>
          update('username', e.target.value)
        }
      />

      {errors.username && (
        <p className="form-error">
          {errors.username}
        </p>
      )}

      <label>Email</label>
      <input
        type="email"
        value={form.email}
        onChange={(e) =>
          update('email', e.target.value)
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
        value={form.password}
        onChange={(e) =>
          update('password', e.target.value)
        }
      />

      {errors.password && (
        <p className="form-error">
          {errors.password}
        </p>
      )}

      <label>Confirm Password</label>
      <input
        type="password"
        value={form.confirmPassword}
        onChange={(e) =>
          update(
            'confirmPassword',
            e.target.value
          )
        }
      />

      {errors.confirmPassword && (
        <p className="form-error">
          {errors.confirmPassword}
        </p>
      )}

      <button
        className="btn btn-primary"
        type="submit"
      >
        Sign Up
      </button>

      {message && <p>{message}</p>}

    </form>
  );
}

export default SignUpForm;