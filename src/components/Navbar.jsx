import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { USER_ROLES } from '../constants/api';
import './Navbar.css';
import Badge from './ui/Badge';
import Modal from './ui/Modal';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const doLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleLogout = () => {
    setConfirmLogout(true);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getNavItems = () => {
    const userRole = authService.getRole();
    
    if (userRole === USER_ROLES.SUPERADMIN) {
      return [
        { path: '/superadmin', label: 'Dashboard', icon: '🏠' },
        { path: '/superadmin/signup', label: 'Signup', icon: '👥' },
        { path: '/superadmin/transactions', label: 'Transactions', icon: '📊' },
        { path: '/superadmin/payouts', label: 'Payouts', icon: '💰' },
        { path: '/admin', label: 'Admin Features', icon: '🔧' },
      ];
    } else {
      return [
        { path: '/admin', label: 'Dashboard', icon: '🏠' },
        { path: '/admin/transactions', label: 'Transactions', icon: '📊' },
        { path: '/admin/payouts', label: 'Payouts', icon: '💰' },
        { path: '/admin/payins', label: 'Payins', icon: '💳' },
        { path: '/admin/payments', label: 'Payments', icon: '🔗' },
      ];
    }
  };

  const navItems = getNavItems();

  const getDashboardTitle = () => {
    const userRole = authService.getRole();
    return userRole === USER_ROLES.SUPERADMIN ? 'Superadmin Dashboard' : 'Admin Dashboard';
  };

  const handleNavigate = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <button className="menu-trigger" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle navigation">☰</button>
        <h2>{getDashboardTitle()}</h2>
        <Badge tone={authService.getRole() === USER_ROLES.SUPERADMIN ? 'warning' : 'success'}>
          {authService.getRole() === USER_ROLES.SUPERADMIN ? 'Superadmin' : 'Admin'}
        </Badge>
      </div>
      
      <div className={`navbar-nav ${menuOpen ? 'open' : ''}`}>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </div>
      
      <div className="navbar-actions">
        <div className="profile" onBlur={() => setOpen(false)} tabIndex={0}>
          <button className="profile-trigger" onClick={() => setOpen((v) => !v)}>
            <span className="avatar" aria-hidden>🧑‍💼</span>
            <span className="profile-label">Account</span>
          </button>
          {open && (
            <div className="profile-menu">
              <button className="profile-item" onClick={() => { setOpen(false); navigate('/admin'); }}>Dashboard</button>
              <button className="profile-item" onClick={() => { setOpen(false); }}>Profile</button>
              <button className="profile-item" onClick={() => { setOpen(false); }}>Settings</button>
            </div>
          )}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          <span className="logout-icon">🚪</span>
          Logout
        </button>
      </div>
      <Modal 
        open={confirmLogout}
        title="Confirm Logout"
        confirmText="Logout"
        cancelText="Cancel"
        danger
        onConfirm={() => { setConfirmLogout(false); doLogout(); }}
        onCancel={() => setConfirmLogout(false)}
      >
        Are you sure you want to log out?
      </Modal>
    </nav>
  );
}

export default Navbar;
