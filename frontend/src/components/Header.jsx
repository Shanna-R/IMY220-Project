import { Link } from 'react-router-dom';
import '../index.css';

function Header() {
  const userId = 1;

  return (
    <header className="header">
      <Link to="/home" className="header-logo">
        Woggle
      </Link>

      <nav className="header-nav">
        <Link to="/home">Home</Link>
        <Link to="/home">Explore</Link>
        <Link to="/home">Albums</Link>
        <Link to="/friends">Friends</Link>
        <Link to={`/profile/${userId}`}>Profile</Link>
        <Link to="/home">Notifications</Link>
        <Link to="/search">Search</Link>
      </nav>
    </header>
  );
}

export default Header;