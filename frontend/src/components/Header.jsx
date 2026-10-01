import { NavLink, Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();


  return (
    <header className="header">
      <div className="header-inner">

        {/* Woggle logo on the left */}
        <Link to="/home" className="header-logo">
          <img src={logo} alt="Woggle" />
        </Link>

        {/* Main navigation */}
        <nav className="header-nav">

          <NavLink
            to="/home"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/search"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Search
          </NavLink>

          <NavLink
            to="/friends"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Friends
          </NavLink>

          <NavLink
            to="/albums"
            className={({ isActive }) =>
              isActive ? 'active' : ''
            }
          >
            Albums
          </NavLink>

        </nav>

        {/* User information on the right */}
        {user && (
          <div className="header-user">

            <Link
              to={`/users/${user._id}`}
              className="header-user-link"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="header-user-image"
                />
              ) : (
                <div className="header-user-avatar">
                  {user.name
                    ? user.name.charAt(0).toUpperCase()
                    : '?'}
                </div>
              )}

              <span className="header-user-name">
                {user.name}
              </span>
            </Link>

          </div>
        )}

      </div>
    </header>
  );
}

export default Header;