import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

function Header() {
  return (
    <header className="header">
      <div className="header-inner">

        {/* Logo */}
        <Link to="/home" className="header-logo">
          <img src={logo} alt="Woggle Logo" />
        </Link>

        {/* Navigation */}
        <nav className="header-nav">
          <Link to="/home">Home</Link>
          <Link to="/search">Explore</Link>
          <Link to="/albums">Albums</Link>
          <Link to="/friends">Friends</Link>
        </nav>

        {/* Right side */}
        <div className="header-actions">
          <Link to="/notifications" className="notification-link">
            🔔
          </Link>

          <Link to="/profile/23532" className="profile-bubble">
            <span className="profile-avatar">S</span>
            <span className="profile-name">Shanna</span>
          </Link>
        </div>

      </div>
    </header>
  );
}

export default Header;