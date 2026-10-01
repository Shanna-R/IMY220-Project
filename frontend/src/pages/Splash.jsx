import { useState } from 'react';
import { Navigate } from 'react-router-dom';

import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignUpForm';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/splash-logo.jpeg';

function Splash() {
  const { user } = useAuth();

  const [showSignup, setShowSignup] = useState(false);

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="splash-page">

      <section className="splash-hero">

        <div className="splash-logo">
          <img src={logo} alt="Woggle-Logo" />
        </div>

        <h1>
          Where Scouting Meets Modern Adventure
        </h1>

        <p>
          Share your camps, hikes, badges and adventures
          with the scouting community.
        </p>

        <div className="splash-buttons">
          <button
            className="btn btn-primary"
            onClick={() => setShowSignup(false)}
          >
            Login
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setShowSignup(true)}
          >
            Create Account
          </button>
        </div>

      </section>

      <section className="auth-section">

        {!showSignup ? (
          <>
            <LoginForm />

            <button
              className="switch-form"
              onClick={() => setShowSignup(true)}
            >
              Don't have an account? Create one
            </button>
          </>
        ) : (
          <>
            <SignupForm />

            <button
              className="switch-form"
              onClick={() => setShowSignup(false)}
            >
              Already have an account? Back to Login
            </button>
          </>
        )}

      </section>

      <section className="splash-content">

        <h2>
          Share Your Adventure
        </h2>

        <p>
          Capture your scouting experiences, connect with
          friends and discover adventures from the Woggle
          community.
        </p>

        <div className="feature-grid">

          <div>
            <span>📸</span>
            <h3>Share</h3>
            <p>
              Share photos and stories from your adventures.
            </p>
          </div>

          <div>
            <span>🏕️</span>
            <h3>Explore</h3>
            <p>
              Discover camps, hikes and scouting adventures.
            </p>
          </div>

          <div>
            <span>🤝</span>
            <h3>Connect</h3>
            <p>
              Connect with other scouts and friends.
            </p>
          </div>

        </div>

      </section>

      <footer className="splash-footer">
        <p>Woggle</p>
        <p>Where Scouting Meets Modern Adventure</p>
      </footer>

    </main>
  );
}

export default Splash;