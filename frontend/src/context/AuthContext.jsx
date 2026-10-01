import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function checkLogin() {
    try
    {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });

        if(!response.ok)
        {
            setUser(null);
            return;
        }

        const data = await response.json();
        setUser(data.user || null);
    }
    catch (error)
    {
      console.error('Error checking login:', error);
      setUser(null);
    }
    finally
    {
      setLoading(false);
    }
  }

  useEffect(() => {
    checkLogin();
  }, []);

  async function login(email, password) {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email,
        password
      })
    });

    const data = await response.json();

    if(!response.ok)
    {
      throw new Error(data.error || 'Login failed.');
    }

    setUser(data.user);
    return data;
  }

  async function signup(userData) {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if(!response.ok)
    {
      throw new Error(data.error || 'Registration failed.');
    }

    setUser(data.user);
    return data;
  }

  async function logout() {
    try
    {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    }
    catch(error)
    {
      console.error('Logout error:', error);
    }

    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        checkLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}