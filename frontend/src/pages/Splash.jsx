import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignUpForm';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/splash-logo.jpeg';

function Splash() {
  const { user, loading } = useAuth();

  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    // Only set up animations when the splash page should be displayed.
    if (loading || user)
    {
      return;
    }

    const revealElements = document.querySelectorAll('.splash-reveal');
    const logo = document.querySelector('.splash-logo');

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || !('IntersectionObserver' in window))
    {
      revealElements.forEach((element) => {
        element.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });

    function handleScroll() {
      if (logo) {
        const offset = Math.min(window.scrollY * 0.12, 35);
        logo.style.setProperty('--parallax-y', `${offset}px`);
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, user]);

  // Wait until we know whether someone is logged in.
  if (loading) {
    return (
      <main className="splash-page">
        <div className="auth-section">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  // Admin users have their own completely separate area.
  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  // Normal users go to the normal User website.
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <main className="splash-page">

      <section className="splash-hero splash-reveal">

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

      <section className="auth-section splash-reveal">

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

      <section className="splash-content splash-reveal">

        <h2>
          Share Your Adventure
        </h2>

        <p>
          Capture your scouting experiences, connect with
          friends and discover adventures from the Woggle
          community.
        </p>

        <div className="feature-grid">

          <div className="splash-reveal">
            <span>📸</span>
            <h3>Share</h3>
            <p>
              Share photos and stories from your adventures.
            </p>
          </div>

          <div className="splash-reveal">
            <span>🏕️</span>
            <h3>Explore</h3>
            <p>
              Discover camps, hikes and scouting adventures.
            </p>
          </div>

          <div className="splash-reveal">
            <span>🤝</span>
            <h3>Connect</h3>
            <p>
              Connect with other scouts and friends.
            </p>
          </div>

        </div>

      </section>

      <footer className="splash-footer splash-reveal">
        <p>Woggle</p>
        <p>Where Scouting Meets Modern Adventure</p>
      </footer>

    </main>
  );
}

export default Splash;