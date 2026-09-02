import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';
import { useState } from 'react';

function Splash() {
  const navigate = useNavigate();

  const [form, setForm] =
    useState(null);

  return (
    <main className="splash-page">

      <section className="splash-hero">

        <div className="splash-logo">
          🏕️ Woggle
        </div>

        <h1>
          Where Scouting Meets
          Modern Adventure
        </h1>

        <p>
          An exclusive social platform designed
          for Scouts to share camp memories,
          outdoor hikes, achievements,
          and lifetime bonds.
        </p>

        <div className="splash-buttons">

          <button
            className="btn btn-primary"
            onClick={() => setForm('login')}
          >
            Login
          </button>

          <button
            className="btn btn-outline"
            onClick={() => setForm('signup')}
          >
            Sign Up
          </button>

        </div>

      </section>

      {form && (
        <section className="auth-section">

          {form === 'login' ? (
            <LoginForm
              onSuccess={() => navigate('/home')}
            />
          ) : (
            <SignUpForm
              onSuccess={() => navigate('/home')}
            />
          )}

          <button
            className="switch-form"
            onClick={() =>
              setForm(
                form === 'login'
                  ? 'signup'
                  : 'login'
              )
            }
          >
            {form === 'login'
              ? 'Need an account? Sign Up'
              : 'Already have an account? Login'}
          </button>

        </section>
      )}

      <section className="splash-content">

        <h2>Be Prepared to Share</h2>

        <p>
          Woggle connects the global Scouting
          community. Share hikes, camps,
          community service, badges and
          unforgettable memories.
        </p>

        <div className="feature-grid">

          <div>
            <span>🏕️</span>
            <h3>Share Adventures</h3>
            <p>Share camps and outdoor adventures.</p>
          </div>

          <div>
            <span>📷</span>
            <h3>Upload Photos</h3>
            <p>Preserve your favourite memories.</p>
          </div>

          <div>
            <span>🏅</span>
            <h3>Celebrate Achievements</h3>
            <p>Showcase your badges and awards.</p>
          </div>

          <div>
            <span>🤝</span>
            <h3>Connect with Friends</h3>
            <p>Connect with fellow Scouts.</p>
          </div>

          <div>
            <span>📁</span>
            <h3>Organise Albums</h3>
            <p>Keep your adventures organised.</p>
          </div>

        </div>

      </section>

      <footer className="splash-footer">
        <p>
          About Woggle • Privacy Policy •
          Terms of Service • Contact Scouts Support
        </p>

        <p>
          © 2026 Woggle Social
        </p>
      </footer>

    </main>
  );
}

export default Splash;