import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { USER_ROLES } from '../constants/api';
import './Login.css';
import Toast from './ui/Toast';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const navigate = useNavigate();

  // Check if user is already authenticated and redirect accordingly
  useEffect(() => {
    if (authService.isAuthenticated()) {
      const role = authService.getRole();
      if (role === USER_ROLES.SUPERADMIN) {
        navigate('/superadmin', { replace: true });
      } else if (role === USER_ROLES.ADMIN) {
        navigate('/admin', { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { role } = await authService.login(formData.email, formData.password);
      
      // Redirect based on role
      if (role === USER_ROLES.SUPERADMIN) {
        navigate('/superadmin');
      } else if (role === USER_ROLES.ADMIN) {
        navigate('/admin');
      } else {
        setError(`Invalid role: ${role}. Expected 'admin' or 'superAdmin'`);
        setToast({ message: `Invalid role: ${role}`, type: 'error' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      setToast({ message: error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Dashboard Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Test credentials box removed */}
      </div>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
};

export default Login;
