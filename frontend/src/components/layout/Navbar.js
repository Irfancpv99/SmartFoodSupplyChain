import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'vendor':
        return '/vendor';
      case 'school':
        return '/school';
      case 'admin':
        return '/school';
      default:
        return '/';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          {config.appName}
        </Link>
        
        <ul className="navbar-links">
          <li><Link to="/verify">Verify Menu</Link></li>
          {user && (
            <>
              <li><Link to={getDashboardLink()}>Dashboard</Link></li>
              {user.role === 'vendor' && (
                <li><Link to="/vendor/upload">Upload Document</Link></li>
              )}
              {(user.role === 'school' || user.role === 'admin') && (
                <>
                  <li><Link to="/school/menus">Menus</Link></li>
                  <li><Link to="/school/menus/create">Create Menu</Link></li>
                </>
              )}
            </>
          )}
        </ul>

        <div className="navbar-user">
          {user ? (
            <>
              <span>{user.username} ({user.role})</span>
              <button className="btn btn-secondary" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login">
              <button className="btn btn-primary">Login</button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
